import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileFooter from "./components/MobileFooter";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Investments from "./pages/Investments";
import Transactions from "./pages/Transactions";
import Market from "./pages/Market";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import Savings from "./pages/Savings";
import InvestmentFlow from "./pages/InvestmentFlow";
import "./App.css";

const App = () => {
  return (
    <Flex direction="column" minH="100vh" className="app">
      <Navbar />
      <Box
        as="main"
        className="main-content"
        flex="1"
        pt={{ base: "64px", md: 0 }}
        pb={{ base: "60px", md: 0 }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/market" element={<Market />} />
          <Route path="/help" element={<Help />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/investment-flow" element={<InvestmentFlow />} />
        </Routes>
      </Box>
      <Footer display={{ base: "none", md: "block" }} />
      <MobileFooter />
    </Flex>
  );
};

export default App;
