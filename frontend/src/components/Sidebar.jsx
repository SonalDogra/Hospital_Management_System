import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineClipboardDocument,
  HiOutlineBanknotes,
  HiOutlineBeaker,
  HiOutlineBuildingOffice2,
  HiOutlineHeart,
} from 'react-icons/hi2';

const menuItems = [
  { path: '/', icon: <HiOutlineHome size={20} />, label: 'Dashboard' },
  { path: '/patients', icon: <HiOutlineUsers size={20} />, label: 'Patients' },
  { path: '/doctors', icon: <HiOutlineUserGroup size={20} />, label: 'Doctors' },
  { path: '/appointments', icon: <HiOutlineCalendar size={20} />, label: 'Appointments' },
  { path: '/prescriptions', icon: <HiOutlineClipboardDocument size={20} />, label: 'Prescriptions' },
  { path: '/billing', icon: <HiOutlineBanknotes size={20} />, label: 'Billing' },
  { path: '/medicines', icon: <HiOutlineBeaker size={20} />, label: 'Medicines' },
  { path: '/departments', icon: <HiOutlineBuildingOffice2 size={20} />, label: 'Departments' },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[272px] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(15, 21, 32, 0.98) 0%, rgba(20, 28, 43, 0.98) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3.5 px-7 py-7 border-b border-white/5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-neon flex-shrink-0">
            <HiOutlineHeart className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text leading-tight">MediCare</h1>
            <p className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mt-0.5">Hospital System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-7 px-4">
          <p className="px-4 mb-4 text-[10px] font-semibold text-gray-500 tracking-[0.15em] uppercase">
            Main Menu
          </p>
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13.5px] font-medium tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'active bg-blue-600/10 text-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`
                  }
                  end={item.path === '/'}
                >
                  <span className="flex-shrink-0 opacity-80">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/5">
          <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-600/8 to-purple-600/8 border border-white/5">
            <p className="text-xs text-gray-400 mb-1 font-medium">Hospital Management</p>
            <p className="text-[10px] text-gray-600 tracking-wide">v1.0.0 — Built with ❤️</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
