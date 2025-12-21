require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize } = require("./models");
const authRoutes = require("./routes/auth");
const mobileMoneyRoutes = require("./routes/mobileMoney");
const tokenRoutes = require("./routes/token");
const investmentRoutes = require("./routes/investment");
const bptManagementRoutes = require("./routes/bptManagement");
const walletRoutes = require("./routes/wallet");
const dashboardRoutes = require("./routes/dashboard");
const { startCronJobs } = require("./services/cron");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5175',
      'https://blupension.com',
      'https://www.blupension.com',
      'https://blupension-app.vercel.app',
      'https://blupension-app.netlify.app'
    ];
    
    // Add environment-specific origins
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:*');
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(cookieParser());

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  // First try to get token from Authorization header
  let token = req.headers.authorization?.split(" ")[1];

  // If no token in header, try to get from query parameters
  if (!token && req.query.token) {
    token = req.query.token;
  }

  // If still no token, try to get from cookies
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    if (req.xhr || req.path.startsWith("/api/")) {
      return res.status(401).json({ error: "Authentication required" });
    }
    return res.redirect("/login");
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );
    
    // Set the user information in the request
    req.user = {
      id: decoded.userId || decoded.id, // Handle both userId and id
      email: decoded.email,
      role: decoded.role
    };

    // If token came from query params, set it in Authorization header for future requests
    if (req.query.token) {
      req.headers.authorization = `Bearer ${token}`;
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    if (req.xhr || req.path.startsWith("/api/")) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.redirect("/login");
  }
};

// Make sequelize available to routes
app.use((req, res, next) => {
  req.sequelize = sequelize;
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/mobile-money", checkAuth, mobileMoneyRoutes);
app.use("/api/token", checkAuth, tokenRoutes);
app.use("/api/investment", checkAuth, investmentRoutes);
app.use("/api/bpt", checkAuth, bptManagementRoutes);
app.use("/api/wallet", checkAuth, walletRoutes);
app.use("/api/dashboard", checkAuth, dashboardRoutes);

// Serve static files from public directory (for landing page and dashboard assets)
app.use(express.static(path.join(__dirname, "public")));

// Serve static files from Dashboard build directory
app.use("/dashboard-assets", express.static(path.join(__dirname, "public", "Dashboard", "build")));

// Landing page and auth pages (HTML files)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  // Check if user is already logged in
  let token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token && req.query.token) {
    token = req.query.token;
  }
  
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      // User is already logged in, redirect to dashboard
      return res.redirect('/dashboard');
    } catch (error) {
      // Token is invalid, continue to login page
    }
  }
  
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/verify-code", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "verify-code.html"));
});

app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "forgot-password.html"));
});

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "reset-password.html"));
});

// Logout route
app.get("/logout", (req, res) => {
  // Clear the token cookie if it exists
  res.clearCookie('token');
  res.redirect('/login');
});

// Protected dashboard route - serves the HTML dashboard
app.get("/dashboard", (req, res, next) => {
  try {
    // Try to get token from Authorization header first
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token in header, try to get it from query parameters
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    // If no token in header or query, try cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.redirect('/login');
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;

    // Serve the new HTML dashboard from Dashboard/build/index.html
    res.sendFile(path.join(__dirname, "public", "Dashboard", "build", "index.html"));
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect('/login');
  }
});

// Handle 404 for unknown routes
  app.get("*", (req, res) => {
  // Don't serve dashboard for API routes or auth pages
    if (req.path.startsWith('/api') || 
        req.path === '/' || 
        req.path === '/login' || 
        req.path === '/register' || 
        req.path === '/verify-code' || 
        req.path === '/forgot-password' || 
      req.path === '/reset-password' ||
      req.path === '/dashboard') {
    res.status(404).send('Page not found');
    } else {
    res.status(404).send('Page not found');
    }
  });

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Export the app and sequelize for testing
module.exports = { app, sequelize };

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  // Sync database and start server
  sequelize
    .sync({ alter: false }) // Set alter: false to prevent automatic schema changes
    .then(() => {
      console.log("Database synced successfully");

      // Start the server
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Landing page: http://localhost:${PORT}`);
        console.log(`Login page: http://localhost:${PORT}/login`);
        console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
        // Start cron jobs after server starts
        startCronJobs();
      });
    })
    .catch((err) => {
      console.error("Unable to sync database:", err);
    });

  // Handle process termination
  process.on("SIGINT", async () => {
    try {
      await sequelize.close();
      console.log("Database connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });
}
