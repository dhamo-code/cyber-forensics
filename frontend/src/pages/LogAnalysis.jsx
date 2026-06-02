import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import PageWrapper from '../components/layout/PageWrapper';
import { FileSearch, Upload, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

function LogAnalysis() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a log file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setAnalyzing(true);
      const res = await axiosInstance.post('/api/logs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      toast.success('Log analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileSearch className="w-7 h-7 text-blue-400" />
          Log Analysis
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Upload log files for AI-powered threat detection
        </p>
      </div>

      {/* Upload Section */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Upload Log File
        </h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 mb-2">
              Drop your log file here or click to browse
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Supports: Apache, Nginx, JSON logs (max 50MB)
            </p>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".log,.txt,.json"
              className="hidden"
              id="logFile"
            />
            <label
              htmlFor="logFile"
              className="btn-secondary cursor-pointer"
            >
              Browse File
            </label>
            {file && (
              <p className="text-blue-400 text-sm mt-3">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={analyzing || !file}
            className="btn-primary flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Analyze Logs
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Analysis Results
          </h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Logs', value: result.summary?.totalParsed, color: 'blue' },
              { label: 'Suspicious', value: result.summary?.suspicious, color: 'yellow' },
              { label: 'Critical', value: result.summary?.critical, color: 'red' },
              { label: 'Alerts Created', value: result.summary?.alertsCreated, color: 'purple' },
            ].map((item) => (
              <div key={item.label} className="card text-center p-4">
                <p className="text-3xl font-bold text-white">{item.value || 0}</p>
                <p className="text-gray-400 text-sm mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Alerts Generated */}
          {result.alerts?.length > 0 && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Alerts Generated ({result.alerts.length})
              </h3>
              <div className="space-y-3">
                {result.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{alert.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        IP: {alert.sourceIP || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge-${alert.severity}`}>{alert.severity}</span>
                      <span className="text-gray-400 text-xs">Score: {alert.threatScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

export default LogAnalysis;