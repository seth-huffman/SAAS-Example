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
import { LogOut, User, ArrowLeftRight } from 'lucide-react';

export function Topbar() {
  const { clearAuth } = useAuthStore();
  const { viewMode, toggle } = useViewStore();
  const navigate = useNavigate();

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
          {nextLabel}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<button className="topbar__user-btn topbar__user-btn--icon" />}>
            <User size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ minWidth: '192px' }}>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User size={16} />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
