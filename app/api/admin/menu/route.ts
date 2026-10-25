import { NextRequest, NextResponse } from "next/server";
import { ensureMenuSeeded, serializeMenuItem } from "@/lib/menu-catalog";
import { MenuItem } from "@/lib/models/menu-item";
import { getSession } from "@/lib/session";

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
    image.length > 1000 ||
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
    await ensureMenuSeeded();
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
    await ensureMenuSeeded();
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
    await ensureMenuSeeded();
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
    await ensureMenuSeeded();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "A menu item id is required." }, { status: 400 });
    const item = await MenuItem.findOneAndUpdate(
      { id },
      { $set: { available: false } },
      { new: true },
    );
    if (!item) return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
    return NextResponse.json({ item: serializeMenuItem(item) });
  } catch (error) {
    console.error("Could not disable menu item.", error);
    return NextResponse.json({ error: "Could not disable menu item." }, { status: 500 });
  }
}
