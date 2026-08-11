import BackButton from "@/components/BackButton";
import { getCollection } from "@/lib/db";
import { UserDataType } from "@/types/UserData";
import { ObjectId } from "mongodb";
import Image from "next/image";

interface UserDetailsInterface extends UserDataType {
  _id: ObjectId;
}

type PageProps = {
  params: Promise<{ userId: string }>;
};

// =====================================================
// Fetch user directly from MongoDB
// =====================================================

async function fetchUserDetails(
  userId: string,
): Promise<UserDetailsInterface | null> {
  try {
    if (!ObjectId.isValid(userId)) {
      return null;
    }

    const collection = await getCollection("users", "data");

    const doc = await collection.findOne({
      _id: new ObjectId(userId),
    });

    if (!doc) {
      return null;
    }

    return doc as unknown as UserDetailsInterface;
  } catch (error) {
    console.error("Failed to fetch user details:", error);

    throw new Error("Can't fetch user details!");
  }
}

// =====================================================
// Helpers
// =====================================================

function formatDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value as string | Date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: unknown) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
}

function getDisplayName(user: UserDetailsInterface) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.username || user.email || "Unnamed User";
}

// =====================================================
// UI Components
// =====================================================

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span
        className={`break-all text-sm font-medium text-gray-900 sm:text-right ${
          mono ? "font-mono text-xs sm:text-sm" : ""
        }`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-words text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}

// =====================================================
// Page
// =====================================================

export default async function Page({
  params,
}: PageProps) {
  const { userId } = await params;

  const user = await fetchUserDetails(userId);

  // ===================================================
  // User not found
  // ===================================================

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
            !
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            User not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            No MongoDB user matched the provided ID.
          </p>

          <div className="mt-6">
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(user);

  // ===================================================
  // Page
  // ===================================================

  return (
    <main className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">

        {/* ==============================================
            Header
        ============================================== */}

        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2">
              <BackButton />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              User Details
            </h1>

            <p className="mt-1 break-all font-mono text-xs text-gray-400">
              MongoDB ID: {user._id.toString()}
            </p>
          </div>

          <div className="flex items-center">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
              {user.role || "user"}
            </span>
          </div>
        </div>

        {/* ==============================================
            Profile
        ============================================== */}

        <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="shrink-0">
              {user.imageUrl ? (
                <Image
                  width={96}
                  height={96}
                  src={user.imageUrl}
                  alt={displayName}
                  className="h-20 w-20 rounded-full border border-gray-200 object-cover sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-500 sm:h-24 sm:w-24">
                  {(
                    user.firstName?.[0] ||
                    user.email?.[0] ||
                    "U"
                  ).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                {displayName}
              </h2>

              {user.username && (
                <p className="mt-1 text-sm text-gray-500">
                  @{user.username}
                </p>
              )}

              {user.email && (
                <p className="mt-2 break-all text-sm text-gray-500">
                  {user.email}
                </p>
              )}

              {user.phone && (
                <p className="mt-1 text-sm text-gray-500">
                  {user.phone}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ==============================================
            Financial Overview
        ============================================== */}

        <section className="mb-5">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Financial Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Balance"
              value={formatMoney(user.balance)}
              description="Available balance"
            />

            <StatCard
              label="Pending"
              value={formatMoney(user.pending)}
              description="Pending earnings"
            />

            <StatCard
              label="Total Earned"
              value={formatMoney(user.totalEarned)}
              description="Lifetime earnings"
            />

            <StatCard
              label="Tasks Completed"
              value={user.tasksCompleted ?? 0}
              description="Successfully completed"
            />
          </div>
        </section>

        {/* ==============================================
            Payment Overview
        ============================================== */}

        <section className="mb-5">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              label="Payment Pending"
              value={formatMoney(user.paymentPending)}
              description="Currently awaiting payment"
            />

            <StatCard
              label="Payment Received"
              value={formatMoney(user.paymentReceived)}
              description="Total payments received"
            />
          </div>
        </section>

        {/* ==============================================
            Main Information
        ============================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Account Information */}

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Account Information
            </h2>

            <InfoRow
              label="MongoDB ID"
              value={user._id.toString()}
              mono
            />

            <InfoRow
              label="Clerk ID"
              value={user.clerkId || "Not linked"}
              mono={!!user.clerkId}
            />

            <InfoRow
              label="Email"
              value={user.email || "Not provided"}
            />

            <InfoRow
              label="Phone"
              value={user.phone || "Not provided"}
            />

            <InfoRow
              label="Username"
              value={user.username || "Not set"}
            />

            <InfoRow
              label="First Name"
              value={user.firstName || "Not set"}
            />

            <InfoRow
              label="Last Name"
              value={user.lastName || "Not set"}
            />

            <InfoRow
              label="Role"
              value={user.role || "user"}
            />
          </section>

          {/* Referral Information */}

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Referral Information
            </h2>

            <InfoRow
              label="Referral ID"
              value={user.referralId || "Not assigned"}
              mono
            />

            <InfoRow
              label="Referred By"
              value={user.referredBy || "Direct signup"}
              mono={!!user.referredBy}
            />

            <InfoRow
              label="Referral Count"
              value={user.referralCount ?? 0}
            />
          </section>

          {/* Public Metadata */}

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Public Metadata
            </h2>

            <InfoRow
              label="Metadata Role"
              value={
                user.publicMetadata?.role
                  ? String(user.publicMetadata.role)
                  : "Not set"
              }
            />

            <InfoRow
              label="Metadata Balance"
              value={formatMoney(
                user.publicMetadata?.balance,
              )}
            />

            <InfoRow
              label="Metadata Tasks Completed"
              value={
                user.publicMetadata?.tasksCompleted ?? 0
              }
            />
          </section>

          {/* Account Timeline */}

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Account Timeline
            </h2>

            <InfoRow
              label="Created"
              value={formatDate(user.createdAt)}
            />

            <InfoRow
              label="Last Updated"
              value={formatDate(user.updatedAt)}
            />
          </section>
        </div>

        {/* ==============================================
            Cooldowns
        ============================================== */}

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Task Cooldowns
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Active cooldown timers associated with this account.
            </p>
          </div>

          {user.cooldowns &&
          Object.keys(user.cooldowns).length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Task
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Cooldown Until
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(user.cooldowns).map(
                    ([taskId, cooldown]) => (
                      <tr
                        key={taskId}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {taskId}
                        </td>

                        <td className="px-4 py-3 text-gray-700">
                          {formatDate(cooldown)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
              <p className="text-sm text-gray-400">
                No cooldowns recorded.
              </p>
            </div>
          )}
        </section>

        {/* ==============================================
            Technical Information
        ============================================== */}

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Technical Information
          </h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                MongoDB ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-gray-700">
                {user._id.toString()}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Clerk ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-gray-700">
                {user.clerkId || "Not linked"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Referral ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-gray-700">
                {user.referralId || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Referred By
              </p>

              <p className="mt-2 break-all font-mono text-xs text-gray-700">
                {user.referredBy || "—"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
