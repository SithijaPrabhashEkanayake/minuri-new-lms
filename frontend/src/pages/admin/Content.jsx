import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function Content() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [moduleSearchText, setModuleSearchText] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);
  const [modules, setModules] = useState([]);
  
  const thumbInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch real modules from Postgres
    fetch('http://localhost:5000/api/modules')
      .then(res => res.json())
      .then(data => {
        setModules(data);
        if (data.length > 0) setModuleSearchText(data[0].title);
      })
      .catch(err => console.error('Error fetching modules:', err));
  }, []);

  // Filter modules based on selected grade
  const filteredModules = selectedGrade === 'All' 
    ? modules 
    : modules.filter(m => m.grade.toString() === selectedGrade);

  // When grade filter changes, reset the search text to the first available in the filtered list
  useEffect(() => {
    if (filteredModules.length > 0) {
      if (!filteredModules.find(m => m.title === moduleSearchText)) {
        setModuleSearchText(filteredModules[0].title);
      }
    } else {
      setModuleSearchText('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade, modules]);

  const handleCreateModuleOnly = async () => {
    if (!user?.token) {
      alert('You must be logged in to create a module.');
      return;
    }
    if (!moduleSearchText.trim()) {
      alert('Please type a module name first.');
      return;
    }
    
    const searchTarget = moduleSearchText.toLowerCase().trim();
    if (modules.find(m => m.title.toLowerCase().trim() === searchTarget)) {
      alert('This module already exists!');
      return;
    }

    const gradeToUse = selectedGrade === 'All' ? 10 : parseInt(selectedGrade);
    
    try {
      const createRes = await fetch('http://localhost:5000/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: moduleSearchText.trim(),
          grade: gradeToUse,
          price: 5000,
          subject: 'ICT',
          published: true
        })
      });
      
      if (!createRes.ok) throw new Error('Failed to create new module');
      const selectedModule = await createRes.json();
      
      // Add to local state so the table updates immediately
      setModules([...modules, { ...selectedModule, videos: [] }]);
      alert(`Module "${selectedModule.title}" created successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to create the new module.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!user?.token) {
      alert('You must be logged in to upload content.');
      return;
    }
    if (!title || !thumbnail || !video || !moduleSearchText) {
      alert('Please fill in all fields (Title, Module, Reference Image, and Video).');
      return;
    }

    // Search across ALL modules, ignoring case and trailing spaces
    const searchTarget = moduleSearchText.toLowerCase().trim();
    let selectedModule = modules.find(m => m.title.toLowerCase().trim() === searchTarget);

    let moduleIdToUpload;

    if (!selectedModule) {
      const confirmCreate = window.confirm(`The module "${moduleSearchText.trim()}" does not exist. Would you like to create it automatically?`);
      if (!confirmCreate) return;
      
      const gradeToUse = selectedGrade === 'All' ? 10 : parseInt(selectedGrade);
      
      try {
        const createRes = await fetch('http://localhost:5000/api/modules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            title: moduleSearchText.trim(),
            grade: gradeToUse,
            price: 5000,
            subject: 'ICT',
            published: true
          })
        });
        
        if (!createRes.ok) throw new Error('Failed to create new module');
        selectedModule = await createRes.json();
        
        // Add to local state so the table updates immediately
        setModules([...modules, { ...selectedModule, videos: [] }]);
      } catch (err) {
        console.error(err);
        alert('Failed to create the new module automatically.');
        return;
      }
    }

    moduleIdToUpload = selectedModule.id;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get secure AWS S3 upload credentials from our backend
      const credResponse = await fetch('http://localhost:5000/api/video/upload-credentials', {
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
      const saveResponse = await fetch(`http://localhost:5000/api/modules/${moduleIdToUpload}/videos`, {
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

  // Hardcode the grades to show only All, 10, and 11
  const uniqueGrades = ['All', '10', '11'];

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
                  <option key={grade} value={grade}>{grade === 'All' ? 'All Grades' : `Grade ${grade}`}</option>
                ))}
              </select>
            </div>
            
            <div className="field">
              <label>Assign to Module</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  className="input"
                  list="modules-list"
                  value={moduleSearchText}
                  onChange={e => setModuleSearchText(e.target.value)}
                  placeholder="Type module name..."
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-secondary" onClick={handleCreateModuleOnly}>
                  + Create
                </button>
              </div>
              <datalist id="modules-list">
                {filteredModules.map(m => (
                  <option key={m.id} value={m.title} />
                ))}
              </datalist>
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
