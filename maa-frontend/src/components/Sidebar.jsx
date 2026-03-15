import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Performance Analytics', path: '/weak-topics', icon: '📊' },
    { label: 'AI Recommendations', path: '/recommendations', icon: '🤖' },
    { label: 'Friend Streaks', path: '/friends', icon: '👥' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('maa_token');
    localStorage.removeItem('maa_user');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <p className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
          Mental Ability
        </p>
        <p className="text-lg font-bold text-white">Accelerator</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              location.pathname === item.path
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
