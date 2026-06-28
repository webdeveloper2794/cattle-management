# Cattle Management

A cattle management dashboard for tracking cattle records, health status, notes, and weight history.

## Tools Used

- **Next.js App Router**: app routing, pages, layouts, and API routes
- **React**: UI components and client interactions
- **TypeScript**: type safety across the app
- **Prisma**: database schema, migrations, and queries
- **PostgreSQL / Neon**: database
- **Zod**: form and API validation
- **React Hook Form**: cattle form handling
- **TanStack Table**: cattle data table
- **Recharts**: dashboard weight activity chart
- **shadcn/ui + Tailwind CSS**: UI components and styling
- **Node test runner**: small validation tests

## How To Run

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Add your database URLs in `.env`.

Generate Prisma client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

Seed demo cattle data:

```bash
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Available Scripts

```bash
npm run dev              # start local development server
npm run build            # generate Prisma client and build Next.js app
npm run start            # start production server
npm run lint             # run ESLint
npm run test             # run validation tests
npm run db:seed          # seed demo cattle and weight records
npm run prisma:generate  # generate Prisma client
npm run prisma:migrate   # create/apply local migrations
npm run prisma:deploy    # apply migrations in deployed environment
npm run prisma:studio    # open Prisma Studio
```

## Main Features

- Create, edit, and delete cattle records
- Filter cattle by search, gender, purpose, status, and health
- View cattle in a paginated data table
- Open a detail drawer for notes, profile data, and weight history
- Add and delete weight records
- Dashboard cards for herd stats
- Dashboard chart for weight record activity
