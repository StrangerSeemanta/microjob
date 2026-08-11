import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";
import { ObjectId } from "mongodb";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import SearchUsers from "./SearchUsers";
// import DeleteUserBtn from "./DeleteUserBtn";
import CreatedAtUserComp from "./CreatedAtUserComp";

import { formatCurrency } from "@/utils/formatCurrency";

interface PageProps {
searchParams: Promise<{
search?: string;
page?: string;
}>;
}

export default async function AdminManageUsersPage({
searchParams,
}: PageProps) {
// ----------------------------------------
// Authentication
// ----------------------------------------

const { authenticated, user: currentUser } =
await getAuthenticatedUser();

if (!authenticated || !currentUser) {
redirect("/unauthorized");
}

// ----------------------------------------
// Admin check
// ----------------------------------------

const role =
currentUser.role ??
currentUser.publicMetadata?.role ??
"user";

if (String(role).toLowerCase() !== "admin") {
redirect("/unauthorized");
}

// ----------------------------------------
// Connect MongoDB
// ----------------------------------------

await connectDB();

// ----------------------------------------
// Search params
// ----------------------------------------

const params = await searchParams;

const query = params.search?.trim() ?? "";

const limit = 10;

const parsedPage = Number(params.page ?? "1");

const currentPage =
Number.isFinite(parsedPage) && parsedPage >= 1
? Math.floor(parsedPage)
: 1;

const skip = (currentPage - 1) * limit;

// ----------------------------------------
// Build MongoDB filter
// ----------------------------------------

let filter: Record<string, unknown> = {};

if (query) {
const searchConditions: Record<string, unknown>[] = [
{
username: {
$regex: query,
$options: "i",
},
},

  {
    email: {
      $regex: query,
      $options: "i",
    },
  },

  {
    firstName: {
      $regex: query,
      $options: "i",
    },
  },

  {
    lastName: {
      $regex: query,
      $options: "i",
    },
  },

  {
    clerkId: {
      $regex: query,
      $options: "i",
    },
  },

  {
    referralId: {
      $regex: query,
      $options: "i",
    },
  },

  {
    referredBy: {
      $regex: query,
      $options: "i",
    },
  },
];

// ----------------------------------------
// Search MongoDB _id
// ----------------------------------------

if (ObjectId.isValid(query)) {
  searchConditions.push({
    _id: new ObjectId(query),
  });
}

filter = {
  $or: searchConditions,
};

}

// ----------------------------------------
// Fetch users
// ----------------------------------------

const [users, totalCount] = await Promise.all([
User.find(filter)
.sort({ createdAt: -1 })
.skip(skip)
.limit(limit)
.lean(),

User.countDocuments(filter),

]);

// ----------------------------------------
// Pagination
// ----------------------------------------

const totalPages = Math.max(
1,
Math.ceil(totalCount / limit),
);

const createPageUrl = (page: number) => {
const search = new URLSearchParams();

if (query) {
  search.set("search", query);
}

search.set("page", String(page));

return `/admin/manage_users?${search.toString()}`;

};

const showingFrom =
totalCount === 0 ? 0 : skip + 1;

const showingTo = Math.min(
skip + users.length,
totalCount,
);

// ----------------------------------------
// Page
// ----------------------------------------

return ( <div className="mx-auto w-full max-w-4xl px-4 py-8"> <Link
     href="/"
     className="mb-4 flex items-center gap-2 rounded-lg bg-white p-3 text-blue-600 underline"
   > <Home className="h-5 w-5" />
Home </Link>

  <SearchUsers />

  <div className="mt-6 flex items-center justify-between gap-3 text-sm">
    <h1 className="font-semibold text-white">
      Total Users: {totalCount}
    </h1>

    <span className="text-slate-300">
      Showing {showingFrom}-{showingTo}
    </span>
  </div>

  {totalPages > 1 && (
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      <Link
        href={createPageUrl(
          Math.max(1, currentPage - 1),
        )}
        className={`rounded-md border px-3 py-1.5 text-sm ${
          currentPage === 1
            ? "pointer-events-none border-slate-700 bg-slate-800 text-slate-500"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        }`}
      >
        Prev
      </Link>

      {Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      ).map((page) => (
        <Link
          key={page}
          href={createPageUrl(page)}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            page === currentPage
              ? "border-white bg-red-700 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={createPageUrl(
          Math.min(
            totalPages,
            currentPage + 1,
          ),
        )}
        className={`rounded-md border px-3 py-1.5 text-sm ${
          currentPage === totalPages
            ? "pointer-events-none border-slate-700 bg-slate-800 text-slate-500"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        }`}
      >
        Next
      </Link>
    </div>
  )}

  <div className="mt-6 space-y-3">
    {users.length === 0 ? (
      <p className="mt-8 text-center text-sm text-slate-500">
        {query
          ? `No users found for "${query}".`
          : "No users found."}
      </p>
    ) : (
      users.map((user) => {
        const userId = user._id.toString();

        const displayName =
          user.firstName || user.lastName
            ? `${user.firstName ?? ""} ${
                user.lastName ?? ""
              }`.trim()
            : user.username || "Unknown User";

        const imageUrl = user.imageUrl;

        const userRole =
          user.role ??
          user.publicMetadata?.role ??
          "user";

        const balance = Number(
          user.balance ?? 0,
        );

        const pending = Number(
          user.pending ?? 0,
        );

        const totalEarned = Number(
          user.totalEarned ?? 0,
        );

        const tasksCompleted = Number(
          user.tasksCompleted ?? 0,
        );

        return (
          <div
            key={userId}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
          >
            <div className="mb-3">
              <div className="flex items-center gap-2">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                    {displayName
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <p className="text-sm font-medium text-slate-900">
                  {displayName}
                </p>
              </div>

              <p className="mt-1 break-all text-xs text-slate-500">
                MongoDB ID: {userId}
              </p>

              {user.clerkId && (
                <p className="mt-1 break-all text-xs text-slate-500">
                  Clerk ID: {user.clerkId}
                </p>
              )}

              {user.email && (
                <p className="mt-1 break-all text-xs text-slate-500">
                  {user.email}
                </p>
              )}

              {user.phone && (
                <p className="mt-1 text-xs text-slate-500">
                  {user.phone}
                </p>
              )}

              {user.createdAt && (
                <CreatedAtUserComp
                  createdAt={new Date(
                    user.createdAt,
                  ).getTime()}
                />
              )}

              <p className="mt-1 text-xs text-slate-500">
                Balance:{" "}
                <span className="font-medium text-slate-700">
                  {formatCurrency(balance)}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Pending:{" "}
                <span className="font-medium text-slate-700">
                  {formatCurrency(pending)}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Total Earned:{" "}
                <span className="font-medium text-slate-700">
                  {formatCurrency(
                    totalEarned,
                  )}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Tasks Completed:{" "}
                <span className="font-medium text-slate-700">
                  {tasksCompleted}
                </span>
              </p>

              {user.referralId && (
                <p className="mt-1 text-xs text-slate-500">
                  Referral ID:{" "}
                  <span className="font-mono font-medium">
                    {user.referralId}
                  </span>
                </p>
              )}
            </div>

            <div className="mb-3 border-y border-slate-200 py-2">
              <p className="text-xs text-slate-600">
                Role:{" "}
                <span className="rounded-lg bg-black px-2 py-0.5 text-xs font-medium capitalize text-white">
                  {String(userRole)}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/manage_users/${userId}`}
                className="inline-flex items-center justify-center rounded-md border border-indigo-600 bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                View Details
              </Link>

              {/* <DeleteUserBtn userId={userId} /> */}
            </div>
          </div>
        );
      })
    )}
  </div>

  {totalPages > 1 && (
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      <Link
        href={createPageUrl(
          Math.max(1, currentPage - 1),
        )}
        className={`rounded-md border px-3 py-1.5 text-sm ${
          currentPage === 1
            ? "pointer-events-none border-slate-700 bg-slate-800 text-slate-500"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        }`}
      >
        Prev
      </Link>

      {Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      ).map((page) => (
        <Link
          key={page}
          href={createPageUrl(page)}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            page === currentPage
              ? "border-white bg-red-700 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={createPageUrl(
          Math.min(
            totalPages,
            currentPage + 1,
          ),
        )}
        className={`rounded-md border px-3 py-1.5 text-sm ${
          currentPage === totalPages
            ? "pointer-events-none border-slate-700 bg-slate-800 text-slate-500"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        }`}
      >
        Next
      </Link>
    </div>
  )}
</div>


);
}
