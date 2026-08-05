import { fetchTasks } from "@/lib/fetchTasks";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const projects = await fetchTasks();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" + " " + String(error) },
      { status: 500 }
    );
  }
}


