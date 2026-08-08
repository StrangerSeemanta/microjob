"use client";

import { UserDataType } from "@/types/UserData";
import { SignOutButton, UserAvatar, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardLoader from "./DashboardLoader";
import { Copy, CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "./ui/toast";
import { addPhoneNumber } from "@/app/actions/addPhone";
import Footer from "./Footer";

function UserDashboard() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentUser, setUser] = useState<UserDataType | null>(null);
  const [copyButtonText, setCopyButtonText] = useState<
    "Copy" | "Copying" | "Copied"
  >("Copy");
  const [isSubmittingPhone, setSubmitPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [referredBy, setReferredBy] = useState<string>("");

  const { user } = useUser();
  useEffect(() => {
    const updateCurrentUserData = async () => {
      const response = await fetch("/api/user/sync", {
        method: "POST",
      }).catch(console.error);

      if (!response || !response.ok) {
        console.error("Failed to sync user data");
        throw new Error("Failed to sync user data");
      }

      const responseData = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!responseData.success) {
        console.error("Failed To sync ", responseData.message);
        throw new Error(`Failed To sync ??  ${responseData.message}`);
      }

      return response;
    };

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user");

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    updateCurrentUserData()
      .then(async (r) => {
        if (!r || !r.ok) {
          throw new Error("Failed to sync user data...");
        }
        await fetchUserData();
        setLoadingUser(false);
      })
      .catch((error) => {
        console.error("Error syncing user data:", error);
        setLoadingUser(false);
      });
  }, [user]);

  if (loadingUser) {
    return <DashboardLoader />;
  }
  if (!currentUser) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-lg text-red-500 font-bold">
          ❌ User data not available.
        </h1>
        <p className="mt-2 text-white">
          Please try again later or contact support.
        </p>
        <SignOutButton>
          <button className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
            Logout
          </button>
        </SignOutButton>
      </div>
    );
  }

  const role =
    typeof currentUser.publicMetadata?.role === "string"
      ? currentUser.publicMetadata.role
      : currentUser.role || "n/a";

  const balance = Number(currentUser.balance);

  const formattedBalance = formatCurrency(balance);

  const displayName =
    [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
    currentUser.username ||
    "User";

  const primaryEmail = currentUser.email || "No email";
  const joinedDate = currentUser.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(currentUser.createdAt))
    : "N/A";

  const handleSubmitPhone = async (e: FormData) => {
    try {
      setSubmitPhone(true);
      const result = await addPhoneNumber(e);
      if (result.success) {
        toast.add({
          type: "success",
          title: "Phone Number Added",
          description: "Phone Number Added successfully to the server.",
        });
      } else {
        toast.add({
          type: "error",
          title: "Failed To Phone Number",
          description: result.message,
        });
        throw new Error(result.message);
      }
      const referralId = e.get("referredBy")?.toString().trim();
      if (!referralId) {
        window.location.reload();
        return;
      }
      const response = await fetch("/api/referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referralId,
        }),
      });
      const d = response.json() as unknown as {
        success: boolean;
        message: string;
      };
      if (d.success) {
        toast.add({
          type: "success",
          title: "Referrals Added",
          description: "You have received the bonus",
        });
      } else {
        toast.add({
          type: "error",
          title: "Failed to add Referrals ",
          description:
            "Something Went Wrong. You can't receive referrals, try later",
        });
      }
      window.location.reload();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Error happened",
        description: String(error),
      });
      setSubmitPhone(false);
    } finally {
      setSubmitPhone(false);
    }
  };
  if (!currentUser.phone) {
    return (
      <>
        <form action={handleSubmitPhone}>
          <div className="w-full min-h-screen flex flex-col flex-wrap gap-4 justify-center items-center">
            <label
              htmlFor="title"
              className="text-lg font-medium text-slate-200"
            >
              ENTER YOUR PHONE NUMBER
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(String(e.target.value.trim()))}
              placeholder="Enter your phone number"
              className="w-3/4 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            />{" "}
            <label
              htmlFor="title"
              className="text-lg font-medium text-slate-200"
            >
              Referral Id {"(who referred you)"}
            </label>
            <input
              type="text"
              name="referredBy"
              id="referredBy"
              value={referredBy}
              onChange={(e) => setReferredBy(String(e.target.value.trim()))}
              placeholder="Enter referral id"
              className="w-3/4 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 via-cyan-500 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmittingPhone}
              >
                {isSubmittingPhone ? "Submitting..." : "Add Phone number"}
              </button>
            </div>
          </div>
        </form>
      </>
    );
  }
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#111827_100%)] p-3 text-white sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="bg-linear-to-br from-slate-950 via-red-950 to-slate-900 p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="shrink-0 rounded-2xl border border-white/30 bg-white/20 p-2 shadow-lg shadow-black/20">
                <UserAvatar />
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="wrap-break-word text-2xl font-semibold sm:text-3xl">
                    {currentUser ? displayName : "Loading profile..."}
                  </h2>
                  <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                    {role}
                  </span>
                </div>
                <p className="break-all text-sm text-slate-100 sm:text-base">
                  {primaryEmail}
                </p>{" "}
                <p className="break-all text-sm text-slate-100 sm:text-base">
                  {currentUser.phone}
                </p>
                <p className="text-sm text-slate-100/90">Joined {joinedDate}</p>
              </div>
            </div>

            <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
              <div className="w-full rounded-2xl border border-white/20 bg-slate-950/30 px-4 py-3 text-left shadow-lg backdrop-blur sm:w-auto sm:text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-200">
                  Available balance
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-300">
                  BDT {formattedBalance}
                </p>
              </div>

              <SignOutButton>
                <button className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-white/80 sm:w-auto">
                  Logout
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
        {/* Banner */}
        <div>hello</div>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 shadow-inner shadow-black/20 sm:p-6">
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                  Profile overview
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  Your dashboard
                </h3>
              </div>
              <div className="w-fit rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-200">
                Active
              </div>
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-white/10 p-4 pr-24 sm:pr-28">
              <p className="text-sm text-slate-400">User Id</p>
              <p className="mt-1 break-all text-sm font-semibold">
                {currentUser.clerkId}
              </p>
              <div
                onClick={async () => {
                  if (copyButtonText === "Copied") return;
                  try {
                    setCopyButtonText("Copying");
                    // Copy the input value to the clipboard
                    await navigator.clipboard.writeText(currentUser.clerkId);

                    // Provide visual feedback to the user
                    setCopyButtonText("Copied");

                    // Reset the button text after 2 seconds
                    setTimeout(() => {
                      setCopyButtonText("Copy");
                    }, 2000);
                  } catch (err) {
                    console.error("Failed to copy text: ", err);
                    setCopyButtonText("Copy");
                  }
                }}
                className="group absolute right-2 top-2 flex flex-wrap items-center justify-between gap-2 rounded-full border border-white/20 bg-slate-950/30 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-white hover:text-black"
              >
                <Copy size={10} /> <span>{copyButtonText}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-400">Role</p>
                <p className="mt-1 text-lg font-semibold">{role}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-1 text-sm font-semibold">{primaryEmail}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-400">Member since</p>
                <p className="mt-1 text-lg font-semibold">{joinedDate}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 shadow-inner shadow-black/20 sm:p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Quick stats
            </p>
            {/* Balance Stats */}
            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-emerald-200">Current balance</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {formattedBalance}
                  </p>
                </div>
                <Link
                  href={"/user/withdraw"}
                  className="flex w-fit items-center justify-center gap-2 rounded-full border border-white/20 bg-slate-950/30 px-3 py-2 text-base font-medium text-slate-200 transition hover:bg-white hover:text-black"
                >
                  <CreditCard />
                  Withdraw
                </Link>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                <p className="text-sm text-cyan-200">Task Completed</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {currentUser.tasksCompleted || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4 lg:p-8">
          {role === "admin" && (
            <Link
              href="/admin"
              className="group flex min-h-32 flex-col justify-between rounded-3xl border border-blue-400/30 bg-blue-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-blue-500 sm:min-h-36"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                Admin
              </span>
              <span className="text-xl font-semibold text-white">
                Admin Panel
              </span>
            </Link>
          )}

          <Link
            href="/user/tasks"
            className="group flex min-h-32 flex-col justify-between rounded-3xl border border-sky-400/30 bg-sky-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-sky-500 sm:min-h-36"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
              Work
            </span>
            <span className="text-xl font-semibold text-white">Tasks</span>
          </Link>

          <Link
            href="/user/profile"
            className="group flex min-h-32 flex-col justify-between rounded-3xl border border-rose-400/30 bg-rose-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-rose-500 sm:min-h-36"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-100">
              Account
            </span>
            <span className="text-xl font-semibold text-white">Profile</span>
          </Link>

          <Link
            href="/user/refer"
            className="group flex min-h-32 flex-col justify-between rounded-3xl border border-emerald-400/30 bg-emerald-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-emerald-500 sm:min-h-36"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">
              Referral
            </span>
            <span className="text-xl font-semibold text-white">
              Refer A Friend
            </span>
          </Link>
        </div>

        {/* footer */}
        <Footer />
      </div>
    </div>
  );
}

export default UserDashboard;
