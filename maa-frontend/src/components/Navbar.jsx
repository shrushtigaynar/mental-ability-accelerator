import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          Mental Ability <span className="text-blue-600">Accelerator</span>
        </Link>
        <div className="hidden gap-6 text-sm font-medium text-slate-600 sm:flex">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <Link to="/" className="hover:text-slate-900">
            Features
          </Link>
          <Link to="/" className="hover:text-slate-900">
            Pricing
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-slate-300 px-4 py-1.5 text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            Login
          </Link>
          <Link
            to="/dashboard"
            className="hover:text-slate-900"
          >
            Dashboard
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 p-2 text-slate-700 transition hover:border-blue-500 hover:text-blue-600 sm:hidden"
          aria-label="Open navigation menu"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
      </nav>
    </header>
  );
}
