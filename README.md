# Northwind Trading Dashboard

A full-stack, production-ready web application providing an analytical dashboard and full CRUD management for the classic Northwind Trading database. Built with modern web technologies, this dashboard offers a seamless, highly responsive, and beautiful user interface.

## 🚀 Features

-   **Business Analytics Dashboard:** Visualize Key Performance Indicators (KPIs) such as Total Revenue, Orders, and Active Customers. Includes monthly charts and recent transactions.
-   **Full CRUD Management:**
    -   **Products:** View, search, filter by category, create, edit, and delete products. Includes low-stock alerts.
    -   **Customers:** Manage customer profiles and view their complete order history.
    -   **Orders:** Track order statuses, shipping details, and attached line items (Order Details).
    -   **Employees:** Employee directory with performance statistics.
-   **Advanced Reporting:** Visualize Sales by Category, Customer Geographic Segmentation, and Top Performing Employees.
-   **Modern UI/UX:** Dark mode support, instantaneous search, server-side pagination, interactive charts, and toast notifications.

## 🛠️ Tech Stack

-   **Frontend:** Next.js 16 (App Router), React 19, TypeScript
-   **Styling:** Tailwind CSS, shadcn/ui
-   **Icons:** Lucide React
-   **Data Visualization:** Recharts
-   **Forms & Validation:** React Hook Form, Zod
-   **Backend:** Next.js API Routes (REST)
-   **Database:** PostgreSQL (Northwind Database)
-   **ORM:** Prisma

## 📂 Project Structure

```text
northwind-dashboard/
├── prisma/             # Prisma ORM schema and database connection
├── public/             # Static assets (images, fonts, etc.)
├── src/
│   ├── app/            # Next.js App Router pages and API routes
│   │   ├── (dashboard)/# Protected dashboard UI layout & pages
│   │   └── api/        # REST API endpoints (backend)
│   ├── components/     # Reusable React components (UI, forms, charts)
│   ├── hooks/          # Custom React hooks for data fetching & state management
│   ├── lib/            # Utility functions and Prisma client instance
│   └── types/          # TypeScript interfaces and type definitions
├── tailwind.config.ts  # Tailwind CSS configuration
└── next.config.ts      # Next.js configuration
```

## ⚙️ Getting Started

### Prerequisites

-   Node.js 18+
-   PostgreSQL database containing the Northwind schema (tables in PascalCase: `Categories`, `Customers`, `Employees`, `OrderDetails`, `Orders`, `Products`, `Shippers`, `Suppliers`).

### Installation

1.  **Clone the repository and jump into the project directory:**
    ```bash
    git clone https://github.com/yourusername/northwind-dashboard.git
    cd northwind-dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and set your PostgreSQL connection URL:
    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/movedb?schema=public"
    ```

4.  **Sync Prisma Client:**
    ```bash
    npx prisma generate
    ```

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

6.  **Open the Application:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 License

This project is licensed under the MIT License.
