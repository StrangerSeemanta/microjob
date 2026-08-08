// models/User.ts

import { Double } from "mongodb";
import { Schema, model, models, InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },

    username: String,
    firstName: String,
    lastName: String,
    imageUrl: String,

    //clerk public metadata
    publicMetadata: {
      role: {
        type: String,
        default: "user",
      },
      balance: {
        type: Double,
      },
      tasksCompleted: {
        type: Number,
      },
    },
    // Your custom fields
    balance: {
      type: Double,
      default: 0.0,
    },

    pending: {
      type: Double,
      default: 0.0,
    },
    totalEarned: {
      type: Double,
      default: 0.0,
    },
    paymentPending: {
      type: Number,
      default: 0,
    },
    paymentReceived: {
      type: Number,
      default: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: "user",
    },
    cooldowns: {
      type: Map,
      of: Date,
      default: new Map(),
    },

    //referrals
    referralId: {
      type: String,
      unique: true,
      require: true,
    },

    referredBy: {
      type: String,
      default: null,
    },

    referralCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);
export type UserDataMongooseType = InferSchemaType<typeof UserSchema>;

export default models.User || model("User", UserSchema, "data");
