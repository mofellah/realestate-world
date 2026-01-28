// Dashboard sidebar navigation
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';

export default function DashboardSidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: '📊' },
    { path: '/dashboard/properties', label: 'My Properties', icon: '🏠' },
    { path: '/dashboard/listings', label: 'My Listings', icon: '📝' },
    { path: '/dashboard/messages', label: 'Messages', icon: '💬' },
    { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ];

  const agencyItems = [
    { path: '/agency', label: 'Agency Dashboard', icon: '🏢' },
    { path: '/agency/team', label: 'Team', icon: '👥' },
    { path: '/agency/listings', label: 'Agency Listings', icon: '📋' },
  ];

  const adminItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <nav className="space-y-1">
        {/* User Navigation */}
        <div className="mb-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Dashboard
          </h3>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Agency Navigation (conditionally shown) */}
        {user && (
          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Agency
            </h3>
            {agencyItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Admin Navigation (admin only) */}
        {user && user.role === UserRole.ADMIN && (
          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Administration
            </h3>
            {adminItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
