import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { toast } from 'react-toastify';

const ROLE_COLORS = {
  admin: 'bg-blue-600',
  analyst: 'bg-purple-600',
  viewer: 'bg-gray-600',
};

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/users');
      // ApiResponse.success → res.data.data.users
      setUsers(res.data.data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (id, updates) => {
    try {
      await axiosInstance.patch(`/api/admin/users/${id}`, updates);
      toast.success('User updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-bold text-white mb-1">User Management</h1>
        <p className="text-gray-400 text-sm mb-6">
          Manage roles and access. Changes are enforced by the backend.
        </p>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : users.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <p className="text-gray-400">No users found.</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Last Login</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => updateUser(u._id, { role: e.target.value })}
                        className={`text-xs text-white rounded px-2 py-1 border-0 cursor-pointer ${ROLE_COLORS[u.role]}`}
                      >
                        <option value="admin">Admin</option>
                        <option value="analyst">Analyst</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        u.isActive
                          ? 'bg-green-900/60 text-green-300'
                          : 'bg-red-900/60 text-red-300'
                      }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateUser(u._id, { isActive: !u.isActive })}
                        className={`text-xs font-medium hover:underline ${
                          u.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default UserManagement;