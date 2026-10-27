# InstaLite

Express API backed by Prisma 7 and PostgreSQL.

## Local setup

1. Install Node.js 20.19+ and start a local PostgreSQL server.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` for your local PostgreSQL user and database.
4. Create/update the schema and generate Prisma Client: `npm run db:setup`.
5. (Optional) Load the sample data with `npm run seed`. **Seeding clears existing users, posts, and likes first.**
6. Start the API with `npm start` (default port `3000`; override with `PORT`).

`GET /health` returns `{ "status": "OK" }`. User endpoints are mounted at `/users`; post and like endpoints are mounted at `/posts`.
