import {
  Schema,
  model,
  models,
  InferSchemaType,
} from "mongoose";

const WithdrawalRequestSchema = new Schema(
  {
    // MongoDB User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    accountName: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
      index: true,
    },

    note: {
      type: String,
      default: "",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    transactionId: {
      type: String,
      default: "",
    },

    reviewedBy: {
      type: String,
      default: "",
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// User withdrawal history
WithdrawalRequestSchema.index({
  userId: 1,
  createdAt: -1,
});

// Admin withdrawal queue
WithdrawalRequestSchema.index({
  status: 1,
  createdAt: -1,
});

export type WithdrawalRequestSchemaType =
  InferSchemaType<typeof WithdrawalRequestSchema>;

export default models.WithdrawalRequest ||
  model(
    "WithdrawalRequest",
    WithdrawalRequestSchema,
  );