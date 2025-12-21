import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import TokenManagement from "./pages/TokenManagement";
import Investments from "./pages/Investments";
import Dashboard from "./pages/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "market",
        element: <Market />,
      },
      {
        path: "portfolio",
        element: <Portfolio />,
      },
      {
        path: "transactions",
        element: <Transactions />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "help",
        element: <Help />,
      },
      {
        path: "token-management",
        element: <TokenManagement />,
      },
      {
        path: "investments",
        element: <Investments />,
      },
    ],
  },
  {
    path: "*",
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
]);

export default router;
