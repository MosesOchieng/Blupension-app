import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  VStack,
} from "@chakra-ui/react";

const AuthCheck = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        navigate("/login.html");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success" && data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setIsAuthenticated(true);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login.html");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4} align="center" justify="center" minH="60vh">
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg">Loading your dashboard...</Text>
        </VStack>
      </Container>
    );
  }

  return isAuthenticated ? children : null;
};

export default AuthCheck;
