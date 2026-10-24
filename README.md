# Friday Restaurant

Restaurant ordering website built with Next.js App Router, Redux Toolkit, and Mongoose.

## App structure

- Each customer-facing URL has its own `page.tsx` under `app/(store)/`; `app/(store)/layout.tsx` provides the shared navigation and footer.
- `app/layout.tsx` wraps the application in the React Redux provider.
- `lib/store/store.ts` owns cart, signed-in customer, and order state. The cart is persisted in the browser; accounts and orders come from the Mongoose API.
- `/admin` is a standalone admin dashboard, outside the storefront layout.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI` to your MongoDB Atlas connection string (or local MongoDB URL).
3. Set `MONGODB_DB` if you want a database name other than `friday_restaurant`.
4. Set `SESSION_SECRET` to a unique random value with at least 32 characters. For example:

   ```bash
   openssl rand -base64 48
   ```

5. Set a strong `ADMIN_EMAIL` and `ADMIN_PASSWORD`. These are the credentials for `/admin`.
6. In MongoDB Atlas, allow network access from the host where this app runs and create a database user with read/write access to the selected database.
7. Start the app:

   ```bash
   npm install
   npm run dev
   ```

Keep `.env.local` private. Do not commit credentials or use `NEXT_PUBLIC_` prefixes for these variables. The Mongoose models create the `users` and `orders` collections and their indexes when first used.

## Backend API

All APIs are implemented as Next.js Route Handlers under `app/api`:

- `GET /api/auth` — current signed-in user (or `null`).
- `POST /api/auth` — register or log in with `{ "action": "register" | "login", "name?", "email", "password" }`.
- `POST /api/auth` — admin login with `{ "action": "admin-login", "email", "password" }`.
- `PATCH /api/auth` — update signed-in customer profile.
- `DELETE /api/auth` — sign out.
- `POST /api/orders` — create an order. Guests may order too; signed-in customer orders are linked to their MongoDB user record.
- `GET /api/orders` — list the signed-in customer's orders.
- `GET /api/orders?orderNumber=FR-...` — public order status lookup (does not disclose delivery address or customer contact details).
- `GET /api/admin/orders` — admin-only order list. Supports `status` and `search` query parameters.
- `PATCH /api/admin/orders` — admin-only order status update with `{ "id": "...", "status": "confirmed" | "preparing" | "on-the-way" | "delivered" | "cancelled" }`.

The admin dashboard is at `/admin`. It polls for new orders every 15 seconds and can search, filter, inspect, and update orders.

Passwords are hashed server-side and login sessions use signed, `HttpOnly` cookies. Use HTTPS in production. Order prices and totals are recalculated from the server menu catalog; the browser's submitted prices are not trusted.

## Current boundaries

- Checkout records the selected payment method but does not charge cards or initiate mobile-money payments.
- Password reset email delivery is not configured.
- Contact form messages are kept in the submitting browser; configure a mail or database service before using it as a customer support inbox.
- Menu content is currently defined in `lib/menu-data.ts`; MongoDB stores users and orders.
