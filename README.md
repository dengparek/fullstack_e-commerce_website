# Full-Stack E-Commerce Website

A complete full-stack e-commerce web application built with React, TypeScript, Vite, Node.js, Express, PostgreSQL, and Drizzle ORM.

The project is structured as a monorepo containing a React frontend and a RESTful backend API. The frontend provides the customer-facing shopping experience, while the backend handles authentication, products, orders, cart operations, database access, and API security.

## Features

- User registration and authentication
- Secure API authentication and protected endpoints
- Product management and product browsing
- Shopping cart management
- Order creation and management
- RESTful API architecture
- PostgreSQL database integration
- Type-safe database operations with Drizzle ORM
- Modular backend architecture
- React-based frontend
- Responsive user interface
- Client-server separation
- Environment-based configuration

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- ESLint

### Backend

- Node.js
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL

### Development

- npm
- Git
- GitHub

## Architecture

The application uses a client-server architecture.

```text
┌──────────────────────────────────────┐
│              Frontend                │
│                                      │
│       React + TypeScript + Vite      │
│                                      │
│     Customer-facing web interface    │
└──────────────────┬───────────────────┘
                   │
                   │ HTTP / REST API
                   ▼
┌──────────────────────────────────────┐
│               Backend                │
│                                      │
│       Node.js + Express + TS         │
│                                      │
│ Authentication │ Products │ Orders  │
│      Cart      │ API Security       │
└──────────────────┬───────────────────┘
                   │
                   │ Drizzle ORM
                   ▼
┌──────────────────────────────────────┐
│             PostgreSQL               │
│                                      │
│          Application Data            │
└──────────────────────────────────────┘
```

## Repository Structure

```text
fullstack_e-commerce_website/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
└── README.md
```

## Backend

The backend is a RESTful API built with Node.js, Express, and TypeScript.

It is responsible for the application's server-side operations, including:

- Authentication
- User management
- Product operations
- Cart operations
- Order operations
- Database access
- API request handling
- Protected endpoints

The backend uses PostgreSQL for persistent data storage and Drizzle ORM for type-safe database interaction.

## Frontend

The frontend is a React application built with TypeScript and Vite.

It provides the web interface through which users interact with the e-commerce platform, including browsing products, managing their cart, and interacting with the ordering system.

The frontend communicates with the backend through its REST API.

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL

### Clone the Repository

```bash
git clone https://github.com/dengparek/fullstack_e-commerce_website.git

cd fullstack_e-commerce_website
```

### Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure the required environment variables using the example environment configuration provided in the backend.

Start the backend development server:

```bash
npm run dev
```

### Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The Vite development server will provide the local URL in the terminal.

## Environment Configuration

Environment-specific configuration is kept outside the source code.

The backend requires configuration for items such as:

- Database connection
- Server configuration
- Authentication
- Application environment

Use the environment example file inside the `backend` directory as a reference for the required variables.

**Never commit real credentials, database passwords, API keys, or other secrets to GitHub.**

## API

The backend exposes RESTful endpoints used by the frontend.

The API is organized around the application's main resources, including:

- Authentication
- Users
- Products
- Orders
- Cart

The API is independently structured from the frontend, allowing the backend to serve other clients in addition to the React application.

## Project Design

The project separates the application into two independent layers:

**Frontend**

Handles the user interface and client-side interaction.

**Backend**

Handles business logic, authentication, API requests, and database operations.

**Database**

Stores persistent application data using PostgreSQL.

This separation makes the application easier to maintain, test, and deploy.

## License

This project is licensed under the MIT License.

## Author

**Deng Parek**

GitHub: https://github.com/dengparek
