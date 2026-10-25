import { NextResponse } from "next/server";
import { getMenuItems, serializeMenuItem } from "@/lib/menu-catalog";

export async function GET() {
  try {
    const items = await getMenuItems();
    return NextResponse.json({ items: items.map(serializeMenuItem) });
  } catch (error) {
    console.error("Could not load menu.", error);
    return NextResponse.json({ error: "Could not load the menu." }, { status: 500 });
  }
}
