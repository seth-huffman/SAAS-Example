import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useViewStore } from '../../store/view.store';

export function AppLayout() {
  const { viewMode } = useViewStore();
  return (
    <div className={`app${viewMode === 'manager' ? ' app--manager' : ''}`}>
      <div className="app__header header-gradient">
        <Topbar />
      </div>
      <div className="app__body">
        <div className="app__nav">
          <Sidebar />
        </div>
        <main className="app__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
