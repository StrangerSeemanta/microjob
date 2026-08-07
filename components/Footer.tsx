import React from "react";
import FooterBtn from "./FooterBtn";

function Footer() {
  return (
    <div className="mt-6 s rounded-3xl border border-black bg-white/80 p-5 shadow-2xl backdrop-blur lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.5 19.5v-2.25A2.25 2.25 0 0 1 10.75 15h2.5a2.25 2.25 0 0 1 2.25 2.25V19.5M12 12a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 18.75A3.75 3.75 0 0 1 9 15h.75M15 15h.75a3.75 3.75 0 0 1 3.75 3.75"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Customer Service
            </p>
            <p className="mt-1 text-base font-medium text-slate-700">
              Need help? Join our Telegram support group.
            </p>
          </div>
        </div>

        <FooterBtn />
      </div>
    </div>
  );
}

export default Footer;
