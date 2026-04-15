import { useState, useEffect } from 'react';
import { dashboardService } from '../services/services';
import StatsCard from '../components/StatsCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineBanknotes,
  HiOutlineCurrencyDollar,
  HiOutlineBeaker,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [appointmentChart, setAppointmentChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appointmentsRes, chartRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentAppointments(),
        dashboardService.getAppointmentChart(),
      ]);
      setStats(statsRes.data.data);
      setRecentAppointments(appointmentsRes.data.data);
      setAppointmentChart(chartRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Scheduled: 'badge-scheduled',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled',
  };

  const pieData = stats ? [
    { name: 'Paid', value: Number(stats.totalRevenue) || 0 },
    { name: 'Pending', value: Number(stats.pendingAmount) || 0 },
  ] : [];

  const COLORS = ['#4ade80', '#fbbf24'];
  const hasAppointmentData = appointmentChart.length > 0;
  const chartData = hasAppointmentData
    ? appointmentChart
    : [{ month: 'No Data', completed: 0, scheduled: 0, cancelled: 0 }];
  const hasPieData = pieData.some((item) => item.value > 0);
  const pieChartData = hasPieData ? pieData : [{ name: 'No Data', value: 1 }];
  const pieColors = hasPieData ? COLORS : ['rgba(148, 163, 184, 0.45)'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl p-4 shadow-xl border border-white/8" style={{ background: 'rgba(20, 28, 43, 0.95)', backdropFilter: 'blur(8px)' }}>
          <p className="text-sm text-gray-300 mb-2 font-medium">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: p.color }}>
              {p.name}: <span className="font-semibold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-8 lg:space-y-10 animate-fade-in dashboard-shell">
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="glass-card p-6 h-64 skeleton rounded-3xl" />
          <div className="glass-card p-6 h-64 skeleton rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10 animate-fade-in dashboard-shell" style={{ marginTop: '18px' }}>
      {/* Stats Cards — Row 1 */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 dashboard-stats-grid"
        style={{ marginTop: '14px', marginBottom: '22px' }}
      >
        <StatsCard
          icon={<HiOutlineUsers size={24} />}
          label="Total Patients"
          value={stats?.totalPatients || 0}
          color="blue"
          delay={0}
        />
        <StatsCard
          icon={<HiOutlineUserGroup size={24} />}
          label="Total Doctors"
          value={stats?.totalDoctors || 0}
          color="green"
          delay={100}
        />
        <StatsCard
          icon={<HiOutlineCalendar size={24} />}
          label="Appointments"
          value={stats?.totalAppointments || 0}
          color="purple"
          delay={200}
        />
        <StatsCard
          icon={<HiOutlineBanknotes size={24} />}
          label="Pending Bills"
          value={stats?.pendingBills || 0}
          color="amber"
          delay={300}
        />
      </div>

      {/* Stats Cards — Row 2 */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 dashboard-stats-grid"
        style={{ marginTop: '6px' }}
      >
        <StatsCard
          icon={<HiOutlineCurrencyDollar size={24} />}
          label="Total Revenue"
          value={`$${Number(stats?.totalRevenue || 0).toLocaleString()}`}
          color="cyan"
          delay={400}
        />
        <StatsCard
          icon={<HiOutlineBanknotes size={24} />}
          label="Pending Amount"
          value={`$${Number(stats?.pendingAmount || 0).toLocaleString()}`}
          color="rose"
          delay={500}
        />
        <StatsCard
          icon={<HiOutlineBeaker size={24} />}
          label="Total Medicines"
          value={stats?.totalMedicines || 0}
          color="purple"
          delay={600}
        />
        <StatsCard
          icon={<HiOutlineExclamationTriangle size={24} />}
          label="Low Stock Medicines"
          value={stats?.lowStockMedicines || 0}
          color="amber"
          delay={700}
        />
      </div>

      {/* Charts Row */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10"
        style={{ marginTop: '24px', marginBottom: '24px' }}
      >
        {/* Appointments Chart */}
        <div className="lg:col-span-2 glass-card p-6 md:p-7 lg:p-8 animate-slide-up shadow-[0_10px_34px_rgba(0,0,0,0.32)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]" style={{ animationDelay: '200ms' }}>
          <h3
            className="text-lg lg:text-xl font-semibold text-white mb-6 tracking-tight leading-snug"
            style={{ marginLeft: '16px' }}
          >
            Appointment Overview
          </h3>
          <div className="w-full h-[280px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={240}>
              <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} dy={8} />
              <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} dx={-8} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }} />
              <Bar dataKey="completed" name="Completed" fill="#4ade80" radius={[6, 6, 0, 0]} />
              <Bar dataKey="scheduled" name="Scheduled" fill="#60a5fa" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cancelled" name="Cancelled" fill="#f87171" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!hasAppointmentData && (
            <p className="text-xs text-gray-500 mt-3 pl-1.5">No appointment chart data available yet.</p>
          )}
        </div>

        {/* Revenue Pie */}
        <div className="glass-card p-6 md:p-7 lg:p-8 animate-slide-up shadow-[0_10px_34px_rgba(0,0,0,0.32)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]" style={{ animationDelay: '300ms' }}>
          <h3
            className="text-lg lg:text-xl font-semibold text-white mb-6 tracking-tight leading-snug"
            style={{ marginLeft: '16px' }}
          >
            Revenue Status
          </h3>
          <div className="w-full h-[250px] md:h-[270px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={220}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((entry, i) => (
                  <Cell key={i} fill={pieColors[i] || pieColors[0]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4 pl-1.5">
            {hasPieData ? pieData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-sm text-gray-400 tracking-wide">{entry.name}</span>
              </div>
            )) : (
              <span className="text-xs text-gray-500">No revenue distribution data available yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="glass-card animate-slide-up overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.32)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(0,0,0,0.45)]" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between px-7 md:px-8 py-5 md:py-6 border-b border-white/5">
          <h3
            className="text-lg font-semibold text-white tracking-tight"
            style={{ marginLeft: '16px' }}
          >
            Recent Appointments
          </h3>
          <span className="text-xs text-gray-500 bg-white/5 px-4 py-2 rounded-full font-medium tracking-wide">Latest 5</span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '40px' }}>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map((apt) => (
                <tr key={apt.appointment_id}>
                  <td className="text-gray-200 font-medium" style={{ paddingLeft: '40px' }}>{apt.patient_name}</td>
                  <td className="text-gray-300">{apt.doctor_name}</td>
                  <td className="text-gray-400">
                    {new Date(apt.appointment_date).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${statusColors[apt.status]}`}>{apt.status}</span>
                  </td>
                </tr>
              ))}
              {recentAppointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
