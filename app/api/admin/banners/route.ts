import { auth } from "@clerk/nextjs/server";
import Banner from "@/models/Banner";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
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

    const banners = await Banner.find({})
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .lean();

    return Response.json({
      success: true,
      banners: banners.map((banner) => ({
        _id: banner._id.toString(),
        title: banner.title,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        active: banner.active,
        createdAt: banner.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch banners:", error);

    return Response.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      { status: 500 },
    );
  }
}
