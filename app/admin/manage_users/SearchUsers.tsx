"use client";

import { usePathname, useRouter } from "next/navigation";

export default function SearchUsers() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-full h-fit flex flex-col justify-center items-center my-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const queryTerm = formData.get("search") as string;
          router.push(pathname + "?search=" + queryTerm);
        }}
        className="w-full h-fit bg-white rounded-lg flex flex-wrap justify-center items-center gap-4"
      >
        <label htmlFor="search" className="text-lg  font-medium text-slate-700">
          Search for users
        </label>
        <input
          id="search"
          name="search"
          type="text"
          placeholder="Enter username, name, email or id..."
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className=" bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
        >
          Search
        </button>
      </form>
    </div>
  );
}
