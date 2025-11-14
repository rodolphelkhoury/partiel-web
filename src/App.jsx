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
        } else if (key.trim().toLowerCase() === 'description') {
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

  if (loading) return <div className="cv-wrapper">Loading CV...</div>;
  if (error) return <div className="cv-wrapper">Error: {error}</div>;
  if (!cvData) return null;

  return (
    <div className="cv-wrapper">

      {/* === NAME HEADER === */}
      <h1 className="cv-name">{cvData.profile.name}</h1>
      <div className="cv-contact">
        {cvData.profile.location} | {cvData.profile.phone}
        <br />
        {cvData.profile.email}
      </div>

      {/* === ABOUT / SUMMARY === */}
      <h2 className="cv-section-title">SUMMARY</h2>
      <p className="cv-paragraph">{cvData.about}</p>

      {/* === EXPERIENCE === */}
      <h2 className="cv-section-title">WORK EXPERIENCE</h2>
      {cvData.experience.map((exp, idx) => (
        <div key={idx} className="cv-experience-item">
          <strong>{exp.title}</strong> | {exp.company}
          <span className="cv-period">{exp.period}</span>
          <p className="cv-paragraph">{exp.description}</p>
        </div>
      ))}

      {/* === EDUCATION === */}
      <h2 className="cv-section-title">EDUCATION</h2>
      <div className="cv-education">
        <strong>{cvData.education.degree}</strong>
        <div>{cvData.education.university}</div>
        <div className="cv-period">{cvData.education.period}</div>
        <p className="cv-paragraph">{cvData.education.description}</p>
      </div>

      {/* === SKILLS === */}
      <h2 className="cv-section-title">SKILLS</h2>
      <p className="cv-paragraph">
        {cvData.skills.join(', ')}
      </p>

      {/* === CERTIFICATIONS === */}
      <h2 className="cv-section-title">CERTIFICATIONS</h2>
      {cvData.certifications.map((cert, idx) => (
        <div key={idx} className="cv-paragraph">
          • <strong>{cert.name}</strong> ({cert.date})
        </div>
      ))}

      {/* === LANGUAGES === */}
      <h2 className="cv-section-title">LANGUAGES</h2>
      {cvData.languages.map((lang, idx) => (
        <div key={idx} className="cv-paragraph">
          • {lang.name} — {lang.level}
        </div>
      ))}
    </div>
  );
}

export default App;
