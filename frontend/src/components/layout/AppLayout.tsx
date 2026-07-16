import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useViewStore } from '../../store/view.store';

export function AppLayout() {
  const { viewMode } = useViewStore();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile nav drawer whenever the route changes.
  useEffect(() => { setNavOpen(false); }, [pathname]);

  return (
    <div className={`app${viewMode === 'manager' ? ' app--manager' : ''}`}>
      <div className="app__header">
        <Topbar onMenuClick={() => setNavOpen(true)} />
      </div>
      <div className="app__body">
        {navOpen && <div className="app__nav-backdrop" onClick={() => setNavOpen(false)} />}
        <div className={`app__nav${navOpen ? ' app__nav--open' : ''}`}>
          <Sidebar />
        </div>
        <main className="app__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
