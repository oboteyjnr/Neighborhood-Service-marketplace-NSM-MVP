# Neighborhood Service Marketplace (NSM-MVP)

# Project Contributors:
# 1. OTOBONG PATRICK OBOT N01711342
# 2. SAMAD DERE N01738005
# 3. SAMUEL ILESANMI N01666340

## 1. Project Overview
Neighborhood Service Marketplace is a full-stack web application where:
- Residents create service requests.
- Providers submit quotes against open requests.
- Residents accept exactly one quote for each request.

This implementation focuses on MongoDB schema quality, backend business rule enforcement, session-based authentication, and Angular integration.

## 2. System Architecture
- Frontend: Angular (`frontend/nsm-frontend`)
- Backend: Node.js + Express + Mongoose (`backend`)
- Database: MongoDB
- Auth: `express-session` with MongoDB session store (`connect-mongo`)

Backend structure:
- `src/models`
- `src/controllers`
- `src/routes`
- `src/middleware`
- `src/config`
- `src/utils`

## 3. Setup Instructions
### 3.1 Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```

Required `.env` values:
- `PORT`
- `MONGO_URI`
- `SESSION_SECRET`
- `FRONTEND_ORIGIN`

### 3.2 Frontend
```bash
cd frontend/nsm-frontend
npm install
npm start
```

Angular environment file:
- `src/environments/environment.ts`
- Set `apiBaseUrl` to backend API (`http://localhost:3000/api`)

### 3.3 CORS + Credentials
Backend CORS is configured with:
- `origin = FRONTEND_ORIGIN`
- `credentials = true`

All Angular HTTP calls use `withCredentials: true`.

## 4. MongoDB Schema and Referencing Decisions
Collections:
- `users`
- `categories`
- `serviceRequests`
- `quotes`

Referencing strategy justification:
- `serviceRequests.residentId -> users._id`: each request belongs to one resident, and resident profile remains normalized.
- `serviceRequests.categoryId -> categories._id`: category metadata is reused and managed centrally.
- `quotes.requestId -> serviceRequests._id`: one-to-many relation (request to quotes) is represented by references for scalable quote volume.
- `quotes.providerId -> users._id`: provider identity remains normalized and reusable across multiple quotes.
- `serviceRequests.assignedQuoteId -> quotes._id`: direct pointer to selected quote for fast detail retrieval.

Why references over embedding:
- Quotes can grow unbounded and are queried independently (provider dashboards, quote status checks).
- User/category data is shared by many documents and should not be duplicated.
- Referencing supports independent indexing and cleaner lifecycle updates.

## 5. Query Patterns and Index Strategy
Expected query pattern 1: Request listing with filters
- Query: `status + categoryId + optional text keyword`
- Indexes:
  - Compound index on `serviceRequests(status, categoryId)` for common filters.
  - Text index on `serviceRequests(title, description)` used only when keyword `q` is provided.

Expected query pattern 2: Quotes for request details
- Query: `quotes.find({ requestId })`
- Index:
  - Required index on `quotes(requestId)`.

Expected query pattern 3: Provider "My Quotes"
- Query: `quotes.find({ providerId })`
- Index:
  - Recommended index on `quotes(providerId)`.

Additional integrity/performance indexes:
- Required unique index on `users.email`.
- Unique index on `categories.name`.
- Unique index on `quotes(providerId, requestId)` to prevent duplicate quote submissions by same provider for same request.
- Partial unique index on `quotes(requestId, status=accepted)` to guarantee at most one accepted quote per request at database level.

Scalability considerations:
- Compound and selective indexes are aligned with API access paths to avoid collection scans.
- Text index is only activated for keyword searches to reduce unnecessary query overhead.
- Quote growth scales independently from request documents due to reference-based modeling.
- Session data is stored in MongoDB store, enabling horizontal backend scaling when needed.

## 6. Backend API Endpoints
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Categories
- `POST /api/categories`
- `GET /api/categories`

### Service Requests
- `POST /api/requests` (resident only)
- `GET /api/requests` (supports `status`, `categoryId`, `q`)
- `GET /api/requests/:id`
- `PATCH /api/requests/:id/status` (resident owner)
- `GET /api/requests/:id/quotes`

### Quotes
- `POST /api/quotes` (provider only)
- `GET /api/quotes/request/:requestId`
- `GET /api/quotes/my` (provider only)
- `POST /api/quotes/:quoteId/accept` (resident owner)

## 7. Workflow and Business Rule Enforcement
Implemented enforcement:
- Session-based access control (no JWT).
- Password hashing (`bcrypt`).
- Role checks on protected routes.
- Ownership checks:
  - Resident accepts quote only for own request.
  - Resident views request quotes only for own request.
  - Provider can submit quote only as provider.
- Status transition checks in request status updates.
- Numeric range checks for `price` and `daysToComplete`.
- ObjectId validation for route params and request references.

Idempotency and quote acceptance guarantee:
- Repeated accept attempt of already accepted quote returns conflict.
- Database-level partial unique index guarantees at most one accepted quote per request.
- Accept operation marks selected quote accepted, all others rejected, and request status assigned.

## 8. Angular Frontend Coverage
Pages implemented:
1. Register page with reactive form: `name, email, password, role`.
2. Login page with reactive form: `email, password`.
3. Requests list page with filters: `status, category, keyword`.
4. Create request page (resident route guard).
5. Request details page:
   - resident quote view + accept button where allowed.
   - provider quote submission form when request is open/quoted.
6. My Quotes page (provider route guard).

Services:
- `AuthService`
- `CategoryService`
- `RequestService`
- `QuoteService`

Guards:
- `AuthGuard`
- `RoleGuard`

UI DTO models:
- `UserDto`
- `CategoryDto`
- `ServiceRequestDto`
- `QuoteDto`

## 9. Postman Testing Instructions
A ready collection is available at:
- `postman/NSM-MVP.postman_collection.json`

Workflow covered:
1. Register resident
2. Login resident
3. Create category
4. Create request
5. Register provider
6. Login provider
7. List open requests
8. Submit quote
9. Resident view quotes
10. Accept quote
11. Verify request assigned
12. Verify rejected quotes

## 10. Manual UI Test Checklist
- Login/logout flows work.
- Unauthorized routes redirect to login.
- Role-restricted routes are enforced.
- Request filters apply correctly.
- Quote acceptance updates quote/request status immediately in UI.

## 11. Status Codes Used
- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

## 12. Group Role Distribution (Template)
Replace with real names and IDs before submission:
- Student 1: Data modeling + indexing
- Student 2: Authentication + authorization
- Student 3: Requests + quotes business logic
- Student 4: Angular frontend pages + guards
- Student 5: Testing + documentation + integration

## 13. Run Summary
- Backend base URL: `http://localhost:3000/api`
- Frontend URL: `http://localhost:4200`
- Full workflow supports resident request creation, provider quote submission, and single quote acceptance with integrity constraints.
