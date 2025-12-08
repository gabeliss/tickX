import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, X, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../common';
import { currentUser, mockNotifications } from '../../data/mockData';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>TickEx</span>
        </Link>

        {/* Desktop Search */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search events, artists, teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link to="/events" className={styles.navLink}>
            Browse Events
          </Link>
          <Link to="/sell" className={styles.navLinkHighlight}>
            <Plus size={18} />
            Sell Tickets
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            onClick={() => navigate('/notifications')}
            aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ''}`}
          >
            <Bell size={22} />
            {unreadNotifications > 0 && (
              <span className={styles.notificationBadge}>{unreadNotifications}</span>
            )}
          </button>

          <button
            className={styles.iconButton}
            onClick={() => navigate('/profile')}
            aria-label="Profile"
          >
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className={styles.avatar} />
            ) : (
              <User size={22} />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className={clsx(styles.iconButton, styles.mobileMenuToggle)}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search Toggle */}
        <button
          className={clsx(styles.iconButton, styles.mobileSearchToggle)}
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          aria-label="Search"
        >
          <Search size={22} />
        </button>
      </div>

      {/* Mobile Search Expanded */}
      {isSearchExpanded && (
        <div className={styles.mobileSearchExpanded}>
          <form onSubmit={handleSearch} className={styles.mobileSearchForm}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search events, artists, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
            </div>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setIsSearchExpanded(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <Link
              to="/events"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Events
            </Link>
            <Link
              to="/sell"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sell Tickets
            </Link>
            <Link
              to="/dashboard"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Seller Dashboard
            </Link>
            <Link
              to="/watchlist"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Watchlist
            </Link>
            <Link
              to="/purchases"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Tickets
            </Link>
          </nav>
          <div className={styles.mobileMenuFooter}>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                navigate('/sell');
                setIsMobileMenuOpen(false);
              }}
            >
              <Plus size={18} />
              Sell Tickets
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
