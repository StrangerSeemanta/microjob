//lib/api/tasks.ts
export async function getTaskCooldown(taskId: string) {
  const response = await fetch("/api/tasks/get_cooldown", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taskId,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch cooldown.");
  }

  return data;
}
