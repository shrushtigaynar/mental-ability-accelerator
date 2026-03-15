export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-1/2 aspect-[1108/632] w-[72rem] -translate-x-1/2 bg-gradient-to-tr from-blue-500 via-sky-400 to-violet-500 opacity-30" />
      </div>
      <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center gap-10 px-4 py-20 text-center sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div className="max-w-xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
            Cognitive Training SaaS
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Train Your Brain{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Faster
            </span>
          </h1>
          <p className="text-pretty text-base text-slate-300 sm:text-lg">
            Daily mental challenges designed by cognitive scientists to boost
            your memory, focus, and processing speed in just 10 minutes a day.
          </p>
          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-start">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-sky-400 hover:to-blue-500"
            >
              Start Training
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-full border border-slate-600/70 bg-slate-900/60 px-8 py-3 text-sm font-semibold text-slate-100 backdrop-blur transition hover:border-slate-400 hover:bg-slate-900/90"
            >
              View Demo
            </a>
          </div>
        </div>
        <div className="mt-8 w-full max-w-md lg:mt-0">
          <div className="relative rounded-3xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                Daily streak
              </span>
              <span>12 days</span>
            </div>
            <div className="mb-6 grid grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="rounded-2xl bg-slate-800/80 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Memory
                </p>
                <p className="mt-1 text-lg font-semibold text-sky-300">+24%</p>
              </div>
              <div className="rounded-2xl bg-slate-800/80 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Reasoning
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-300">
                  +18%
                </p>
              </div>
              <div className="rounded-2xl bg-slate-800/80 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Speed
                </p>
                <p className="mt-1 text-lg font-semibold text-violet-300">
                  +31%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Today&apos;s challenge</span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-sky-300">
                10 min • Level 3
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
