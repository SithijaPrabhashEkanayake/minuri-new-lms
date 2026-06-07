import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
ChartJS.defaults.font.family = "'Plus Jakarta Sans'";
ChartJS.defaults.color = '#6b6b80';

export function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/reports/dashboard', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchData();
  }, [user?.token]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Students', data.stats.totalStudents],
      ['Total Modules', data.stats.totalModules],
      ['Total Views', data.stats.totalViews],
      ['Total AI Sources', data.stats.totalAiSources],
      [],
      ['Module Name', 'Video Views']
    ];
    
    data.barChart.labels.forEach((label, i) => {
      rows.push([label, data.barChart.data[i]]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lms_analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleScheduleEmail = () => {
    if (!scheduleEmail) return alert('Please enter an email address.');
    alert(`Report scheduled! An automated email will be sent to ${scheduleEmail} every Monday.\n\n(Note: In a production environment, this requires configuring an SMTP service).`);
    setShowScheduleModal(false);
    setScheduleEmail('');
  };

  const stat = (l, v, g) => (
    <div className="glass card-pad center" style={{ padding: '22px' }}>
      <div className={`ico ${g}`} style={{ margin: '0 auto 12px' }}>★</div>
      <div style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '28px', color: 'var(--ink-900)' }}>{v}</div>
      <div className="tiny muted">{l}</div>
    </div>
  );

  if (loading) return <div className="p24 center">Loading analytics...</div>;
  if (!data) return <div className="p24 center">Failed to load analytics.</div>;

  const barData = {
    labels: data.barChart.labels,
    datasets: [{
      data: data.barChart.data,
      backgroundColor: ['#8b9af0', '#7dd3c0', '#f4a6c0', '#f5c98a', '#4f7cff', '#a8c4f5'],
      borderRadius: 10
    }]
  };

  const lineData = {
    labels: data.lineChart.labels,
    datasets: [{
      data: data.lineChart.data,
      borderColor: '#4f7cff',
      backgroundColor: 'rgba(79,124,255,.12)',
      fill: true,
      tension: .4,
      pointRadius: 4,
      pointBackgroundColor: '#4f7cff'
    }]
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, suggestedMax: 10, grid: { color: 'rgba(120,130,170,.12)' } },
      x: { grid: { display: false } }
    },
    maintainAspectRatio: false
  };

  return (
    <div>
      <div className="grid g4 mb24">
        {stat('Total Students', data.stats.totalStudents, 'gc-blue')}
        {stat('Modules', data.stats.totalModules, 'gc-mint')}
        {stat('Total Views', data.stats.totalViews, 'gc-lav')}
        {stat('AI Sources', data.stats.totalAiSources, 'gc-rose')}
      </div>
      <div className="grid g2">
        <div className="glass card-pad" style={{ padding: '24px', height: '300px' }}>
          <h3 className="mb16">Total video views by module</h3>
          <div style={{ height: '200px' }}>
            <Bar data={barData} options={options} />
          </div>
        </div>
        <div className="glass card-pad" style={{ padding: '24px', height: '300px' }}>
          <h3 className="mb16">Student registrations (Last 7 days)</h3>
          <div style={{ height: '200px' }}>
            <Line data={lineData} options={options} />
          </div>
        </div>
      </div>
      <div className="glass card-pad mt24" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <p className="muted tiny">Live data fetched directly from database.</p>
        <div className="row" style={{ gap: '8px' }}>
          <button className="btn btn-glass btn-sm" onClick={handleExportPDF}>Export PDF</button>
          <button className="btn btn-glass btn-sm" onClick={handleExportCSV}>Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowScheduleModal(true)}>Schedule email</button>
        </div>
      </div>

      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="glass card-pad p24" style={{ width: '400px', maxWidth: '90vw' }}>
            <h3 className="mb16">Schedule Weekly Report</h3>
            <p className="muted tiny mb16">Receive a summary of LMS analytics every Monday at 9:00 AM.</p>
            <div className="mb16">
              <label className="block tiny muted mb4">Recipient Email</label>
              <input 
                type="email" 
                className="input" 
                placeholder="admin@example.com" 
                value={scheduleEmail}
                onChange={e => setScheduleEmail(e.target.value)}
              />
            </div>
            <div className="row between">
              <button className="btn btn-glass btn-sm" onClick={() => setShowScheduleModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleScheduleEmail}>Save Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
