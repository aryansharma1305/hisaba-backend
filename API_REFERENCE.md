# HiSaba Backend API Reference

Base URL (prod): `https://hisaba-backend.fly.dev`
API prefix: `/api`

## Quick Postman Setup

Create an environment with:
- `base_url = https://hisaba-backend.fly.dev/api`
- `token = <paste JWT after login>`

For protected endpoints, send header:
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

## Response Shape

Success (normal):
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Success (paginated list):
```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  }
}
```

Error:
```json
{
  "success": false,
  "message": "..."
}
```

Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [{ "field": "...", "message": "..." }]
}
```

## Public Routes

### `GET /`
Health-style root status page.

### `GET /health`
Returns backend health.

## Auth Routes

### `POST /api/auth/register`
Create account.

Body:
```json
{
  "name": "Aryan Sharma",
  "email": "aryan@example.com",
  "phone": "+919999999999",
  "password": "secret123"
}
```

### `POST /api/auth/login`
Login and receive JWT.

Body:
```json
{
  "email": "aryan@example.com",
  "password": "secret123"
}
```

### `GET /api/auth/me` (Protected)
Get current user from JWT.

## Transaction Routes (Protected)

### `GET /api/transactions`
Query params (optional):
- `page` (default `1`)
- `limit` (default `20`, max `100`)
- `category`
- `type` (`debit` | `credit`)
- `from` (ISO datetime)
- `to` (ISO datetime)

Example:
`GET {{base_url}}/transactions?page=1&limit=20&type=debit`

### `GET /api/transactions/:id`
Get one transaction.

### `POST /api/transactions`
Create one transaction.

Body:
```json
{
  "merchantName": "Swiggy",
  "amount": 842,
  "type": "debit",
  "category": "Food & Dining",
  "paymentMode": "UPI",
  "transactionDate": "2026-04-14T12:30:00.000Z",
  "source": "manual",
  "referenceId": "UPI123ABC",
  "notes": "Lunch"
}
```

### `POST /api/transactions/bulk`
Create multiple transactions in one call.

Body (array):
```json
[
  {
    "merchantName": "Amazon",
    "amount": 2499,
    "type": "debit",
    "category": "Shopping",
    "paymentMode": "Card",
    "transactionDate": "2026-04-14T10:00:00.000Z",
    "source": "sms"
  },
  {
    "merchantName": "Salary",
    "amount": 85000,
    "type": "credit",
    "category": "Income",
    "paymentMode": "Bank Transfer",
    "transactionDate": "2026-04-01T05:00:00.000Z",
    "source": "manual"
  }
]
```

### `PATCH /api/transactions/:id`
Update fields (partial update).

Body example:
```json
{
  "category": "Groceries",
  "notes": "Updated category"
}
```

### `DELETE /api/transactions/:id`
Delete transaction.

## Dashboard Routes (Protected)

### `GET /api/dashboard/summary`
Returns monthly summary:
- `totalSpent`
- `totalIncome`
- `smartSaved`
- `dailyAverage`
- `byCategory`
- `budgetAlerts`
- `activeSubscriptions`
- `totalSubscriptionCost`
- `transactionCount`

## Insights Routes (Protected)

### `GET /api/insights`
Returns:
- `summary` (`totalSpent`, `topCategory`, `topMerchant`)
- `insights` (cards)
- `categoryBreakdown`
- `weeklyTrend`

## Budget Routes (Protected)

### `GET /api/budgets`
List budgets for logged-in user.

### `POST /api/budgets`
Create or update (`upsert`) a category budget.

Body:
```json
{
  "category": "Food & Dining",
  "monthlyLimit": 15000
}
```

## Subscription Routes (Protected)

### `GET /api/subscriptions`
List subscriptions.

### `POST /api/subscriptions`
Add subscription.

Body:
```json
{
  "merchantName": "Netflix",
  "amount": 649,
  "billingCycle": "monthly",
  "nextBillingDate": "2026-05-01T00:00:00.000Z"
}
```

### `PATCH /api/subscriptions/:id/cancel`
Cancel subscription (sets status to `cancelled`).

## Postman Test Flow (Recommended)

1. `POST /auth/register` (once)
2. `POST /auth/login` and copy `data.token` to `{{token}}`
3. Hit protected APIs with `Authorization: Bearer {{token}}`
4. Create data in this order:
   - `POST /transactions` or `/transactions/bulk`
   - `POST /budgets`
   - `POST /subscriptions`
5. Read dashboards:
   - `GET /dashboard/summary`
   - `GET /insights`
