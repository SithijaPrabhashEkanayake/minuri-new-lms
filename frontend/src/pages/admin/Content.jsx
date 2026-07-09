import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function Content() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('11');
  const [selectedClassType, setSelectedClassType] = useState('Theory');
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);
  const [modules, setModules] = useState([]);
  
  const thumbInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch real modules from Postgres
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/modules`)
      .then(res => res.json())
      .then(data => {
        setModules(data);
      })
      .catch(err => console.error('Error fetching modules:', err));
  }, []);



  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!user?.token) {
      alert('You must be logged in to upload content.');
      return;
    }
    if (!title || !thumbnail || !video) {
      alert('Please fill in all fields (Title, Reference Image, and Video).');
      return;
    }

    const targetModuleTitle = `GRADE ${selectedGrade} ${selectedClassType.toUpperCase()}`;
    const selectedModule = modules.find(m => m.title.toUpperCase() === targetModuleTitle);

    if (!selectedModule) {
      alert(`Error: The catalog "${targetModuleTitle}" does not exist in the system. Please ensure the catalogs have been correctly set up.`);
      return;
    }

    let moduleIdToUpload = selectedModule.id;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get secure AWS S3 upload credentials from our backend
      const credResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/video/upload-credentials`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ title })
      });
      
      if (!credResponse.ok) {
        const errorData = await credResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get upload credentials');
      }
      
      const credData = await credResponse.json();
      const { clientPayload, videoId } = credData;

      // 2. Prepare form data for direct S3 upload
      const formData = new FormData();
      
      for (const key in clientPayload) {
        if (key !== 'uploadLink') {
          formData.append(key, clientPayload[key]);
        }
      }
      formData.append('success_action_status', '201');
      formData.append('success_action_redirect', '');
      
      formData.append('file', video);

      // 3. Upload directly to S3 via Axios
      const axios = (await import('axios')).default;
      
      await axios.post(clientPayload.uploadLink, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // 4. Save videoId to Postgres database
      const saveResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/modules/${moduleIdToUpload}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ title, videoId })
      });

      if (!saveResponse.ok) {
        const saveError = await saveResponse.json().catch(() => ({}));
        throw new Error(saveError.message || 'Failed to save video to database');
      }

      alert(`Upload 100% Successful!\n\nThe video "${title}" has been saved and attached to the module.`);

      // Reset form
      setTitle('');
      setThumbnail(null);
      setVideo(null);
      setUploadProgress(0);
      if (thumbInputRef.current) thumbInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      
    } catch (error) {
      console.error('Video Upload Error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Hardcode the grades to show only 10 and 11
  const uniqueGrades = ['10', '11'];

  return (
    <div>
      <div className="glass card-pad mb24" style={{ padding: '28px' }}>
        <div className="row mb16" style={{ gap: '14px', alignItems: 'center' }}>
          <div style={{ fontSize: '34px' }}>🎬</div>
          <div>
            <h3 style={{ margin: 0 }}>Add New Recording</h3>
            <p className="muted tiny mt8" style={{ margin: 0 }}>Upload MP4 (transcoded to encrypted HLS) and a reference image</p>
          </div>
        </div>

        <form onSubmit={handleUpload}>
          <div className="grid g3" style={{ gap: '16px', gridTemplateColumns: '2fr 1fr 2fr' }}>
            <div className="field">
              <label>Recording Title</label>
              <input 
                className="input" 
                placeholder="e.g. Lesson 4: IP Subnetting" 
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Filter by Grade</label>
              <select 
                className="input"
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value)}
              >
                {uniqueGrades.map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>
            
            <div className="field">
              <label>Select Class Type</label>
              <select 
                className="input"
                value={selectedClassType}
                onChange={e => setSelectedClassType(e.target.value)}
              >
                <option value="Theory">Theory Class</option>
                <option value="Paper Class">Paper Class</option>
              </select>
            </div>
          </div>

          <div className="grid g2" style={{ gap: '16px' }}>
            <div className="field">
              <label>Reference Image (Thumbnail)</label>
              <div style={{ border: '2px dashed rgba(120,130,170,.3)', padding: '16px', borderRadius: 'var(--r-input)', textAlign: 'center', background: 'rgba(255,255,255,0.4)' }}>
                <input 
                  type="file"
                  ref={thumbInputRef}
                  accept="image/*" 
                  onChange={e => setThumbnail(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="thumb-upload"
                />
                <label htmlFor="thumb-upload" className="btn btn-glass btn-sm" style={{ cursor: 'pointer', margin: '0 auto' }}>
                  🖼️ {thumbnail ? thumbnail.name : 'Choose Image'}
                </label>
                <div className="tiny muted mt8">JPG, PNG, WebP</div>
              </div>
            </div>

            <div className="field">
              <label>Video File (Recording)</label>
              <div style={{ border: '2px dashed rgba(120,130,170,.3)', padding: '16px', borderRadius: 'var(--r-input)', textAlign: 'center', background: 'rgba(255,255,255,0.4)' }}>
                <input 
                  type="file"
                  ref={videoInputRef}
                  accept="video/*" 
                  onChange={e => setVideo(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="btn btn-glass btn-sm" style={{ cursor: 'pointer', margin: '0 auto' }}>
                  🎥 {video ? video.name : 'Choose Video'}
                </label>
                <div className="tiny muted mt8">MP4, MOV (max 2GB)</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', alignItems: 'center', gap: '16px' }}>
            {isUploading && (
              <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--primary)', transition: 'width 0.3s' }} />
              </div>
            )}
            {isUploading && <span className="muted tiny">{uploadProgress}%</span>}
            <button type="submit" className="btn btn-primary" disabled={isUploading || modules.length === 0}>
              {isUploading ? 'Uploading...' : 'Upload Recording'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass card-pad" style={{ padding: '24px' }}>
        <h3 className="mb16">Published modules</h3>
        <table className="tbl">
          <thead>
            <tr>
              <th>Module</th>
              <th>Grade</th>
              <th>Subject</th>
              <th>Recording Title</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m.id}>
                <td>{m.title}</td>
                <td>Grade {m.grade}</td>
                <td>{m.subject}</td>
                <td>
                  {m.videos && m.videos.length > 0 
                    ? <span style={{ fontSize: '13px' }}>{m.videos.map(v => v.title).join(', ')}</span> 
                    : <span className="muted tiny">No recordings</span>}
                </td>
                <td><span className="chip chip-mint">Published</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
