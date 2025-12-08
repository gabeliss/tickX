import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoText}>TickX</span>
            </Link>
            <p className={styles.tagline}>
              The modern ticket marketplace with dynamic pricing and group purchasing.
            </p>
          </div>

          {/* Buy */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Buy</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/events?category=concert" className={styles.link}>
                  Concerts
                </Link>
              </li>
              <li>
                <Link to="/events?category=sports" className={styles.link}>
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/events?category=theater" className={styles.link}>
                  Theater
                </Link>
              </li>
              <li>
                <Link to="/events?category=comedy" className={styles.link}>
                  Comedy
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Sell</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/sell" className={styles.link}>
                  Sell Tickets
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className={styles.link}>
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link to="/help/selling" className={styles.link}>
                  Seller Guide
                </Link>
              </li>
              <li>
                <Link to="/help/pricing" className={styles.link}>
                  Pricing Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Company</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/about" className={styles.link}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/help" className={styles.link}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className={styles.link}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/careers" className={styles.link}>
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Legal</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/terms" className={styles.link}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={styles.link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/guarantee" className={styles.link}>
                  Buyer Guarantee
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} TickX. All rights reserved.
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}>100% Buyer Guarantee</span>
            <span className={styles.badge}>Secure Payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
