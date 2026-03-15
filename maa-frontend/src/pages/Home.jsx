import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import Features from "../components/Features.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <Features />
        <section
          id="pricing"
          className="border-t border-slate-800 bg-slate-950 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Simple pricing for serious training
            </h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              One plan, unlimited challenges. Pause or cancel anytime.
            </p>
            <div className="mt-8 inline-flex flex-col items-center rounded-3xl border border-slate-800 bg-slate-900/70 px-10 py-8 text-left shadow-[0_18px_45px_rgba(15,23,42,0.8)] sm:flex-row sm:items-end sm:gap-10">
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Pro Training
                </p>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-white">
                    $19
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Launch with a focused daily training habit.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-slate-300 sm:mt-0">
                <li>✓ Unlimited daily challenges</li>
                <li>✓ All three training tracks</li>
                <li>✓ Progress tracking & streaks</li>
                <li>✓ Priority support</li>
              </ul>
              <a
                href="#login"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-sky-400 hover:to-blue-500 sm:mt-0 sm:ml-auto"
              >
                Start Training
              </a>
            </div>
          </div>
        </section>
        <section
          id="login"
          className="border-t border-slate-800 bg-slate-950 py-10 text-center text-xs text-slate-400"
        >
          <p>
            Login and authentication will live here. For now, enjoy the
            preview.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

