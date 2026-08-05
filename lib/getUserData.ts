export async function getUser() {
  const res = await fetch("/api/user");

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}