import { checkUserRole } from "@/utils/roles";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SearchUsers from "./SearchUsers";
import Image from "next/image";
import DeleteUserBtn from "./DeleteUserBtn";
import CreatedAtUserComp from "./CreatedAtUserComp";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function AdminManageUsersPage(params: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const currentUser = await auth();
  if (!currentUser.userId) throw new Error("Failed to get user id");
  if (!checkUserRole(currentUser.userId, "admin")) {
    redirect("/unauthorized");
  }

  const searchParams = await params.searchParams;
  const query = searchParams.search;
  const limit = 10;
  const rawPage = Number(searchParams.page ?? "1");
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const client = await clerkClient();
  const offset = (currentPage - 1) * limit;

  const result = query
    ? await client.users.getUserList({
        query,
        limit,
        offset,
        orderBy: "-created_at",
      })
    : await client.users.getUserList({
        limit,
        offset,
        orderBy: "-created_at",
      });

  const users = result.data ?? [];
  const totalCount = Number(
    result.totalCount ?? result.totalCount ?? users.length + offset,
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();

    if (query) {
      params.set("search", query);
    }

    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="text-blue underline flex justify-start items-center bg-white p-2">
        <Home /> Home
      </Link>
      <SearchUsers />

      {users.length > 0 ? (
        <>
          <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-300">
            <h1 className="font-semibold text-white">
              Total Users: {totalCount}
            </h1>
            <span>
              Showing {Math.min(offset + 1, totalCount)}-
              {Math.min(offset + users.length, totalCount)}
            </span>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <a
                href={createPageUrl(Math.max(1, currentPage - 1))}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  currentPage === 1
                    ? "pointer-events-none border-slate-700 bg-slate-800 text-slate-500"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Prev
              </a>

              {pageNumbers.map((page) => (
                <a
                  key={page}
                  href={createPageUrl(page)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    page === currentPage
                      ? "border-white bg-red-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </a>
              ))}

              <a
                href={createPageUrl(Math.min(totalPages, currentPage + 1))}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  currentPage === totalPages
                    ? "pointer-events-none border-slate-700 bg-slate-800 text-slate-500"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Next
              </a>
            </div>
          )}
          {/* List */}
          <div className="space-y-3 mt-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src={user.imageUrl}
                        alt="User Image"
                        width={32}
                        height={32}
                        className="rounded-full w-8 h-8 "
                      />
                      <p className="text-sm font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{user.id}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {user.publicMetadata.phone
                        ? String(user.publicMetadata.phone)
                        : ""}
                    </p>
                    <CreatedAtUserComp createdAt={user.createdAt} />
                  </div>
                </div>

                <div className="mb-3 py-2 border-t border-b border-slate-200">
                  <p className="text-xs text-slate-600">
                    Role:{" "}
                    <span className="font-medium bg-black text-white px-2 py-[0.25px] rounded-lg text-xs capitalize">
                      {user.publicMetadata.role
                        ? String(user.publicMetadata.role)
                        : "User"}
                    </span>
                  </p>
                </div>

                <DeleteUserBtn userId={user.id} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <a
                href={createPageUrl(Math.max(1, currentPage - 1))}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  currentPage === 1
                    ? "pointer-events-none border-slate-700 bg-slate-800 text-slate-500"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Prev
              </a>

              {pageNumbers.map((page) => (
                <a
                  key={page}
                  href={createPageUrl(page)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    page === currentPage
                      ? "border-white bg-red-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </a>
              ))}

              <a
                href={createPageUrl(Math.min(totalPages, currentPage + 1))}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  currentPage === totalPages
                    ? "pointer-events-none border-slate-700 bg-slate-800 text-slate-500"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Next
              </a>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-slate-500 text-sm mt-8">
          No users found.
        </p>
      )}
    </div>
  );
}
