import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useViewStore } from '../../store/view.store';
import { Users, Building2, CalendarDays, User, GitBranch, Star, Briefcase, Umbrella } from 'lucide-react';

const managerItems = [
  { to: '/employees',           label: 'Employees',            icon: Users        },
  { to: '/departments',         label: 'Departments',          icon: Building2    },
  { to: '/leaves',              label: 'Leave Requests',       icon: CalendarDays },
  { to: '/org-chart',           label: 'Org Chart',            icon: GitBranch    },
  { to: '/performance-reviews', label: 'Performance Reviews',  icon: Star         },
  { to: '/job-postings',        label: 'Job Postings',         icon: Briefcase    },
  { to: '/profile',             label: 'My Profile',           icon: User         },
];

const employeeItems = [
  { to: '/time-off',            label: 'Time Off',             icon: Umbrella     },
  { to: '/org-chart',           label: 'Org Chart',            icon: GitBranch    },
  { to: '/performance-reviews', label: 'Performance Reviews',  icon: Star         },
  { to: '/job-postings',        label: 'Job Postings',         icon: Briefcase    },
  { to: '/profile',             label: 'My Profile',           icon: User         },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { viewMode } = useViewStore();

  const isHR = user?.role === 'super_admin' || user?.role === 'hr_manager';
  const items = (isHR && viewMode === 'manager') ? managerItems : employeeItems;

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
