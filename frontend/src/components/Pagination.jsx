import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total } = pagination;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) range.unshift('...');
    if (page + delta < pages - 1) range.push('...');

    range.unshift(1);
    if (pages > 1) range.push(pages);

    return range;
  };

  return (
    <div className="flex items-center justify-between mt-7 pt-5 border-t border-white/5">
      <p className="text-sm text-gray-400 tracking-wide">
        Showing page <span className="text-white font-medium">{page}</span> of{' '}
        <span className="text-white font-medium">{pages}</span>{' '}
        <span className="text-gray-500">({total} records)</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2.5 rounded-xl hover:bg-white/8 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <HiChevronLeft size={18} />
        </button>

        {getPageNumbers().map((num, i) =>
          num === '...' ? (
            <span key={`dot-${i}`} className="px-2 text-gray-500 select-none">
              ...
            </span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                num === page
                  ? 'bg-blue-600 text-white shadow-neon'
                  : 'hover:bg-white/8 text-gray-400'
              }`}
            >
              {num}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="p-2.5 rounded-xl hover:bg-white/8 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <HiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
