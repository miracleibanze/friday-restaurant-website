import { NextRequest, NextResponse } from "next/server";
import {
  ensureMenuDatabaseConnected,
  serializeMenuItem,
} from "@/lib/menu-catalog";
import { MenuItem } from "@/lib/models/menu-item";
import { getSession } from "@/lib/session";

const maxMenuImageBytes = 5 * 1024 * 1024;
const maxMenuImageDataUrlLength = 7_000_000;
const menuImageDataUrlPattern =
  /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/;

async function requireAdmin(request: NextRequest) {
  const session = await getSession(request);
  return session?.role === "admin";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function validImageDataUrl(image: string) {
  if (!image.startsWith("data:")) return image.length <= 1000;
  if (image.length > maxMenuImageDataUrlLength) return false;

  const match = menuImageDataUrlPattern.exec(image);
  if (!match) return false;
  const [, contentType, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  if (
    buffer.length === 0 ||
    buffer.length > maxMenuImageBytes ||
    buffer.toString("base64") !== base64
  ) {
    return false;
  }

  switch (contentType) {
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/png":
      return buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    case "image/webp":
      return (
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );
    case "image/gif":
      return ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6));
    default:
      return false;
  }
}

function validateFields(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const price = Number(body.price);
  const prepTime = Number(body.prepTime);
  if (
    !name ||
    name.length > 120 ||
    !description ||
    description.length > 1000 ||
    !image ||
    !validImageDataUrl(image) ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(prepTime) ||
    prepTime < 1 ||
    prepTime > 240
  ) {
    return null;
  }
  const slug = slugify(typeof body.slug === "string" ? body.slug : name);
  if (!slug) return null;
  return { name, description, image, price, prepTime, slug };
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    await ensureMenuDatabaseConnected();
    const items = await MenuItem.find().sort({ createdAt: 1 });
    return NextResponse.json({ items: items.map(serializeMenuItem) });
  } catch (error) {
    console.error("Could not load administrator menu.", error);
    return NextResponse.json({ error: "Could not load menu items." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    await ensureMenuDatabaseConnected();
    const body = await request.json();
    const fields = validateFields(body);
    if (!fields) {
      return NextResponse.json({ error: "Enter valid menu item details." }, { status: 400 });
    }
    const item = await MenuItem.create({
      ...fields,
      id: fields.slug,
      available: body.available !== false,
    });
    return NextResponse.json({ item: serializeMenuItem(item) }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "A menu item with this name or slug already exists." }, { status: 409 });
    }
    console.error("Could not create menu item.", error);
    return NextResponse.json({ error: "Could not create menu item." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    await ensureMenuDatabaseConnected();
    const body = await request.json();
    if (typeof body.id !== "string" || !body.id) {
      return NextResponse.json({ error: "A menu item id is required." }, { status: 400 });
    }
    const fields = validateFields(body);
    if (!fields || typeof body.available !== "boolean") {
      return NextResponse.json({ error: "Enter valid menu item details." }, { status: 400 });
    }
    const item = await MenuItem.findOneAndUpdate(
      { id: body.id },
      { ...fields, available: body.available },
      { new: true, runValidators: true },
    );
    if (!item) return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
    return NextResponse.json({ item: serializeMenuItem(item) });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "A menu item with this name or slug already exists." }, { status: 409 });
    }
    console.error("Could not update menu item.", error);
    return NextResponse.json({ error: "Could not update menu item." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    await ensureMenuDatabaseConnected();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "A menu item id is required." }, { status: 400 });
    const result = await MenuItem.deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not delete menu item.", error);
    return NextResponse.json({ error: "Could not delete menu item." }, { status: 500 });
  }
}
