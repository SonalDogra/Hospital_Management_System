const LoadingSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex gap-5 mb-7">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton h-5 flex-1 rounded-lg" />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-5 py-4 px-2 rounded-xl"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="skeleton h-4 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="skeleton h-12 w-12 rounded-xl" />
            <div className="skeleton h-5 w-16 rounded-lg" />
          </div>
          <div className="skeleton h-9 w-24 rounded-lg" />
          <div className="skeleton h-4 w-36 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
