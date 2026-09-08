# Full-Stack E-Commerce Website

A full-stack e-commerce application built with a modern TypeScript-based stack. The project is organized as a monorepo containing a RESTful backend API and a React frontend.

## Project Structure

```text
fullstack_e-commerce_website/
│
├── backend/          # REST API
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── frontend/         # React + Vite application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Drizzle ORM
- REST API
- JWT-based authentication
- Modular architecture

### Frontend

- React
- TypeScript
- Vite
- ESLint
- Modern React development workflow

## Features

### Backend API

The backend provides the server-side functionality for the e-commerce application, including:

- User authentication
- Product management
- Order management
- Cart functionality
- Protected API endpoints
- Request validation
- Database operations
- Modular controllers and routes
- Error handling

### Frontend

The frontend provides the user interface for interacting with the e-commerce platform.

It is built with React and Vite and is designed to communicate with the backend through its REST API.

The frontend and backend are maintained as separate applications within the same repository, allowing them to be developed and deployed independently.

## Architecture

The application follows a client-server architecture:

```text
┌──────────────────────┐
│      Frontend        │
│                      │
│ React + TypeScript   │
│       + Vite         │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│       Backend        │
│                      │
│ Node.js + Express    │
│     + TypeScript     │
└──────────┬───────────┘
           │
           │ Drizzle ORM
           ▼
┌──────────────────────┐
│      PostgreSQL      │
└──────────────────────┘
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL

Clone the repository:

```bash
git clone https://github.com/dengparek/fullstack_e-commerce_website.git
cd fullstack_e-commerce_website
```

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment configuration based on the example environment file provided in the backend.

Then start the development server:

```bash
npm run dev
```

The backend API will run according to the port configured in your environment variables.

## Frontend Setup

Open another terminal and navigate to the frontend:

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

Vite will provide the local development URL in the terminal.

## Development

The backend and frontend are independent applications.

Run the backend from:

```text
/backend
```

and the frontend from:

```text
/frontend
```

During development, the frontend communicates with the backend through the configured API URL.

## Environment Variables

Environment-specific configuration should be stored in local environment files and should **not** be committed to the repository.

The backend requires environment variables for things such as:

- Database connection
- Authentication configuration
- Application port
- Other server-side configuration

Refer to the environment example file inside the `backend` directory for the required variables.

## API

The backend exposes RESTful endpoints for the application's core functionality, including authentication, products, orders, and cart operations.

The API is designed to be consumed by the React frontend and can also be used independently by other clients.

## Project Status

This project is actively being developed.

The backend API and frontend application are being developed together as a full-stack e-commerce platform, with additional features and improvements being added over time.

## Author

**Deng Parek**

GitHub: [@dengparek](https://github.com/dengparek)
