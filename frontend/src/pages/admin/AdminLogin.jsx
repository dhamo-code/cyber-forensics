import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // Non-admin tried to use admin login portal — reject them
        toast.error('Access denied. Admin credentials required.');
        dispatch({ type: 'auth/logout' });
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
      setPassword('');
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error('Please enter email and password');
      return;
    }
    dispatch(loginUser({ email: trimmedEmail, password }));
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-600/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CyberForensics</h1>
          <p className="text-gray-400 text-sm mt-1">Admin Secure Portal</p>
          {/* Red banner makes it visually distinct from user login */}
          <div className="mt-3 inline-flex items-center gap-2 bg-red-900/40 border border-red-700 text-red-300 text-xs px-3 py-1.5 rounded-full">
            <Shield className="w-3 h-3" />
            Restricted — Authorized Administrators Only
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-red-900/40 p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">
            Administrator Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In as Administrator'
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-6">
            Not an admin?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300">
              Go to user login
            </a>
          </p>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          AI-Powered Cyber Forensics Investigation System v2.0
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;