import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import styles from './Layout.module.css';

interface LayoutProps {
  hideFooter?: boolean;
  hideMobileNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ hideFooter = false, hideMobileNav = false }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      {!hideMobileNav && <MobileNav />}
    </div>
  );
};

export default Layout;
