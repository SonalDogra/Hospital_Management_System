const StatsCard = ({ icon, label, value, trend, color = 'blue', delay = 0, className = '' }) => {
  const colorMap = {
    blue: {
      bg: 'from-blue-600/15 to-blue-800/15',
      icon: 'bg-blue-500/15 text-blue-400',
      border: 'border-blue-500/15',
      glow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]',
    },
    green: {
      bg: 'from-emerald-600/15 to-emerald-800/15',
      icon: 'bg-emerald-500/15 text-emerald-400',
      border: 'border-emerald-500/15',
      glow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
    },
    purple: {
      bg: 'from-purple-600/15 to-purple-800/15',
      icon: 'bg-purple-500/15 text-purple-400',
      border: 'border-purple-500/15',
      glow: 'group-hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
    },
    amber: {
      bg: 'from-amber-600/15 to-amber-800/15',
      icon: 'bg-amber-500/15 text-amber-400',
      border: 'border-amber-500/15',
      glow: 'group-hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
    },
    rose: {
      bg: 'from-rose-600/15 to-rose-800/15',
      icon: 'bg-rose-500/15 text-rose-400',
      border: 'border-rose-500/15',
      glow: 'group-hover:shadow-[0_0_40px_rgba(244,63,94,0.15)]',
    },
    cyan: {
      bg: 'from-cyan-600/15 to-cyan-800/15',
      icon: 'bg-cyan-500/15 text-cyan-400',
      border: 'border-cyan-500/15',
      glow: 'group-hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]',
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`group glass-card px-5 py-5 pb-6 lg:px-6 lg:py-6 lg:pb-7 bg-gradient-to-br ${c.bg} border ${c.border} animate-slide-up ${c.glow} transition-all duration-500 ease-out min-h-[96px] sm:min-h-[108px] shadow-[0_8px_22px_rgba(0,0,0,0.24)] hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_16px_36px_rgba(0,0,0,0.35)] ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl transition-transform duration-500 ease-out group-hover:scale-110 ${c.icon}`}
          style={{ marginLeft: '16px', marginTop: '10px' }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              trend > 0
                ? 'bg-emerald-500/12 text-emerald-400'
                : 'bg-rose-500/12 text-rose-400'
            }`}
          >
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      <div style={{ marginTop: '8px' }}>
        <h3
          className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-white mb-2 tracking-tight leading-tight"
          style={{ marginLeft: '16px', marginTop: '10px' }}
        >
          {value}
        </h3>
        <p
          className="text-xs sm:text-sm text-gray-400 tracking-wide leading-relaxed"
          style={{ marginLeft: '16px' }}
        >
          {label}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
