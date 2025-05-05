export function Button({ children, onClick, className = '' }) {
  return (
    <button
      className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
