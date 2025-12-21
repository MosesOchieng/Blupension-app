# 🚀 How to Run the Blupension Project

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Database** (PostgreSQL, MySQL, or SQLite - depending on your setup)

## Quick Start

### Option 1: Run React App Only (Recommended for Development)

The React dashboard app is in the `server/` directory:

```bash
# Navigate to server directory
cd server

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

The React app will start on **http://localhost:5173**

### Option 2: Run Full Stack (React App + Backend API)

#### Terminal 1 - React App (Server Directory):
```bash
cd server
npm install
npm run dev
```
This starts the React app on **http://localhost:5173**

#### Terminal 2 - Backend API (Root Directory):
```bash
# From the root directory
npm install
npm run dev:server
```
This starts the Express server (default port **3000** or as configured)

### Option 3: Run Backend Server Only (Server Directory)

If you want to run the backend server from the server directory:

```bash
cd server
npm install
npm run dev
```

This starts the backend API server (default port **5000** or as configured in server/src/index.js)

## Environment Setup

### 1. Create `.env` file

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production

# Database Configuration (choose one)
# For PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blupension
DB_USER=your_user
DB_PASSWORD=your_password

# For SQLite (simpler for development)
# DB_DIALECT=sqlite
# DB_STORAGE=./database.sqlite

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Web3/Blockchain (optional)
WEB3_PROVIDER_URL=http://localhost:8545
CONTRACT_ADDRESS=your_contract_address
```

### 2. Database Setup

```bash
# Navigate to server directory
cd server

# Check database connection
npm run db:check

# Run migrations
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed
```

## Available Scripts

### Root Directory Scripts

```bash
npm start              # Start production server
npm run dev:server     # Start Express server with nodemon
npm run dev:client     # Start Vite dev server
npm run build          # Build for production
npm test               # Run tests
```

### Server Directory Scripts

```bash
npm start              # Start backend server
npm run dev            # Start backend with nodemon (or Vite if configured)
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database
npm run db:check       # Check database connection
npm run db:reset       # Reset and seed database
```

## Project Structure

```
blupension-app/
├── server/                    # React Dashboard App
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── main.jsx          # React entry point
│   │   └── index.js          # Backend server entry
│   ├── package.json
│   └── vite.config.js        # Vite configuration
├── public/                    # Static files (HTML, CSS, images)
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   └── icons/                # App icons
├── server.js                  # Main Express server
├── package.json              # Root dependencies
└── .env                      # Environment variables
```

## Access Points

### Development Mode

- **React Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:5000 (or port in server/src/index.js)
- **Express Server**: http://localhost:3000 (if running server.js)
- **API Endpoints**: http://localhost:5000/api/*

### Production Mode

After building:
```bash
npm run build
npm start
```

- **Application**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **API**: http://localhost:3000/api/*

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# If in server directory
cd server
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

1. Check your `.env` file has correct database credentials
2. Ensure your database server is running
3. Run `npm run db:check` to verify connection
4. For SQLite, ensure the database file path is correct

### CORS Errors

If you see CORS errors, make sure:
1. Both frontend and backend are running
2. The frontend URL is in the allowed origins (check server/src/index.js)
3. Check the CORS configuration matches your setup

## Recommended Development Workflow

1. **Start Backend API** (Terminal 1):
   ```bash
   cd server
   npm run dev
   ```

2. **Start React App** (Terminal 2):
   ```bash
   cd server
   npm run dev  # This will start Vite if configured
   ```
   
   Or if you have a separate dev script for React:
   ```bash
   cd server
   npm run dev:client
   ```

3. **Access the app**: http://localhost:5173

## Notes

- The React app uses **Vite** as the build tool
- The backend uses **Express** and **Sequelize** for the database
- **Chakra UI** is used for the UI components
- Make sure to have a `.env` file with proper configuration before starting

