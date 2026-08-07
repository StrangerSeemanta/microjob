"use client";

export default function CreatedAtUserComp({
  createdAt,
}: {
  createdAt: number;
}) {
  const date = new Date(createdAt).toString();
  return (
    <>
      <p className="text-xs text-slate-500 mt-1">User Created At: {date}</p>
    </>
  );
}
