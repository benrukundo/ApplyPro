// app/api/examples/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeExamples = searchParams.get("includeExamples") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    const categories = await prisma.jobCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: includeExamples
        ? {
            examples: {
              take: limit,
              orderBy: { createdAt: "desc" },
            },
          }
        : {
            _count: {
              select: { examples: true },
            },
          },
    });

    // Transform to include example counts
    const transformedCategories = categories.map((category) => ({
      ...category,
      exampleCount: includeExamples
        ? (category as any).examples?.length || 0
        : (category as any)._count?.examples || 0,
    }));

    return NextResponse.json({
      success: true,
      data: transformedCategories,
      total: transformedCategories.reduce((acc, cat) => acc + cat.exampleCount, 0),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
