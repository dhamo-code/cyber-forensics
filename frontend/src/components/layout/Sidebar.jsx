import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  FolderOpen,
  FileSearch,
  AlertTriangle,
  Database,
  FileText,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases', label: 'Cases', icon: FolderOpen },
  { to: '/logs', label: 'Log Analysis', icon: FileSearch },
  { to: '/threats', label: 'Threat Intel', icon: AlertTriangle },
  { to: '/evidence', label: 'Evidence', icon: Database },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-700 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              CyberForensics
            </p>
            <p className="text-xs text-gray-400">
              AI Threat Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
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

      {/* User Info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role || 'viewer'}
            </p>
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

export default Sidebar;