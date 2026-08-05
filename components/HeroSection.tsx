"use client";
import { Show, SignInButton } from "@clerk/nextjs";
import UserDashboard from "./UserDashboard";

function HeroSection() {
  return (
    <>
      <Show when="signed-out">
        <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-950 via-red-950 to-slate-900 px-4 py-12">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-3xl ring-1 ring-red-400/30">
              ✦
            </div>

            <h1 className="text-4xl font-black uppercase tracking-[0.3em] text-white">
              Microjob
            </h1>
            <p className="mt-3 text-sm font-mono text-slate-200/90">
              Earn money by completing small tasks
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-left">
              <p className="text-sm text-slate-300">Why join?</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li>• Flexible tasks you can do on your schedule</li>
                <li>• Fast payouts and simple onboarding</li>
                <li>• Earn from anywhere, anytime</li>
              </ul>
            </div>

            <SignInButton>
              <button className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-linear-to-r from-red-500 to-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition duration-200 hover:scale-[1.02] hover:from-red-400 hover:to-orange-400">
                Start Earning Now!
              </button>
            </SignInButton>
          </div>
        </div>
      </Show>
      <Show when="signed-in">
        <UserDashboard />
      </Show>
    </>
  );
}

export default HeroSection;
