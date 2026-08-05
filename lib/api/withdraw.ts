export interface CreateWithdrawRequest {
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  accountName?: string;
}

export async function requestWithdraw(data: CreateWithdrawRequest) {
  const res = await fetch("/api/withdraw", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function getMyWithdrawals() {
  const res = await fetch("/api/user/withdrawals", {
    cache: "no-store",
  });

  return await res.json();
}

export async function getAdminWithdrawals(page = 1, status = "", search = "") {
  const params = new URLSearchParams();

  params.set("page", page.toString());

  if (status) {
    params.set("status", status);
  }

  if (search) {
    params.set("search", search);
  }

  const res = await fetch(`/api/admin/withdrawals?${params}`);

  return await res.json();
}

export async function updateWithdrawal(
  id: string,
  action: "paid" | "rejected",
  data?: {
    transactionId?: string;
    rejectionReason?: string;
  },
) {
  const res = await fetch(`/api/admin/withdrawals/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      ...data,
    }),
  });

  return await res.json();
}
