import { checkUserRole } from "@/utils/roles";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SearchUsers from "./SearchUsers";
import Image from "next/image";
import DeleteUserBtn from "./DeleteUserBtn";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { formatCurrency } from "@/utils/formatCurrency";

export default async function AdminManageUsersPage(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  const currentUser = await auth();
  if (!currentUser.userId) throw new Error("Failed to get user id");
  if (!checkUserRole(currentUser.userId, "admin")) {
    redirect("/unauthorized");
  }

  const query = (await params.searchParams).search;

  const client = await clerkClient();

  const users = query
    ? (await client.users.getUserList({ query: query })).data
    : (await client.users.getUserList()).data;

  await connectDB();

  // const getBalance = async (clerkId: string) => {
  //   const balance_obj = await User.findOne({ clerkId: clerkId })
  //     .select("balance")
  //     .lean();
  //   console.log(clerkId);
  //   const balance = balance_obj.balance;
  //   return balance ? formatCurrency(Number(balance)) : "";
  // };
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <SearchUsers />

      {users.length > 0 ? (
        <div className="space-y-3 mt-6">
          {users.map(async (user) => (
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
                </div>
                {/* <h1 className="text-xs text-slate-500 mt-1">
                  {await getBalance(user.id)}
                </h1> */}
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

              {/* Role buttons */}
              <DeleteUserBtn userId={user.id} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 text-sm mt-8">
          No users found.
        </p>
      )}
    </div>
  );
}
