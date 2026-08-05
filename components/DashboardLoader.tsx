"use client";
function DashboardLoader() {
  return (
    <div>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#111827_100%)] p-4 text-white sm:p-6 lg:p-8">
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-3xl border border-white/10 bg-white/10 px-8 py-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-10">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-950/50">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-300 border-r-fuchsia-400" />
              <div className="h-7 w-7 rounded-full bg-linear-to-br from-cyan-400 to-fuchsia-500 opacity-80" />
            </div>
            <p className="mt-6 text-lg font-semibold uppercase tracking-[0.24em] text-slate-100">
              Loading User Dashboard
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Syncing ...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLoader;
