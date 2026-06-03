import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import PageWrapper from '../components/layout/PageWrapper';
import { Shield, Search, AlertTriangle, MapPin, Globe } from 'lucide-react';
import { toast } from 'react-toastify';

function ThreatIntel() {
  const [ipInput, setIpInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [ipResult, setIpResult] = useState(null);
  const [urlResult, setUrlResult] = useState(null);
  const [hashResult, setHashResult] = useState(null);
  const [loading, setLoading] = useState({ ip: false, url: false, hash: false });

  const checkIP = async () => {
    if (!ipInput) return toast.error('Enter an IP address');
    try {
      setLoading({ ...loading, ip: true });
      const res = await axiosInstance.post('/api/intelligence/check-ip', {
        ip: ipInput,
      });
      setIpResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'IP check failed');
    } finally {
      setLoading({ ...loading, ip: false });
    }
  };

  const checkURL = async () => {
    if (!urlInput) return toast.error('Enter a URL');
    try {
      setLoading({ ...loading, url: true });
      const res = await axiosInstance.post('/api/intelligence/check-url', {
        url: urlInput,
      });
      setUrlResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'URL check failed');
    } finally {
      setLoading({ ...loading, url: false });
    }
  };

  const checkHash = async () => {
    if (!hashInput) return toast.error('Enter a file hash');
    try {
      setLoading({ ...loading, hash: true });
      const res = await axiosInstance.post('/api/intelligence/check-file', {
        hash: hashInput,
      });
      setHashResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hash check failed');
    } finally {
      setLoading({ ...loading, hash: false });
    }
  };

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-400" />
          Threat Intelligence
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Check IPs, URLs and files against threat intelligence databases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IP Check */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            IP Reputation Check
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="Enter IP address..."
              className="input"
            />
            <button
              onClick={checkIP}
              disabled={loading.ip}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading.ip ? 'Checking...' : 'Check IP'}
            </button>
          </div>

          {ipResult && (
            <div className="mt-4 space-y-2">
              <div className={`p-3 rounded-lg ${ipResult.abuse?.isMalicious ? 'bg-red-900/30 border border-red-500/30' : 'bg-green-900/30 border border-green-500/30'}`}>
                <p className={`text-sm font-medium ${ipResult.abuse?.isMalicious ? 'text-red-400' : 'text-green-400'}`}>
                  {ipResult.abuse?.isMalicious ? '⚠️ MALICIOUS IP DETECTED' : '✅ IP appears safe'}
                </p>
              </div>
              {ipResult.abuse && !ipResult.abuse.mock && (
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Abuse Score: <span className="text-white font-medium">{ipResult.abuse.abuseScore}/100</span></p>
                  <p className="text-gray-300">Country: <span className="text-white">{ipResult.abuse.country}</span></p>
                  <p className="text-gray-300">ISP: <span className="text-white">{ipResult.abuse.isp}</span></p>
                  <p className="text-gray-300">Total Reports: <span className="text-white">{ipResult.abuse.totalReports}</span></p>
                </div>
              )}
              {ipResult.geo && (
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400 font-medium mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="text-gray-300">City: <span className="text-white">{ipResult.geo.city}</span></p>
                  <p className="text-gray-300">Region: <span className="text-white">{ipResult.geo.region}</span></p>
                  <p className="text-gray-300">ISP: <span className="text-white">{ipResult.geo.isp}</span></p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* URL Check */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            URL Safety Check
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL to check..."
              className="input"
            />
            <button
              onClick={checkURL}
              disabled={loading.url}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading.url ? 'Checking...' : 'Check URL'}
            </button>
          </div>

          {urlResult && (
            <div className="mt-4 space-y-2">
              <div className={`p-3 rounded-lg ${urlResult.isMalicious ? 'bg-red-900/30 border border-red-500/30' : 'bg-green-900/30 border border-green-500/30'}`}>
                <p className={`text-sm font-medium ${urlResult.isMalicious ? 'text-red-400' : 'text-green-400'}`}>
                  {urlResult.isMalicious ? '⚠️ MALICIOUS URL' : '✅ URL appears safe'}
                </p>
              </div>
              {!urlResult.mock && (
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Malicious: <span className="text-red-400">{urlResult.malicious}</span></p>
                  <p className="text-gray-300">Suspicious: <span className="text-yellow-400">{urlResult.suspicious}</span></p>
                  <p className="text-gray-300">Harmless: <span className="text-green-400">{urlResult.harmless}</span></p>
                </div>
              )}
              {urlResult.mock && (
                <p className="text-gray-400 text-xs mt-2">
                  Add VIRUSTOTAL_API_KEY to .env for real results
                </p>
              )}
            </div>
          )}
        </div>

        {/* File Hash Check */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            File Hash Check
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter SHA256 hash..."
              className="input"
            />
            <button
              onClick={checkHash}
              disabled={loading.hash}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading.hash ? 'Checking...' : 'Check Hash'}
            </button>
          </div>

          {hashResult && (
            <div className="mt-4 space-y-2">
              <div className={`p-3 rounded-lg ${hashResult.detected ? 'bg-red-900/30 border border-red-500/30' : 'bg-green-900/30 border border-green-500/30'}`}>
                <p className={`text-sm font-medium ${hashResult.detected ? 'text-red-400' : 'text-green-400'}`}>
                  {hashResult.detected ? '⚠️ MALWARE DETECTED' : '✅ File appears safe'}
                </p>
              </div>
              {!hashResult.mock && hashResult.total && (
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Malicious: <span className="text-red-400">{hashResult.malicious}</span></p>
                  <p className="text-gray-300">Total engines: <span className="text-white">{hashResult.total}</span></p>
                </div>
              )}
              {hashResult.mock && (
                <p className="text-gray-400 text-xs mt-2">
                  Add VIRUSTOTAL_API_KEY to .env for real results
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default ThreatIntel;