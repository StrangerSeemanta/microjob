import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import Banner from "@/models/Banner";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    // -----------------------------------------
    // Authentication
    // -----------------------------------------

    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    // -----------------------------------------
    // Get form data
    // -----------------------------------------

    const formData = await request.formData();

    const file = formData.get("file");
    const title = formData.get("title");
    const linkUrl = formData.get("linkUrl");
    const active = formData.get("active");

    // -----------------------------------------
    // Validate file
    // -----------------------------------------

    if (!(file instanceof File)) {
      return Response.json(
        {
          success: false,
          message: "Banner image is required.",
        },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return Response.json(
        {
          success: false,
          message: "Only image files are allowed.",
        },
        { status: 400 },
      );
    }

    // 10 MB maximum
    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        {
          success: false,
          message: "Image must be smaller than 10MB.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // Validate title
    // -----------------------------------------

    if (typeof title !== "string" || !title.trim()) {
      return Response.json(
        {
          success: false,
          message: "Banner title is required.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // Upload to Vercel Blob
    // -----------------------------------------

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filename = `banners/${crypto.randomUUID()}.${extension}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // -----------------------------------------
    // Create MongoDB document
    // -----------------------------------------
    await connectDB();
    const banner = await Banner.create({
      title: title.trim(),

      imageUrl: blob.url,

      blobPathname: blob.pathname,

      linkUrl: typeof linkUrl === "string" ? linkUrl.trim() : "",

      active: active === "true",

      priority: 0,
    });

    // -----------------------------------------
    // Response
    // -----------------------------------------

    return Response.json(
      {
        success: true,
        message: "Banner uploaded successfully.",
        banner: {
          _id: banner._id.toString(),
          title: banner.title,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl,
          active: banner.active,
          createdAt: banner.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to upload banner:", error);

    return Response.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      { status: 500 },
    );
  }
}
