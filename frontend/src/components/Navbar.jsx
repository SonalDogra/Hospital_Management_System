import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBars3, HiOutlineBell, HiOutlineArrowRightOnRectangle, HiOutlineUser, HiOutlineXMark } from 'react-icons/hi2';

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('hms_user') || '{}');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/5"
      style={{
        background: 'rgba(15, 21, 32, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between px-6 sm:px-8 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2.5 rounded-xl hover:bg-white/8 transition-all duration-200 active:scale-95"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <HiOutlineXMark size={22} /> : <HiOutlineBars3 size={22} />}
          </button>
          <div className="hidden sm:block">
            <h2 className="text-base font-semibold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user.name || 'Admin'}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 tracking-wide">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-white/8 transition-all duration-200 group">
            <HiOutlineBell size={20} className="text-gray-400 group-hover:text-white transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/8 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {(user.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-tight">{user.name || 'Admin'}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{user.email || 'admin@hospital.com'}</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-navy-800 border border-white/10 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
                <div className="p-5 border-b border-white/8">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{user.email}</p>
                </div>
                <div className="p-2">
                  <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200">
                    <HiOutlineUser size={16} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/8 transition-all duration-200"
                  >
                    <HiOutlineArrowRightOnRectangle size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
