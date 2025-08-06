import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const namesParam = searchParams.get("names");

    if (!namesParam) {
      return NextResponse.json({ error: "Missing 'names' query parameter" }, { status: 400 });
    }

    const names = namesParam.split(",").map((n) => n.trim());

    const moves = await prisma.move.findMany({
      where: {
        name: { in: names },
      },
    });

    return NextResponse.json(moves);
  } catch (error) {
    console.error("Error fetching moves:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
