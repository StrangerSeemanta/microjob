import { Schema, model, models, InferSchemaType } from "mongoose";

const BannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    // Vercel Blob pathname.
    // Needed when deleting the image later.
    blobPathname: {
      type: String,
      required: true,
    },

    linkUrl: {
      type: String,
      default: "",
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
export type BannerDataType = InferSchemaType<typeof BannerSchema>;
export default models.Banner || model("Banner", BannerSchema, "banners");
