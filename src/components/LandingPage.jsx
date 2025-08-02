import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = ({ isAuthenticated, onLogout }) => {
  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo">Meme Generator</div>
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/create" className="nav-link">Create Meme</Link>
              <button 
                onClick={onLogout} 
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link primary">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
      
      <main className="hero">
        <div className="hero-content">
          <h1>Create Memes in a Seconds</h1>
          <p className="subtitle">The easiest way to create, customize, and share memes with the world.</p>
          <div className="cta-buttons">
            {isAuthenticated ? (
              <Link to="/create" className="cta-primary">Create a Meme</Link>
            ) : (
              <>
                <Link to="/signup" className="cta-primary">Start Creating - It's Free</Link>
                <Link to="/login" className="cta-secondary">Already a memer? Login</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="https://i.imgflip.com/a1fqyn.jpg" 
            alt="Meme examples" 
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
        </div>
      </main>

      <section className="features">
        <h2>Why Choose Our Meme Generator?</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">👤</div>
            <h3>Create Memes</h3>
            <p>Manage your creative memes and templates.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Secure Access</h3>
            <p>Your data is protected with secure authentication.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Reliable</h3>
            <p>Enjoy a smooth and responsive experience.</p>
          </div>
        </div>
      </section>
      <footer className="footer">
        <p>© 2025 My Application. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;