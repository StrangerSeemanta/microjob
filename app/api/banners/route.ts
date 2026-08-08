import Banner from "@/models/Banner";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find({
      active: true,
    })
      .select("_id title imageUrl linkUrl")
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
