import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import Banner from "@/models/Banner";
import { connectDB } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    await connectDB();
    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Banner ID is required.",
        },
        { status: 400 },
      );
    }

    // Find banner first
    const banner = await Banner.findById(id);

    if (!banner) {
      return Response.json(
        {
          success: false,
          message: "Banner not found.",
        },
        { status: 404 },
      );
    }

    // -----------------------------------------
    // Delete image from Vercel Blob
    // -----------------------------------------

    if (banner.blobPathname) {
      await del(banner.blobPathname);
    }

    // -----------------------------------------
    // Delete MongoDB document
    // -----------------------------------------

    await Banner.findByIdAndDelete(id);

    return Response.json({
      success: true,
      message: "Banner deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete banner:", error);

    return Response.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      { status: 500 },
    );
  }
}
