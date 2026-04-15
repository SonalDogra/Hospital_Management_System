import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/services';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineHeart, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.login(form);
      localStorage.setItem('hms_token', data.token);
      localStorage.setItem('hms_user', JSON.stringify(data.user));
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-neon-lg mb-5" style={{ width: 72, height: 72 }}>
            <HiOutlineHeart className="text-white" size={34} />
          </div>
          <h1 className="text-3xl font-bold gradient-text tracking-tight">MediCare HMS</h1>
          <p className="text-gray-400 mt-3 text-sm tracking-wide">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="glass-card p-9">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-glass pl-14"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-glass pl-14 pr-14"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold transition-all duration-300 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
