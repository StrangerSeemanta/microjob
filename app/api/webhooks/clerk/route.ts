import { Webhook } from "svix";
import { headers } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { UserDataTypeClerk } from "@/types/UserDataTypeClerk";

const adminEmails = ["ronihalderaadi1@gmail.com", "quantamant@gmail.com"];

export async function POST(req: Request) {
  const body = await req.text();

  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id")!;
  const svix_timestamp = headerPayload.get("svix-timestamp")!;
  const svix_signature = headerPayload.get("svix-signature")!;

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as { type: string; data: UserDataTypeClerk };
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const user = evt.data;
    const userEmail = user.email_addresses[0]?.email_address;

    if (!userEmail)
      return new Response("User Email Not Found...", { status: 500 });

    const isAdmin = adminEmails.includes(userEmail);

    await connectDB();

    const referral_Id = String(user.id).split("_")[1];
    
    await User.create({
      clerkId: user.id,
      email: user.email_addresses[0]?.email_address,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      imageUrl: user.image_url,
      publicMetadata: {
        role: isAdmin ? "admin" : user.public_metadata?.role,
        balance: user.public_metadata?.balance,
        tasksCompleted: user.public_metadata?.tasksCompleted,
      },
      role: isAdmin ? "admin" : user.public_metadata?.role || "user",
      referralId: referral_Id,
    });
  }

  return new Response("OK");
}
