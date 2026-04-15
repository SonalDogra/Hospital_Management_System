import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { pathname } = useLocation();
  const isDashboardRoute = pathname === '/' || pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content - shifts based on sidebar state */}
      <div
        className="min-h-screen flex flex-col transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? '286px' : '0px' }}
      >
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <main
          className={`flex-1 px-6 py-8 sm:px-8 lg:px-10 w-full ${isDashboardRoute ? 'max-w-none' : 'max-w-[1440px] mx-auto'}`}
          style={isDashboardRoute ? { paddingRight: '42px', marginRight: '10px' } : undefined}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
