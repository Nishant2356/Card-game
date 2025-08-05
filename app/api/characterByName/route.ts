import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const names = searchParams.get("names");

    if (!names) {
      return NextResponse.json(
        { error: "No names provided" },
        { status: 400 }
      );
    }

    const namesArray = names.split(",").map((n) => n.trim());

    const characters = await prisma.character.findMany({
      where: {
        name: { in: namesArray },
      },
    });

    if (characters.length === 0) {
      return NextResponse.json(
        { error: "No characters found" },
        { status: 404 }
      );
    }

    return NextResponse.json(characters);
  } catch (err) {
    console.error("Error fetching characters:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
