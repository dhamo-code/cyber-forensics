import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  ScrollText,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';

// Deliberately different from the analyst/viewer navItems in Sidebar.jsx —
// an admin's job here is oversight (users, org-wide alerts, audit trail),
// not day-to-day casework. If you want admins to ALSO reach the regular
// case-working tools, add an explicit "Switch to analyst view" link
// rather than merging the two navs into one generic list again.
const adminNavItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/alerts', label: 'All Alerts', icon: ShieldAlert },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
];

function AdminSidebar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => dispatch(logoutUser());

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-700 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">CyberForensics</p>
            <p className="text-xs text-gray-400">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
              ADMIN
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;