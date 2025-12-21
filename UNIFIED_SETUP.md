# 🚀 Unified Blupension Application Setup

## Overview

The Blupension application now runs as a unified system with:
- **Express Server** (localhost:3000) - Landing page, authentication, API
- **Vite React App** (localhost:5175) - Dashboard and main application
- **Seamless Flow** - Landing page → Login/Register → Dashboard

## 🏃‍♂️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the root directory:
```env
NODE_ENV=development
JWT_SECRET=your-secret-key
PORT=3000
# Add other required environment variables
```

### 3. Start Development Servers
```bash
npm run dev
```

This will start both servers:
- **Express Server**: http://localhost:3000
- **Vite Dev Server**: http://localhost:5175

## 🔄 Application Flow

### Development Mode
1. **Landing Page**: http://localhost:3000
2. **Login/Register**: http://localhost:3000/login or http://localhost:3000/register
3. **Dashboard**: After authentication, automatically redirects to http://localhost:5175/dashboard

### Production Mode
1. **Landing Page**: http://localhost:3000
2. **Login/Register**: http://localhost:3000/login or http://localhost:3000/register
3. **Dashboard**: After authentication, serves from http://localhost:3000/dashboard

## 📁 Project Structure

```
blupension-app/
├── public/                 # Landing page assets (HTML, CSS, JS)
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── register.html      # Register page
│   └── css/              # Landing page styles
├── server/               # Express server
│   ├── src/             # React dashboard app
│   │   ├── components/  # React components
│   │   ├── pages/       # Dashboard pages
│   │   ├── contexts/    # React contexts
│   │   └── main.jsx     # React app entry
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   └── index.js         # Server entry point
├── contracts/           # Smart contracts
├── server.js           # Main Express server
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies and scripts
└── start-dev.js        # Development startup script
```

## 🛠 Available Scripts

### Development
```bash
npm run dev              # Start both servers (recommended)
npm run dev:server       # Start only Express server
npm run dev:client       # Start only Vite dev server
npm run dev:only         # Start Vite only (for dashboard development)
```

### Production
```bash
npm run build           # Build the entire application
npm run build:client    # Build only the React app
npm start               # Start production server
```

### Other
```bash
npm run test            # Run tests
npm run compile         # Compile smart contracts
npm run deploy          # Deploy smart contracts
```

## 🔧 Configuration

### Vite Configuration (vite.config.js)
- **Root**: Points to `server/src` for React app
- **Public Dir**: Points to `public` for shared assets
- **Build Output**: `dist/` directory
- **Proxy**: API requests proxied to Express server

### Express Server Configuration (server.js)
- **Port**: 3000 (configurable via PORT env var)
- **Static Files**: Serves both `public/` and `src/` directories
- **API Routes**: All `/api/*` routes
- **Auth Pages**: Serves HTML files from `public/`
- **Dashboard**: Redirects to Vite in dev, serves built app in production

## 🔐 Authentication Flow

1. **User visits landing page** → http://localhost:3000
2. **User clicks login/register** → http://localhost:3000/login or /register
3. **User submits credentials** → API call to `/api/auth/*`
4. **Server returns JWT token** → Stored in localStorage/cookies
5. **User redirected to dashboard** → http://localhost:5175/dashboard?token=xxx
6. **Dashboard loads with token** → React app initializes with authentication

## 🌐 Network Configuration

### Development
- **Express Server**: http://localhost:3000
- **Vite Dev Server**: http://localhost:5175
- **API Proxy**: Vite proxies `/api/*` to Express server

### Production
- **Single Server**: http://localhost:3000
- **Built React App**: Served from `dist/` directory
- **No Proxy Needed**: Everything served from Express

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 5175
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5175 | xargs kill -9
   ```

2. **Vite Build Errors**
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   npm run build:client
   ```

3. **Database Connection Issues**
   ```bash
   # Check database configuration
   npm run db:check
   ```

4. **Authentication Issues**
   - Clear browser localStorage and cookies
   - Check JWT_SECRET in .env file
   - Verify token expiration

### Development Tips

1. **Hot Reload**: Both servers support hot reload
2. **API Testing**: Use http://localhost:3000/api/* for direct API testing
3. **Dashboard Development**: Use `npm run dev:only` for dashboard-only development
4. **Full Stack Development**: Use `npm run dev` for complete development

## 📦 Deployment

### Build for Production
```bash
npm run build
```

This will:
1. Compile smart contracts
2. Build React app to `dist/`
3. Copy assets to correct locations

### Start Production Server
```bash
npm start
```

The production server will serve:
- Landing page and auth pages from `public/`
- Dashboard from built React app in `dist/`
- API routes from Express server

## 🔄 Migration from Separate Apps

If you were previously running the apps separately:

1. **Stop existing servers**
2. **Run `npm run dev`** (new unified command)
3. **Access via http://localhost:3000**
4. **Dashboard automatically redirects to Vite dev server**

The flow is now seamless and unified! 🎉 