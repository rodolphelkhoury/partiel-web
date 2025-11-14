import React, { useState, useEffect } from 'react';
import './App.css';

// Reusable components
const ExperienceItem = ({ title, company, period, description }) => (
  <div className="cv-experience-item">
    <strong>{title}</strong> | {company}
    <span className="cv-period">{period}</span>
    <p className="cv-paragraph">{description}</p>
  </div>
);

const EducationItem = ({ degree, university, period, description }) => (
  <div className="cv-education">
    <strong>{degree}</strong>
    <div>{university}</div>
    <div className="cv-period">{period}</div>
    <p className="cv-paragraph">{description}</p>
  </div>
);

const CertificationItem = ({ name, date }) => (
  <div className="cv-paragraph">
    • <strong>{name}</strong> ({date})
  </div>
);

const LanguageItem = ({ name, level }) => (
  <div className="cv-paragraph">
    • {name} — {level}
  </div>
);

function App() {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const response = await fetch('/information.txt');
        if (!response.ok) throw new Error('Failed to load CV data');
        const text = await response.text();
        setCvData(parseInformationFile(text));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCVData();
  }, []);

  // Smarter parsing using section handlers
  const parseInformationFile = (text) => {
    const data = {
      profile: {},
      about: '',
      experience: [],
      skills: [],
      education: {},
      certifications: [],
      languages: [],
    };

    const handlers = {
      profile: (key, value) => (data.profile[key.toLowerCase()] = value),
      about: (_, value) => (data.about += (data.about ? ' ' : '') + value),
      experience: (key, value) => {
        key = key.toLowerCase();
        if (key === 'job') {
          const [title, company, period] = value.split('|').map(s => s.trim());
          data.experience.push({ title, company, period, description: '' });
        } else if (key === 'description') {
          data.experience[data.experience.length - 1].description = value;
        }
      },
      skills: (key, value) => key.toLowerCase() === 'skill' && data.skills.push(value),
      education: (key, value) => (data.education[key.toLowerCase()] = value),
      certifications: (key, value) => {
        if (key.toLowerCase() === 'cert') {
          const [name, date] = value.split('|').map(s => s.trim());
          data.certifications.push({ name, date });
        }
      },
      languages: (key, value) => {
        if (key.toLowerCase() === 'language') {
          const [name, level] = value.split('|').map(s => s.trim());
          data.languages.push({ name, level });
        }
      },
    };

    let currentSection = '';
    text.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1).toLowerCase();
        return;
      }
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      handlers[currentSection]?.(key.trim(), value);
    });

    return data;
  };

  if (loading) return <div className="cv-wrapper">Loading CV...</div>;
  if (error) return <div className="cv-wrapper">Error: {error}</div>;
  if (!cvData) return null;

  const { profile, about, experience, education, skills, certifications, languages } = cvData;

  return (
    <div className="cv-wrapper">
      {/* === PROFILE HEADER === */}
      <h1 className="cv-name">{profile.name}</h1>
      <div className="cv-contact-full">
        <div className="cv-contact">
          {profile.location} | {profile.phone}
          <br />
          {profile.email}
        </div>
        <img 
          src="/WhatsApp Image 2025-11-14 at 5.22.49 PM.jpeg" 
          alt="Profile" 
          className="cv-profile-image"
        />
      </div>

      {/* === ABOUT === */}
      {about && (
        <>
          <h2 className="cv-section-title">SUMMARY</h2>
          <p className="cv-paragraph">{about}</p>
        </>
      )}

      {/* === EXPERIENCE === */}
      {experience.length > 0 && (
        <>
          <h2 className="cv-section-title">WORK EXPERIENCE</h2>
          {experience.map((exp, idx) => <ExperienceItem key={idx} {...exp} />)}
        </>
      )}

      {/* === EDUCATION === */}
      {Object.keys(education).length > 0 && (
        <>
          <h2 className="cv-section-title">EDUCATION</h2>
          <EducationItem {...education} />
        </>
      )}

      {/* === SKILLS === */}
      {skills.length > 0 && (
        <>
          <h2 className="cv-section-title">SKILLS</h2>
          <p className="cv-paragraph">{skills.join(', ')}</p>
        </>
      )}

      {/* === CERTIFICATIONS === */}
      {certifications.length > 0 && (
        <>
          <h2 className="cv-section-title">CERTIFICATIONS</h2>
          {certifications.map((cert, idx) => <CertificationItem key={idx} {...cert} />)}
        </>
      )}

      {/* === LANGUAGES === */}
      {languages.length > 0 && (
        <>
          <h2 className="cv-section-title">LANGUAGES</h2>
          {languages.map((lang, idx) => <LanguageItem key={idx} {...lang} />)}
        </>
      )}
    </div>
  );
}

export default App;
