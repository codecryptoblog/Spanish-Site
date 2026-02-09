# Project: Spanish-Site

## Project Overview

This is a Next.js web application designed for Spanish language learning. It appears to be a platform for both students and teachers, with features like self-study, leaderboards, assignments, and lesson plans. The project uses Supabase for its backend, including authentication and database services, and is built with React and TypeScript. Styling is done using Tailwind CSS.

## Building and Running

To get the development environment running, you'll need to have Node.js and npm (or yarn/pnpm/bun) installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    This project requires a `.env.local` file with the following Supabase credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```
    You can get these from your Supabase project settings.

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will be available at [http://localhost:3000](http://localhost:3000).

### Other Commands

*   **Build for production:**
    ```bash
    npm run build
    ```
*   **Start the production server:**
    ```bash
    npm run start
    ```
*   **Lint the code:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Framework:** The project is built with Next.js, using the App Router.
*   **Language:** The primary language is TypeScript.
*   **Styling:** Tailwind CSS is used for styling.
*   **Authentication:** Authentication is handled by Supabase.
*   **Database:** Supabase is used for the database. The database schema can be found in `schema.sql`.
*   **Routing:** The application uses file-based routing. The `src/app` directory contains the different routes of the application. The routes are organized into groups for `(dashboard)` and `(auth)`.
*   **Components:** Reusable components are located in the `src/components` directory.
