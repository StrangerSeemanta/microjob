import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

import User from "@/models/User";
import WithdrawalRequest from "@/models/WithdrawalRequest";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await mongoose.startSession();

  try {
    await connectDB();

    // =====================================================
    // 1. Authenticate
    //
    // Supports:
    // - Supabase
    // - Clerk
    // =====================================================

    const {
      authenticated,
      user: admin,
    } = await getAuthenticatedUser();

    if (!authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // =====================================================
    // 2. MongoDB admin must exist
    // =====================================================

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin account not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================================
    // 3. Admin authorization
    // =====================================================

    if (admin.role !== "admin") {
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
    // 4. Get withdrawal ID
    // =====================================================

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal ID.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 5. Read action
    // =====================================================

    const body = await req.json();

    const {
      action,
      rejectionReason,
      transactionId,
    } = body;

    if (
      action !== "paid" &&
      action !== "rejected"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 6. Start transaction
    // =====================================================

    session.startTransaction();

    // =====================================================
    // 7. Find withdrawal
    // =====================================================

    const withdrawal =
      await WithdrawalRequest.findById(id)
        .session(session);

    if (!withdrawal) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================================
    // 8. Prevent double processing
    // =====================================================

    if (withdrawal.status !== "pending") {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message:
            "This withdrawal has already been processed.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 9. Validate userId relation
    //
    // WithdrawalRequest.userId is the MongoDB User._id.
    // No clerkId lookup is performed.
    // =====================================================

    if (!withdrawal.userId) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message:
            "Withdrawal is missing its user relation.",
        },
        {
          status: 500,
        },
      );
    }

    // =====================================================
    // 10. Find withdrawal owner
    // =====================================================

    const user = await User.findById(
      withdrawal.userId,
    ).session(session);

    if (!user) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message:
            "Withdrawal owner was not found.",
        },
        {
          status: 404,
        },
      );
    }

    const withdrawalAmount = Number(
      withdrawal.amount,
    );

    // =====================================================
    // 11. Store MongoDB admin ID
    //
    // reviewedBy is currently a String in the schema,
    // therefore convert MongoDB _id to string.
    //
    // IMPORTANT:
    // This is NOT Clerk ID and NOT Supabase ID.
    // =====================================================

    const reviewedBy = admin._id.toString();

    // =====================================================
    // 12. PAID
    // =====================================================

    if (action === "paid") {
      withdrawal.status = "paid";

      withdrawal.transactionId =
        typeof transactionId === "string"
          ? transactionId.trim()
          : "";

      withdrawal.reviewedBy = reviewedBy;
      withdrawal.reviewedAt = new Date();

      // Money was already removed from balance
      // when the withdrawal was created.
      //
      // Here we only remove it from pending.

      user.pending =
        Math.max(
          0,
          Number(user.pending || 0) -
            withdrawalAmount,
        );

      user.totalEarned =
        Number(user.totalEarned || 0) +
        withdrawalAmount;
    }

    // =====================================================
    // 13. REJECTED
    // =====================================================

    else if (action === "rejected") {
      withdrawal.status = "rejected";

      withdrawal.rejectionReason =
        typeof rejectionReason === "string"
          ? rejectionReason.trim()
          : "";

      withdrawal.reviewedBy = reviewedBy;
      withdrawal.reviewedAt = new Date();

      // Return the withdrawn amount
      // back to the user's available balance.

      user.balance =
        Number(user.balance || 0) +
        withdrawalAmount;

      user.pending =
        Math.max(
          0,
          Number(user.pending || 0) -
            withdrawalAmount,
        );
    }

    // =====================================================
    // 14. Save both documents atomically
    // =====================================================

    await withdrawal.save({
      session,
    });

    await user.save({
      session,
    });

    // =====================================================
    // 15. Commit
    // =====================================================

    await session.commitTransaction();

    // =====================================================
    // 16. Safe frontend response
    // =====================================================

    return NextResponse.json({
      success: true,

      message:
        action === "paid"
          ? "Withdrawal marked as paid."
          : "Withdrawal rejected.",

      withdrawal: {
        id: withdrawal._id.toString(),

        userId:
          withdrawal.userId.toString(),

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

        transactionId:
          withdrawal.transactionId,

        rejectionReason:
          withdrawal.rejectionReason,

        reviewedBy:
          withdrawal.reviewedBy,

        reviewedAt:
          withdrawal.reviewedAt,

        createdAt:
          withdrawal.createdAt,

        updatedAt:
          withdrawal.updatedAt,
      },

      user: {
        id: user._id.toString(),

        balance:
          user.balance,

        pending:
          user.pending,

        totalEarned:
          user.totalEarned,
      },
    });
  } catch (error) {
    // =====================================================
    // Rollback transaction if anything failed
    // =====================================================

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "PATCH /api/admin/withdrawals/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      {
        status: 500,
      },
    );
  } finally {
    await session.endSession();
  }
}

