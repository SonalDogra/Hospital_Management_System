import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/services';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlineHeart, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('hms_token', data.token);
      localStorage.setItem('hms_user', JSON.stringify(data.user));
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-neon-lg mb-5" style={{ width: 72, height: 72 }}>
            <HiOutlineHeart className="text-white" size={34} />
          </div>
          <h1 className="text-3xl font-bold gradient-text tracking-tight">Create Account</h1>
          <p className="text-gray-400 mt-3 text-sm tracking-wide">Join MediCare Hospital System</p>
        </div>

        {/* Form */}
        <div className="glass-card p-9">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="text-sm font-medium text-gray-300">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-glass pl-14"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            <div className="form-group">
              <label className="text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input-glass pl-14"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold transition-all duration-300 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
