import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const response = await fetch('/information.txt');
        if (!response.ok) {
          throw new Error('Failed to load CV data');
        }
        const text = await response.text();
        const parsed = parseInformationFile(text);
        setCvData(parsed);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCVData();
  }, []);

  const parseInformationFile = (text) => {
    const data = {
      profile: {},
      about: '',
      experience: [],
      skills: [],
      education: {},
      certifications: [],
      languages: []
    };

    const lines = text.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1).toLowerCase();
        continue;
      }

      if (!line || line.startsWith('#')) continue;

      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      if (currentSection === 'profile') {
        data.profile[key.trim().toLowerCase()] = value;
      } else if (currentSection === 'about') {
        data.about += (data.about ? ' ' : '') + line;
      } else if (currentSection === 'experience') {
        if (key.trim().toLowerCase() === 'job') {
          const [title, company, period] = value.split('|').map(s => s.trim());
          data.experience.push({ title, company, period, description: '' });
        } else if (key.trim().toLowerCase() === 'description' && data.experience.length > 0) {
          data.experience[data.experience.length - 1].description = value;
        }
      } else if (currentSection === 'skills') {
        if (key.trim().toLowerCase() === 'skill') {
          data.skills.push(value);
        }
      } else if (currentSection === 'education') {
        data.education[key.trim().toLowerCase()] = value;
      } else if (currentSection === 'certifications') {
        if (key.trim().toLowerCase() === 'cert') {
          const [name, date] = value.split('|').map(s => s.trim());
          data.certifications.push({ name, date });
        }
      } else if (currentSection === 'languages') {
        if (key.trim().toLowerCase() === 'language') {
          const [name, level] = value.split('|').map(s => s.trim());
          data.languages.push({ name, level });
        }
      }
    }

    return data;
  };

  if (loading) {
    return (
      <div className="cv-container">
        <div style={{ textAlign: 'center', color: '#667eea', fontSize: '1.5rem' }}>
          Loading CV...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cv-container">
        <div style={{ textAlign: 'center', color: '#e53e3e', fontSize: '1.2rem' }}>
          Error: {error}
          <br />
          <small style={{ fontSize: '0.9rem', color: '#4a5568' }}>
            Make sure information.txt exists in the public folder
          </small>
        </div>
      </div>
    );
  }

  if (!cvData) return null;


  return (
    <div className="cv-container">
      <div className="cv-card">
        {/* Header Section */}
        <div className="cv-header">
          <div className="header-content">
            {/* Profile Picture */}
            <div className="profile-picture">
              <img src="/WhatsApp Image 2025-11-14 at 5.22.49 PM.jpeg" alt="Profile" />
            </div>
            
            {/* Name and Title */}
            <div className="profile-info">
              <h1 className="profile-name">{cvData.profile.name || 'John Doe'}</h1>
              <p className="profile-title">{cvData.profile.title || 'Professional'}</p>
              <div className="contact-info">
                {cvData.profile.email && <span>📧 {cvData.profile.email}</span>}
                {cvData.profile.phone && <span>📱 {cvData.profile.phone}</span>}
                {cvData.profile.location && <span>📍 {cvData.profile.location}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="cv-content">
          <div className="content-wrapper">
            {/* Left Column */}
            <div className="left-column">
              {/* About Section */}
              {cvData.about && (
                <section className="cv-section">
                  <h2 className="section-title">About Me</h2>
                  <p className="section-text">{cvData.about}</p>
                </section>
              )}

              {/* Experience Section */}
              {cvData.experience.length > 0 && (
                <section className="cv-section">
                  <h2 className="section-title">Experience</h2>
                  <div className="experience-list">
                    {cvData.experience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <h3 className="job-title">{exp.title}</h3>
                        <p className="company">{exp.company} • {exp.period}</p>
                        <p className="job-description">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Skills Section */}
              {cvData.skills.length > 0 && (
                <section className="cv-section">
                  <h2 className="section-title">Skills</h2>
                  <div className="skills-container">
                    {cvData.skills.map((skill, index) => (
                      <span key={index} className="skill-badge">{skill}</span>
                    ))}
                  </div>
                </section>
              )}

              {/* Education Section */}
              {cvData.education.degree && (
                <section className="cv-section">
                  <h2 className="section-title">Education</h2>
                  <div className="education-item">
                    <h3 className="degree">{cvData.education.degree}</h3>
                    <p className="university">
                      {cvData.education.university} • {cvData.education.period}
                    </p>
                    {cvData.education.description && (
                      <p className="education-description">{cvData.education.description}</p>
                    )}
                  </div>
                </section>
              )}

              {/* Certifications Section */}
              {cvData.certifications.length > 0 && (
                <section className="cv-section">
                  <h2 className="section-title">Certifications</h2>
                  <div className="certification-list">
                    {cvData.certifications.map((cert, index) => (
                      <div key={index} className="certification-item">
                        <h4 className="cert-name">{cert.name}</h4>
                        <p className="cert-date">{cert.date}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages Section */}
              {cvData.languages.length > 0 && (
                <section className="cv-section">
                  <h2 className="section-title">Languages</h2>
                  <div className="languages-list">
                    {cvData.languages.map((lang, index) => (
                      <div key={index} className="language-item">
                        <span className="language-name">{lang.name}</span>
                        <span className="language-level">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;