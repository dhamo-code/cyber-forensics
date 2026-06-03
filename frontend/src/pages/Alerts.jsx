import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import PageWrapper from '../components/layout/PageWrapper';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSocket } from '../hooks/useSocket';
import { useSelector } from 'react-redux';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const { alerts: realtimeAlerts } = useSelector((state) => state.alerts);

  useSocket();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/logs/alerts', {
        params: { severity: severityFilter || undefined },
      });
      setAlerts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter]);

  const severityBadge = (severity) => {
    const classes = {
      critical: 'badge-critical',
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low',
    };
    return (
      <span className={classes[severity] || 'badge-low'}>
        {severity}
      </span>
    );
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-400" />
            Security Alerts
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time threat alerts from AI analysis
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Realtime alerts from socket */}
      {realtimeAlerts.length > 0 && (
        <div className="card mb-4 border-red-500/50 bg-red-900/10">
          <p className="text-red-400 font-medium text-sm mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            {realtimeAlerts.length} new real-time alerts
          </p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Alerts Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Alert</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Source IP</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Severity</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Score</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Loading alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <Shield className="w-10 h-10 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-400">No alerts found. System is secure!</p>
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr
                    key={alert._id}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm text-white font-medium">
                        {alert.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                        {alert.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {alert.type?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-400">
                      {alert.sourceIP || 'Unknown'}
                    </td>
                    <td className="px-4 py-3">
                      {severityBadge(alert.severity)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {alert.threatScore}/100
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(alert.createdAt).toLocaleString()}
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

export default Alerts;