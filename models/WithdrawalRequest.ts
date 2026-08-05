import { Schema, model, models, InferSchemaType } from "mongoose";

const WithdrawalRequestSchema = new Schema(
  {
    _id:{
      type:Schema.Types.ObjectId,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    clerkId: {
      type: String,
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
    },

    accountNumber: {
      type: String,
      required: true,
    },

    accountName: {
      type: String,
      default: "",
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
WithdrawalRequestSchema.index({
  clerkId: 1,
  createdAt: -1,
});

WithdrawalRequestSchema.index({
  status: 1,
  createdAt: -1,
});

export type WithdrawalRequestSchemaType = InferSchemaType<
  typeof WithdrawalRequestSchema
>;

export default models.WithdrawalRequest ||
  model("WithdrawalRequest", WithdrawalRequestSchema);
