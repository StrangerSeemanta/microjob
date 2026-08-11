export interface CreateWithdrawRequest {
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  accountName?: string;
}

export type WithdrawalStatus =
  | "pending"
  | "paid"
  | "rejected";

export interface Withdrawal {
  id: string;
  userId: string;

  amount: number;

  paymentMethod: string;
  accountNumber: string;
  accountName?: string;

  status: WithdrawalStatus;

  note?: string;
  rejectionReason?: string;
  transactionId?: string;

  reviewedBy?: string;
  reviewedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalUser {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  phone?: string;
  role?: string;
}

export interface AdminWithdrawal
  extends Withdrawal {
  user: WithdrawalUser | null;
}

export interface WithdrawalResponse {
  success: boolean;
  message: string;
  withdrawal?: Withdrawal;
}

export interface MyWithdrawalsResponse {
  success: boolean;
  message?: string;
  withdrawals: Withdrawal[];
}

export interface AdminWithdrawalsResponse {
  success: boolean;
  message?: string;

  total: number;
  page: number;
  totalPages: number;

  withdrawals: AdminWithdrawal[];
}

// ----------------------------------------
// User
// Request withdrawal
// ----------------------------------------

export async function requestWithdraw(
  data: CreateWithdrawRequest,
): Promise<WithdrawalResponse> {
  const res = await fetch("/api/withdraw", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify(data),
  });

  return (await res.json()) as WithdrawalResponse;
}

// ----------------------------------------
// User
// Get own withdrawal history
// ----------------------------------------

export async function getMyWithdrawals(): Promise<MyWithdrawalsResponse> {
  const res = await fetch(
    "/api/user/withdrawals",
    {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    },
  );

  return (await res.json()) as MyWithdrawalsResponse;
}

// ----------------------------------------
// Admin
// Get withdrawal requests
// ----------------------------------------

export async function getAdminWithdrawals(
  page = 1,
  status = "",
  search = "",
): Promise<AdminWithdrawalsResponse> {
  const params = new URLSearchParams();

  params.set("page", page.toString());

  if (status) {
    params.set("status", status);
  }

  if (search) {
    params.set("search", search);
  }

  const res = await fetch(
    `/api/admin/withdrawals?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    },
  );

  return (await res.json()) as AdminWithdrawalsResponse;
}

// ----------------------------------------
// Admin
// Update withdrawal
// ----------------------------------------

export async function updateWithdrawal(
  id: string,
  action: "paid" | "rejected",
  data?: {
    transactionId?: string;
    rejectionReason?: string;
  },
): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(
    `/api/admin/withdrawals/${encodeURIComponent(id)}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        action,
        ...data,
      }),
    },
  );

  return (await res.json()) as {
    success: boolean;
    message: string;
  };
}

