# Hisaba Backend

This is the Node.js/TypeScript backend for the Hisaba application. It uses Express and Prisma ORM to connect to a PostgreSQL database on Neon.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables (`.env`):
   Create a `.env` file using `.env.example`. Make sure you have the `DATABASE_URL`, `PRISMA_ACCELERATE_URL`, and `JWT_SECRET`.

3. Run migrations and generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

This app is configured to be deployed seamlessly on **Render**. 
The repository includes a `render.yaml` blueprint configuration which handles the unified deployment, including Prisma migrations and generating the client out-of-the-box.
