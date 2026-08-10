import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/layout/AdminSidebar';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get('/api/admin/stats')
      .then((res) => {
        // ApiResponse.success wraps data in res.data.data
        setStats(res.data.data);
      })
      .catch(() => setError('Failed to load admin stats'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-600' },
        { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'bg-green-600' },
        { label: 'Inactive Users', value: stats.inactiveUsers, icon: UserX, color: 'bg-gray-600' },
        { label: 'Admins', value: stats.byRole?.admin ?? 0, icon: ShieldCheck, color: 'bg-purple-600' },
      ]
    : [];

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Admin Overview</h1>
        <p className="text-gray-400 text-sm mb-6">System-wide status, not case-level detail</p>

        {loading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-gray-800 rounded-xl border border-gray-700 p-5 flex items-center gap-4"
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Role breakdown */}
        {stats && (
          <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Users by Role</h2>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span className="text-gray-300 text-sm">Admin: <strong className="text-white">{stats.byRole?.admin ?? 0}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
                <span className="text-gray-300 text-sm">Analyst: <strong className="text-white">{stats.byRole?.analyst ?? 0}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500 inline-block" />
                <span className="text-gray-300 text-sm">Viewer: <strong className="text-white">{stats.byRole?.viewer ?? 0}</strong></span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;