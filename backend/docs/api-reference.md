# ShoeMarkNet Backend API

This document describes the primary HTTP endpoints exposed by the ShoeMarkNet backend. All routes are scoped beneath the `/api` prefix. Unless noted otherwise, request and response bodies are JSON encoded.

## Authentication

Most protected routes require a Bearer access token generated via the authentication endpoints. When a route is marked **Private**, attach the token in the `Authorization` header: `Authorization: Bearer <jwt>`.

## Status Codes

- `200 OK` Successful read/update/delete.
- `201 Created` New resource persisted.
- `204 No Content` Success without response body.
- `400 Bad Request` Validation or business-rule failure.
- `401 Unauthorized` Missing/invalid credentials.
- `403 Forbidden` Authenticated but lacking privileges.
- `404 Not Found` Resource does not exist.

## Authentication & User Identity

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Create a new shopper account. | Public |
| POST | `/api/auth/login` | Authenticate and receive JWT + refresh token. | Public |
| POST | `/api/auth/forgot-password` | Send password reset instructions. | Public |
| POST | `/api/auth/reset-password/:token` | Reset password using emailed token. | Public |
| GET | `/api/auth/verify-email/:token` | Verify email address. Redirects when `FRONTEND_URL` is set. | Public |
| POST | `/api/auth/refresh-token` | Exchange refresh token for a new access token. | Public |
| POST | `/api/auth/logout` | Revoke refresh token cookie. | Private |
| GET | `/api/auth/profile` | Fetch current user profile (password omitted). | Private |
| PUT | `/api/auth/profile` | Update name/phone/preferences. | Private |

### Sample: Register Shopper

```json
POST /api/auth/register
{
  "name": "Sneaker Lover",
  "email": "lover@example.com",
  "password": "Sup3rSecure!",
  "source": "instagram"
}
```

## Products

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/products` | Create product (slug/SKU auto-generated). | Admin |
| GET | `/api/products` | List products with filters (`category`, `brand`, `search`, `minPrice`, `maxPrice`, `gender`, `isFeatured`, `isNewArrival`, `inStock`, `page`, `limit`, `sort`). | Public |
| GET | `/api/products/featured` | Highlighted items. Optional `limit` query. | Public |
| GET | `/api/products/new-arrivals` | Recently added items. Optional `limit`. | Public |
| GET | `/api/products/:id` | Fetch by Mongo ID. Populates category and review virtuals. | Public |
| GET | `/api/products/slug/:slug` | Fetch by slug. | Public |
| PUT | `/api/products/:id` | Update product details/variants. | Admin |
| DELETE | `/api/products/:id` | Delete product (+ associated reviews). | Admin |
| POST | `/api/products/check-availability` | Validate stock for base or variant SKU. | Public |
| POST | `/api/products/batch-update-prices` | Bulk update price/discount fields. | Admin |
| POST | `/api/products/batch-update-stock` | Bulk update inventory counts. | Admin |
| POST | `/api/products/bulk-update` | Apply shared updates across multiple IDs. | Admin |

### Product Payload Notes

- `variants[]` supports nested `sizes[]` with per-size stock and price overrides (`size` is stored as a string, e.g. `"US 9"`).
- `images[]` must contain at least one entry while `isActive` is true.
- Stock changes for variant sizes automatically sync the parent `countInStock` via model hooks.

## Categories

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/categories` | Create category (slug/path computed). | Admin |
| GET | `/api/categories` | List categories (query params: `activeOnly`, `parent`, `level`). | Public |
| GET | `/api/categories/tree` | Fetch nested category tree. Optional `activeOnly`, `maxLevel`. | Public |
| GET | `/api/categories/:id` | Retrieve category details. | Public |
| PUT | `/api/categories/:id` | Update metadata, hierarchy recalculated automatically. | Admin |
| DELETE | `/api/categories/:id` | Remove category after safety checks. | Admin |
| POST | `/api/categories/:id/update-count` | Recalculate cached product count. | Admin |

## Promotions

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/promotions` | List currently active public campaigns sorted by priority. Response includes `promotions[]` with banner imagery, CTA URL, discount metadata, and a `meta.count`. | Public |

Active promotions only include campaigns marked public, active, and within the scheduled window. Clients can safely cache responses briefly; payloads include `startDate`/`endDate` to aid UI scheduling.

## Cart

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/cart` | Retrieve active cart for authenticated user. | Private |
| POST | `/api/cart` | Add/update product entry. Body: `productId`, `quantity`, `variant` `{color?, size?, sku?}`. | Private |
| PUT | `/api/cart/:itemId` | Update quantity (>=1). | Private |
| DELETE | `/api/cart/:itemId` | Remove specific line item. | Private |
| DELETE | `/api/cart` | Clear entire cart. | Private |

**Behavior:**
- Carts enforce one document per user (guests use `sessionId`).
- Variant-aware stock validation prevents overselling and keeps order pricing in sync.

## Wishlist

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/wishlist` | Paginated wishlist with populated product details. Supports `page`, `limit`, `sort` (`-createdAt` by default). | Private |
| POST | `/api/wishlist` | Add product. Rejects duplicates and caps at 50 items. | Private |
| DELETE | `/api/wishlist/:productId` | Remove product. | Private |
| DELETE | `/api/wishlist` | Clear wishlist. | Private |
| GET | `/api/wishlist/contains/:productId` | Boolean presence check. | Private |

Wishlist entries now capture `addedAt` timestamps; duplicate enforcement is handled via unique indexes.

## Orders

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/orders` | Create order from cart or ad-hoc items. Body must include `items[]`, `paymentMethod`, and `shippingAddress`. Optional `fromCart`, `tax`, `shippingFee`, `discount`. | Private |
| POST | `/api/orders/validate-coupon` | Validate a coupon code against the authenticated user's cart context and returns discount details. | Private |
| GET | `/api/orders` | List current user orders with product snapshots. | Private |
| GET | `/api/orders/:orderId` | Retrieve order (owner or admin only). | Private |
| PUT | `/api/orders/:orderId/pay` | Mark order as paid and attach gateway payload. | Private (owner) |
| PUT | `/api/orders/:orderId/cancel` | Cancel order (before delivery) and restore stock. | Private (owner) |
| GET | `/api/orders/admin` | Paginated order list. Filters: `status`, `page`, `limit`. | Admin |
| GET | `/api/orders/admin/stats` | Revenue & status KPIs. Filters: `startDate`, `endDate`, `status`. | Admin |
| PUT | `/api/orders/admin/:orderId/status` | Update fulfillment/payment metadata. | Admin |
| DELETE | `/api/orders/admin/:orderId` | Permanently delete an order. | Admin |

### Order Item Structure

```json
{
  "product": "64fd2d...",
  "quantity": 2,
  "price": 159.99,
  "color": "Volt Green",
  "size": "US 9"
}
```

Variant-level inventory deductions and refunds are reconciled automatically via model hooks when orders are created or cancelled.

## Reviews

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/reviews/admin` | Filterable, paginated review list. | Admin |
| PUT | `/api/reviews/admin/:reviewId` | Moderate review (status + admin note). | Admin |
| GET | `/api/reviews/admin/stats` | Aggregate review metrics. | Admin |

> **Note:** Model-level hooks keep `Product.rating` and `numReviews` synchronized whenever reviews are created, updated, or deleted.

## Search & Discovery

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/search` | Full-text product search with filters (see controller for parameters). | Public |
| GET | `/api/search/history` | Retrieve user search history. | Private |
| DELETE | `/api/search/history/:id` | Remove individual search entry. | Private |

## Contacts & Support

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/contact` | Submit a customer inquiry. | Public |
| GET | `/api/contact` | Get authenticated user's submitted tickets. | Private |
| GET | `/api/contact/:id` | Retrieve specific ticket (owner or admin). | Private |
| Admin | `/api/contact/admin` prefixed routes allow support team members to assign, respond, and archive tickets. | Admin |

## Admin Dashboard

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/admin/dashboard` | High-level KPIs (revenue, order volume, low-stock items, top products, recent orders). | Admin |
| GET | `/api/admin/users` | Paginated user list with filtering options. | Admin |
| PUT | `/api/admin/users/:id/status` | Activate or suspend a user account. | Admin |
| GET | `/api/admin/reports/sales` | Generate sales report. Query: `startDate`, `endDate`, `category`. | Admin |
| GET | `/api/admin/reports/inventory` | Inventory valuation with category grouping and low/out-of-stock insights. | Admin |
| GET | `/api/admin/analytics/customers` | Customer analytics including acquisition channels and high-value buyers. | Admin |
| GET | `/api/admin/analytics/categories/:categoryId` | Category-level performance analytics with optional `timeframe`, `startDate`, `endDate`. Cached for 5 minutes per category/timeframe. | Admin |
| GET | `/api/admin/leads` | Lead scoring data for marketing follow-up. | Admin |
| GET | `/api/admin/settings` | Retrieve global configuration settings. | Admin |
| PUT | `/api/admin/settings` | Update global configuration values. | Admin |
| GET | `/api/admin/campaigns` | List campaigns for back-office management. | Admin |
| POST | `/api/admin/campaigns` | Create a campaign. | Admin |
| PUT | `/api/admin/campaigns/:id` | Update a campaign. | Admin |
| DELETE | `/api/admin/campaigns/:id` | Remove a campaign. | Admin |

### Notifications

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/admin/notifications` | Paginated notifications feed with filters `status` (`read\|unread`), `category`, `priority`, `page`, `limit`. | Admin |
| POST | `/api/admin/notifications` | Create a notification payload. Body requires `title` and `message`; optional `category`, `priority`, `actions[]`, `metadata`. | Admin |
| PATCH | `/api/admin/notifications/:id/read` | Mark a single notification as read. | Admin |
| PATCH | `/api/admin/notifications/read-all` | Bulk mark notifications as read. Body may include `category` and/or `priority` to scope the update. | Admin |

Unread notifications automatically broadcast over the realtime channel (see below) after creation.

### Realtime Monitoring

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/admin/realtime` | Server-Sent Events stream emitting realtime stats updates. When connected, the client immediately receives a snapshot followed by periodic updates. | Admin |
| GET | `/api/admin/realtime/snapshot` | Pollable JSON snapshot of the same realtime stats for UIs that cannot use SSE. | Admin |

SSE responses disable compression and keep the connection alive; ensure clients handle heartbeat-less streams. Update frequency defaults to the `REALTIME_METRICS_INTERVAL` environment variable (ms).

(See `backend/routes/adminRoutes.js` for the complete set.)

## Payload & Model Reference

- **User**: email & phone validation now enforced; passwords require a minimum of 8 characters.
- **Product**: requires at least one image when active; maintains unique slug and SKU automatically.
- **Cart**: session-based carts auto-expire after 30 days and enforce variant-aware stock control.
- **Wishlist**: tracks `addedAt` per product, ensuring reliable chronological sorting.
- **Order**: recalculates monetary totals every save; includes `itemCount` virtual for quick UI display.
- **Review**: one review per user/product pair; moderation updates product aggregates automagically.

## Error Format

Errors are returned in the form:

```json
{
  "message": "Human-readable description",
  "errors": {
    "field": "Additional validation hints"
  }
}
```

Depending on environment, server-side exceptions may omit the `errors` object.

---

For schema diagrams, business rules, or SDK usage, see additional docs under `backend/docs/`.
