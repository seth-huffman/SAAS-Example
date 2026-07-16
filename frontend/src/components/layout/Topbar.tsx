import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useViewStore } from '../../store/view.store';
import { authApi } from '../../api/auth.api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LogOut, User, ArrowLeftRight, Menu } from 'lucide-react';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, clearAuth } = useAuthStore();
  const { viewMode, toggle } = useViewStore();
  const navigate = useNavigate();

  const isHR = user?.role === 'super_admin' || user?.role === 'hr_manager';
  const isManagerView = isHR && viewMode === 'manager';

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      localStorage.removeItem('hr-refresh-token');
      navigate('/login');
    }
  };

  const nextLabel = viewMode === 'manager' ? 'Employee View' : 'Manager View';

  return (
    <header className="topbar">
      <button
        className="topbar__menu-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      <div className="topbar__brand-wrap">
        <span className="topbar__brand">
          <span style={{ fontWeight: 300 }}>shift</span>
          <span style={{ fontWeight: 500 }}>control</span>
        </span>
        <span className="topbar__brand-sub">Employee Resources</span>
      </div>

      <div className="topbar__right">
        <button className="topbar__view-toggle" onClick={toggle}>
          <ArrowLeftRight size={15} />
          <span className="topbar__view-toggle-label">{nextLabel}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<button className="topbar__user-btn" />}>
            <User size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ minWidth: '192px' }}>
            {!isManagerView && (
              <>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User size={16} />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut size={16} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
