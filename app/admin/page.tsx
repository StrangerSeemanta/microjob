import { BanknoteArrowDown, Database, ListPlus, Users } from "lucide-react";
import Link from "next/link";

function page() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#111827_100%)] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-4xl border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="bg-linear-to-br from-slate-950 via-red-950 to-slate-900 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-200">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Admin console
              </div>
              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
                Manage key actions from one place with a streamlined workflow.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Quick access
              </p>
              <p className="mt-1 font-semibold text-white">
                3 admin tools ready
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3 lg:p-8">
          <Link
            href="/admin/add_task"
            className="group flex min-h-40 flex-col justify-between rounded-3xl border border-blue-400/30 bg-blue-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-blue-500"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                Create
              </span>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-2xl">
                <ListPlus />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Add Task</h2>
              <p className="mt-2 text-sm text-blue-50/80">
                Create and publish new tasks for users.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/manage_task"
            className="group flex min-h-40 flex-col justify-between rounded-3xl border border-blue-400/30 bg-orange-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-orange-900"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                Manage
              </span>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-2xl">
                <ListPlus />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Manage Task</h2>
              <p className="mt-2 text-sm text-blue-50/80">
                Delete Tasks for users.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/manage_users"
            className="group flex min-h-40 flex-col justify-between rounded-3xl border border-emerald-400/30 bg-emerald-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-emerald-500"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Manage
              </span>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-2xl">
                <Users />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Manage Users</h2>
              <p className="mt-2 text-sm text-emerald-50/80">
                Review user accounts and manage access.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/withdrawals"
            className="group flex min-h-40 flex-col justify-between rounded-3xl border border-amber-400/30 bg-amber-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-amber-500"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100">
                Finance
              </span>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-2xl">
                <BanknoteArrowDown />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Withdraw Requests
              </h2>
              <p className="mt-2 text-sm text-amber-50/80">
                Approve or review pending withdrawal requests.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/customer_support"
            className="group flex min-h-40 flex-col justify-between rounded-3xl border border-fuchsia-400/30 bg-fuchsia-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-fuchsia-500"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-fuchsia-100">
                Manage
              </span>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-2xl">
                <Database />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Customer Support
              </h2>
              <p className="mt-2 text-sm text-amber-50/80">
                Manage Customer Support
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default page;
