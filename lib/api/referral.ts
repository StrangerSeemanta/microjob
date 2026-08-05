export async function submitReferral(referralId: string) {
  const response = await fetch("/api/referral", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      referralId,
    }),
  });

  return response.json() as unknown as { success: boolean; message: string };
}
