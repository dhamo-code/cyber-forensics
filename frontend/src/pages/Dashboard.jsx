import { useSelector } from 'react-redux';
import {
  Shield,
  AlertTriangle,
  FileText,
  Activity,
  TrendingUp,
  Clock,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';

function StatCard({ title, value, icon: Icon, color, description }) {
  const colorClasses = {
    blue: 'bg-blue-600/10 text-blue-400 border-blue-600/20',
    red: 'bg-red-600/10 text-red-400 border-red-600/20',
    green: 'bg-green-600/10 text-green-400 border-green-600/20',
    purple: 'bg-purple-600/10 text-purple-400 border-purple-600/20',
    yellow: 'bg-yellow-600/10 text-yellow-400 border-yellow-600/20',
  };

  return (
    <div className="card hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {description && (
            <p className="text-gray-500 text-xs mt-1">{description}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    {
      title: 'Active Cases',
      value: '12',
      icon: FileText,
      color: 'blue',
      description: '3 critical priority',
    },
    {
      title: 'Active Alerts',
      value: '47',
      icon: AlertTriangle,
      color: 'red',
      description: '8 unacknowledged',
    },
    {
      title: 'Threats Blocked',
      value: '1,284',
      icon: Shield,
      color: 'green',
      description: 'Last 30 days',
    },
    {
      title: 'Logs Analyzed',
      value: '98.2K',
      icon: Activity,
      color: 'purple',
      description: 'Today',
    },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'SQL Injection',
      ip: '192.168.1.105',
      severity: 'critical',
      time: '2 min ago',
    },
    {
      id: 2,
      type: 'Brute Force',
      ip: '10.0.0.45',
      severity: 'high',
      time: '15 min ago',
    },
    {
      id: 3,
      type: 'XSS Attack',
      ip: '172.16.0.12',
      severity: 'medium',
      time: '32 min ago',
    },
    {
      id: 4,
      type: 'Port Scan',
      ip: '192.168.1.200',
      severity: 'low',
      time: '1 hr ago',
    },
    {
      id: 5,
      type: 'Malicious IP',
      ip: '45.33.32.156',
      severity: 'high',
      time: '2 hr ago',
    },
  ];

  const recentCases = [
    {
      id: 'CYF-2026-001',
      title: 'SQL Injection on Login API',
      status: 'investigating',
      priority: 'critical',
    },
    {
      id: 'CYF-2026-002',
      title: 'Brute Force Attack',
      status: 'open',
      priority: 'high',
    },
    {
      id: 'CYF-2026-003',
      title: 'Suspicious File Upload',
      status: 'resolved',
      priority: 'medium',
    },
  ];

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

  const statusBadge = (status) => {
    const classes = {
      open: 'bg-blue-900 text-blue-200',
      investigating: 'bg-yellow-900 text-yellow-200',
      resolved: 'bg-green-900 text-green-200',
      closed: 'bg-gray-700 text-gray-300',
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Analyst'} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here is what is happening in your system today
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Recent Alerts
            </h2>
            <span className="text-xs text-blue-400 cursor-pointer hover:underline">
              View all
            </span>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <div>
                    <p className="text-sm text-white font-medium">
                      {alert.type}
                    </p>
                    <p className="text-xs text-gray-400">{alert.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {severityBadge(alert.severity)}
                  <span className="text-xs text-gray-500">
                    {alert.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cases */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Recent Cases
            </h2>
            <span className="text-xs text-blue-400 cursor-pointer hover:underline">
              View all
            </span>
          </div>
          <div className="space-y-3">
            {recentCases.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
              >
                <div>
                  <p className="text-sm text-white font-medium">
                    {c.title}
                  </p>
                  <p className="text-xs text-gray-400">{c.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {severityBadge(c.priority)}
                  {statusBadge(c.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-400" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Backend API', status: 'Operational', color: 'green' },
            { label: 'MongoDB Atlas', status: 'Connected', color: 'green' },
            { label: 'Redis Cache', status: 'Running', color: 'green' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <span className="text-sm text-gray-300">{item.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default Dashboard;