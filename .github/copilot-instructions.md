git remote remove origin# Copilot / Agent instructions for FoodAppNodeReact.js

## Quick overview ✅
- Monorepo-style **backend + frontend** (Express + MongoDB backend, React + Vite frontend).
- Backend main entry: `server.js` (runs on PORT 5000 by default).
- Frontend app in `frontend/recipe-app` (Vite, `npm run dev`).
- Authentication: JWT (signed with `process.env.SECRET_KEY` or `JWT_SECRET`).
- i18n: server-side `i18next` with filesystem backend (`i18n/config.js`, locales in `i18n/locales`).

## How to run (dev) 🛠️
1. Create a `.env` with at least:
   - `MONGO_URI` (MongoDB connection string)
   - `SECRET_KEY` (JWT secret)
2. Start backend: `npm run dev` (uses `nodemon`, starts `server.js`).
3. Start frontend: `cd frontend/recipe-app && npm run dev` (Vite dev server).

Note: the frontend currently uses explicit backend URLs (e.g. `http://localhost:5000/...`). If you change the backend port, update those URLs or implement an API base env var.

## Key endpoints & debug helpers 🔎
- Public test: `GET /` returns available debug routes.
- DB and auth debug:
  - `GET /api/debug/stats` (no auth) — basic counts.
  - `GET /api/debug/test-jwt` — returns a nutritionist JWT you can use for testing.
  - `GET /api/debug/mongodb` — lists collections and counts.
- Auth flows: in `routes/user.js` — register `/user/register`, login `/user/signin`, token verify `/user/verify`.
- Nutritionist dashboard: `GET /api/recipes/stats` (requires nutritionist role via `middleware/isNutritionist.js`).

## Auth & roles 🧾
- Roles: `user`, `nutritionist`, `admin` (see `models/UserSchema.js`).
- JWT verification middleware: `middleware/auth.js` and `middleware/isNutritionist.js` (both expect `Authorization: Bearer <token>`).
- To quickly get a nutritionist token during development use: `GET /api/debug/test-jwt` (inspect the `token` field).

## Uploads & static files 📁
- Image uploads handled by `multer` in `routes/recipe.js` and saved to `public/images/`.
- Public static served from `app.use('/public', express.static('public'))` — full URL: `http://localhost:5000/public/images/<filename>`.
- Max upload size: 5 MB and only image MIME-types allowed.

## Data models & important conventions 📐
- `User` (`models/UserSchema.js`) exposes helper methods (e.g., `addToFavorites`, `toPublicProfile`).
- `Recipe` (`models/RecipeSchema.js`) includes `status` values and convenience methods (`approve`, `reject`, `findPending`).
- Note: there is some inconsistency in the codebase around recipe statuses — both `validated` and `approved` appear. Agents should accept either when matching/storing statuses and prefer to adapt existing API usage (`routes/recipe.js` expects `validated` in some places while methods use `approved`).

## Frontend patterns / assumptions ⚙️
- Auth token and user are stored in `localStorage` (`token`, `user`).
- API calls use hardcoded `http://localhost:5000` base; update when changing backend port or add a central baseURL (search for `http://localhost:5000` in `frontend/recipe-app/src`).
- Error handling: if a request returns 401 the app clears auth storage and redirects to `/login`.

## i18n details 🌐
- Server-side language detection uses the `accept-language` header and querystring.
- Locales: `i18n/locales/en.json` and `i18n/locales/fr.json` — prefer using `req.t('key')` in server responses when present.

## Helpful files to inspect 🔍
- `server.js` — app bootstrap, debug routes, middleware order (i18n must be applied before routes).
- `routes/user.js`, `routes/recipe.js`, `routes/product.js` — main API surface.
- `middleware/auth.js`, `middleware/isNutritionist.js` — auth logic and error responses.
- `models/*.js` — data shapes and helper methods.
- `config/nutritionistMatricules.js` — list of authorized nutritionist matricules; changes here affect registration flow.

## Common gotchas & guidance ⚠️
- Always ensure `MONGO_URI` and `SECRET_KEY` are set before starting the server; missing secrets will make debug endpoints fail.
- Use `/api/debug/test-jwt` to produce a usable token for quick manual testing.
- When modifying object shapes (e.g., changing `Recipe.status` values), update both backend routes and frontend filters/components (see `MyRecipes.jsx` which normalizes `validated` → `approved`).
- Multer storage path expects `public/images/` to exist — ensure that folder is present and writable in your environment.

## Working on features or bugfixes 💡
- Run backend with `NODE_ENV=development` to get verbose errors in responses (server prints stack traces only in development).
- Add unit/integration tests by focusing on: auth flows, `Recipe` status transitions, and upload endpoints.

---
If any section is unclear or you'd like me to include more examples (e.g., exact curl requests, sample `.env` content, or a short developer checklist), tell me which part to expand and I will iterate.