import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h3 className="footer-heading">Company</h3>
          <ul>
            <li><a href="#">About Last.fm</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Jobs</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Features</h3>
          <ul>
            <li><a href="#">Help</a></li>
            <li><a href="#">Track My Music</a></li>
            <li><a href="#">Community Support</a></li>
            <li><a href="#">Community Guidelines</a></li>
            <li><a href="#">Help</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Goodies</h3>
          <ul>
            <li><a href="#">Download Scrobbler</a></li>
            <li><a href="#">Developer API</a></li>
            <li><a href="#">Free Music Downloads</a></li>
            <li><a href="#">Merchandise</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Account</h3>
          <ul>
            <li><a href="#">Inbox</a></li>
            <li><a href="#">Settings</a></li>
            <li><a href="#">Last.fm Pro</a></li>
            <li><a href="#">Logout</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Follow Us</h3>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">X</a></li>
            <li><a href="#">Bluesky</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">YouTube</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <div className="footer-links">
          <a href="#">Terms of Use</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Legal Policies</a>
          <a href="#">Cookie Details</a>
          <a href="#">Jobs at Paramount</a>
        </div>
        <div className="footer-copyright">
          <span>Last.fm Music</span>
          <span>© 2025 Last.fm Ltd. All rights reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;