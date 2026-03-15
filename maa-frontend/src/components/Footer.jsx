export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/95">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-center sm:text-left">
          © {year} Mental Ability Accelerator. All rights reserved.
        </p>
        <p className="text-center sm:text-right">
          Built to help you think clearer, faster, and longer.
        </p>
      </div>
    </footer>
  );
}
