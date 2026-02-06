import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-brand">Skillstream</h3>
          <p className="footer-tagline">Learn everything for free</p>
        </div>
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <nav className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/favorites">Favourites</Link>
            <Link to="/about">About</Link>
          </nav>
        </div>
        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <nav className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </nav>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Skillstream. All rights reserved.</p>
      </div>
    </footer>
  )
}
