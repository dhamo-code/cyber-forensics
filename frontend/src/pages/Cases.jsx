import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import PageWrapper from '../components/layout/PageWrapper';
import {
  FolderOpen, Plus, Search,
  AlertTriangle, Clock, User,
} from 'lucide-react';
import { toast } from 'react-toastify';

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    attackType: 'unknown',
  });

  const { user } = useSelector((state) => state.auth);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/cases', {
        params: { status: statusFilter || undefined },
      });
      setCases(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/cases', form);
      toast.success('Case created successfully!');
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'medium', attackType: 'unknown' });
      fetchCases();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create case');
    }
  };

  const priorityBadge = (priority) => {
    const classes = {
      critical: 'badge-critical',
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low',
    };
    return <span className={classes[priority]}>{priority}</span>;
  };

  const statusBadge = (status) => {
    const classes = {
      open: 'bg-blue-900 text-blue-200',
      investigating: 'bg-yellow-900 text-yellow-200',
      resolved: 'bg-green-900 text-green-200',
      closed: 'bg-gray-700 text-gray-300',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes[status]}`}>
        {status}
      </span>
    );
  };

  const filtered = cases.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.caseNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-blue-400" />
            Case Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track and manage forensic investigation cases
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Create New Case
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder="Case title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Attack Type</label>
                <select
                  value={form.attackType}
                  onChange={(e) => setForm({ ...form, attackType: e.target.value })}
                  className="input"
                >
                  <option value="unknown">Unknown</option>
                  <option value="sql_injection">SQL Injection</option>
                  <option value="xss">XSS Attack</option>
                  <option value="brute_force">Brute Force</option>
                  <option value="malware">Malware</option>
                  <option value="phishing">Phishing</option>
                  <option value="ddos">DDoS</option>
                  <option value="unauthorized_access">Unauthorized Access</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input"
                rows={3}
                placeholder="Describe the incident..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Create Case
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Cases Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Case #</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Attack Type</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Priority</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Loading cases...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No cases found. Create your first case!
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-blue-400 font-mono">
                      {c.caseNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white font-medium">{c.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                        {c.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {c.attackType?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3">{priorityBadge(c.priority)}</td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Cases;