<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SmartSpend Tracker

A modern expense tracking application with MySQL database integration.

## 📁 Project Structure

```
smartspend-tracker/
├── frontend/          # React frontend application
│   ├── components/   # React components
│   ├── services/     # API services
│   ├── App.tsx       # Main app component
│   └── ...
├── backend/          # Node.js/Express backend
│   ├── config/       # Configuration files
│   ├── db/          # Database scripts
│   ├── routes/      # API routes
│   └── index.ts     # Server entry point
└── package.json     # Project dependencies
```

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a MySQL database (or use the default `smartspend`):
```sql
CREATE DATABASE smartspend;
```

2. Configure your database connection in `.env` file (see `SETUP.md` for details):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=smartspend
PORT=5000
JWT_SECRET=acc215f4d25f0a6545e54cdcad3580ecb97ea5b07bd57f1165de25c95943c9d64f1146ae2f552ef4132a8a5642c1d974283ca2ccc8762e1d51c72199743f3064
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:5000/api
```

**Note:** A secure JWT secret has been generated for you. See `SETUP.md` for more details.

3. Initialize the database schema:
```bash
npm run db:init
```

### 3. Run the Application

Start both frontend and backend servers:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend server (port 5000)
npm run dev:server

# Frontend (port 3000)
npm run dev:client
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Project Structure

```
smartspend-tracker/
├── frontend/            # React frontend application
│   ├── components/      # React components
│   ├── services/        # API service layer
│   ├── App.tsx         # Main app component
│   └── ...
├── backend/            # Node.js/Express backend
│   ├── config/         # Database configuration
│   ├── db/             # Database schema and initialization
│   ├── routes/         # API routes
│   └── index.ts        # Server entry point
└── package.json        # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add new expense
- `GET /api/expenses/price-history?itemName=...` - Get price history

### Items
- `GET /api/items` - Get all items

## Features

- ✅ User authentication with JWT
- ✅ MySQL database integration
- ✅ Expense tracking
- ✅ Receipt image analysis (Gemini AI)
- ✅ Price comparison
- ✅ Expense history
- ✅ User profile

## Production Deployment

### Build for Production:
```bash
npm run build        # Build both frontend and backend
npm run start:prod   # Start production server
```

### Deploy to Railway (Recommended):
1. Push code to GitHub
2. Connect to Railway
3. Add MySQL service
4. Set environment variables (see below)
5. Deploy!

### Deploy to Render:
1. Connect GitHub repository
2. Create Web Service
3. Add MySQL database
4. Set build command: `npm install && npm run build`
5. Set start command: `npm run start:prod`
6. Deploy!

### Required Environment Variables:
```env
NODE_ENV=production
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=smartspend
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_key
VITE_API_URL=https://your-backend-url.com/api
```
