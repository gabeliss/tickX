import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import { clsx } from 'clsx';
import { mockNotifications } from '../../data/mockData';
import styles from './MobileNav.module.css';

export const MobileNav: React.FC = () => {
  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/sell', icon: PlusCircle, label: 'Sell', highlight: true },
    { to: '/notifications', icon: Bell, label: 'Activity', badge: unreadNotifications },
    { to: '/profile', icon: User, label: 'You' },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            clsx(styles.navItem, isActive && styles.active, item.highlight && styles.highlight)
          }
        >
          <span className={styles.iconWrapper}>
            <item.icon size={22} />
            {item.badge && item.badge > 0 && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </span>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
