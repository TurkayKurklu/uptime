import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidUrl, normalizeUrl } from "@/lib/utils";
import { auth } from "@/auth";

// GET — List all sites for the logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sites = await prisma.site.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        logs: {
          orderBy: { checkedAt: "desc" },
          take: 20,
        },
      },
    });

    return NextResponse.json(sites);
  } catch (error: any) {
    console.error("CRITICAL SITES FETCH ERROR:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch sites: " + error.message },
      { status: 500 }
    );
  }
}

// POST — Create a new site
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, url } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(url);

    if (!isValidUrl(normalizedUrl)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const site = await prisma.site.create({
      data: {
        name,
        url: normalizedUrl,
        userId: session.user.id,
      },
      include: {
        logs: true,
      },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error("Failed to create site:", error);
    return NextResponse.json(
      { error: "Failed to create site" },
      { status: 500 }
    );
  }
}

// DELETE — Delete a site by ID
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Site ID is required" },
        { status: 400 }
      );
    }

    // Ensure the site belongs to the user
    const site = await prisma.site.findUnique({
      where: { id },
    });

    if (!site || site.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.site.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete site:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}
