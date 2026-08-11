import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

import User from "@/models/User";
import WithdrawalRequest from "@/models/WithdrawalRequest";

const VALID_STATUSES = [
  "pending",
  "paid",
  "rejected",
] as const;

type WithdrawalStatus =
  (typeof VALID_STATUSES)[number];

function escapeRegex(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

export async function GET(req: NextRequest) {
  try {
    // =====================================================
    // 1. Authenticate
    //
    // Supports:
    // - Supabase
    // - Clerk
    // =====================================================

    const {
      authenticated,
      user,
    } = await getAuthenticatedUser();

    if (!authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // =====================================================
    // 2. MongoDB user must exist
    // =====================================================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================================
    // 3. Admin authorization
    //
    // IMPORTANT:
    //
    // Admin authorization is based on the MongoDB User
    // document, not on Clerk.
    // =====================================================

    const role =
      typeof user.publicMetadata?.role === "string"
        ? user.publicMetadata.role
        : user.role;

    if (role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    // =====================================================
    // 4. Query parameters
    // =====================================================

    const searchParams =
      req.nextUrl.searchParams;

    const rawPage =
      Number(searchParams.get("page"));

    const rawLimit =
      Number(searchParams.get("limit"));

    const page =
      Number.isFinite(rawPage) &&
      rawPage > 0
        ? Math.floor(rawPage)
        : 1;

    const limit =
      Number.isFinite(rawLimit) &&
      rawLimit > 0
        ? Math.min(
            Math.floor(rawLimit),
            100,
          )
        : 20;

    const status =
      searchParams
        .get("status")
        ?.trim()
        .toLowerCase() || "";

    const search =
      searchParams
        .get("search")
        ?.trim() || "";

    // =====================================================
    // 5. Build withdrawal query
    //
    // IMPORTANT:
    //
    // WithdrawalRequest.userId
    //          ↓
    //       User._id
    //
    // There is NO clerkId relationship here.
    // =====================================================

    const query: Record<
      string,
      unknown
    > = {};

    // =====================================================
    // 6. Status filter
    // =====================================================

    if (status) {
      if (
        !VALID_STATUSES.includes(
          status as WithdrawalStatus,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid withdrawal status.",
          },
          {
            status: 400,
          },
        );
      }

      query.status = status;
    }

    // =====================================================
    // 7. Search users
    //
    // Search is performed against the User collection.
    // Then the resulting MongoDB _ids are used against
    // WithdrawalRequest.userId.
    // =====================================================

    if (search) {
      const safeSearch =
        escapeRegex(search);

      const users = await User.find({
        $or: [
          {
            username: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            email: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            firstName: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            lastName: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: safeSearch,
              $options: "i",
            },
          },
        ],
      })
        .select("_id")
        .lean();

      // No users matched the search.
      if (users.length === 0) {
        return NextResponse.json({
          success: true,
          total: 0,
          page,
          totalPages: 0,
          withdrawals: [],
        });
      }

      const userIds =
        users.map(
          (item) => item._id,
        );

      query.userId = {
        $in: userIds,
      };
    }

    // =====================================================
    // 8. Count matching withdrawals
    // =====================================================

    const total =
      await WithdrawalRequest.countDocuments(
        query,
      );

    // =====================================================
    // 9. Fetch withdrawals
    // =====================================================

    const withdrawals =
      await WithdrawalRequest.find(query)
        .populate({
          path: "userId",
          select:
            "_id username email firstName lastName imageUrl phone role",
        })
        .sort({
          createdAt: -1,
        })
        .skip(
          (page - 1) * limit,
        )
        .limit(limit)
        .lean();

    // =====================================================
    // 10. Serialize MongoDB documents
    //
    // NEVER expose ObjectId directly to the frontend.
    // =====================================================

    const safeWithdrawals =
      withdrawals.map(
        (withdrawal) => {
          const populatedUser =
            withdrawal.userId as unknown as
              | {
                  _id: unknown;
                  username?: string;
                  email?: string;
                  firstName?: string;
                  lastName?: string;
                  imageUrl?: string;
                  phone?: string;
                  role?: string;
                }
              | null;

          const withdrawalUserId =
            populatedUser?._id
              ? populatedUser._id.toString()
              : withdrawal.userId
                ? withdrawal.userId.toString()
                : null;

          return {
            // Withdrawal MongoDB ID
            id: withdrawal._id.toString(),

            // MongoDB User._id as string
            userId: withdrawalUserId,

            user: populatedUser
              ? {
                  id:
                    populatedUser._id
                      ? populatedUser._id.toString()
                      : null,

                  username:
                    populatedUser.username,

                  email:
                    populatedUser.email,

                  firstName:
                    populatedUser.firstName,

                  lastName:
                    populatedUser.lastName,

                  imageUrl:
                    populatedUser.imageUrl,

                  phone:
                    populatedUser.phone,

                  role:
                    populatedUser.role,
                }
              : null,

            amount:
              withdrawal.amount,

            paymentMethod:
              withdrawal.paymentMethod,

            accountNumber:
              withdrawal.accountNumber,

            accountName:
              withdrawal.accountName,

            status:
              withdrawal.status,

            note:
              withdrawal.note,

            rejectionReason:
              withdrawal.rejectionReason,

            transactionId:
              withdrawal.transactionId,

            reviewedBy:
              withdrawal.reviewedBy,

            reviewedAt:
              withdrawal.reviewedAt,

            createdAt:
              withdrawal.createdAt,

            updatedAt:
              withdrawal.updatedAt,
          };
        },
      );

    // =====================================================
    // 11. Response
    // =====================================================

    return NextResponse.json({
      success: true,

      total,

      page,

      totalPages:
        Math.ceil(
          total / limit,
        ),

      withdrawals:
        safeWithdrawals,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/withdrawals error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error.",
      },
      {
        status: 500,
      },
    );
  }
}
