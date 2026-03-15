const features = [
  {
    title: "Memory Training",
    description:
      "Scientifically designed recall drills that strengthen your short-term and working memory with adaptive difficulty.",
    accent: "from-sky-400/10 to-sky-500/10 border-sky-500/40",
    iconColor: "bg-sky-500/80",
  },
  {
    title: "Logical Reasoning",
    description:
      "Daily logic puzzles and pattern recognition exercises to sharpen your analytical thinking.",
    accent: "from-emerald-400/10 to-emerald-500/10 border-emerald-500/40",
    iconColor: "bg-emerald-500/80",
  },
  {
    title: "Speed Challenges",
    description:
      "Rapid-fire challenges that improve processing speed and reaction time without sacrificing accuracy.",
    accent: "from-violet-400/10 to-violet-500/10 border-violet-500/40",
    iconColor: "bg-violet-500/80",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="border-t border-slate-800 bg-slate-950 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built for sustainable{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              mental performance
            </span>
          </h2>
          <p className="mt-3 text-pretty text-sm text-slate-400 sm:text-base">
            Three core training tracks that work together to upgrade how you
            think, remember, and react every day.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-b ${feature.accent} p-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)] transition-transform hover:-translate-y-1.5`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl ${feature.iconColor} text-white shadow-lg shadow-black/30`}
                >
                  <span className="text-lg leading-none">★</span>
                </div>
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  {feature.title}
                </h3>
              </div>
              <p className="mt-4 text-xs text-slate-300 sm:text-sm">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
