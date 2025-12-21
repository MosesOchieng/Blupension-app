import React from "react";
import { Box, VStack, Text, Button, Image } from "@chakra-ui/react";
import { useNavigate, useRouteError } from "react-router-dom";

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <VStack spacing={6} maxW="600px" p={8} textAlign="center">
        <Image
          src="/images/error.jpg"
          alt="Error"
          maxW="300px"
          borderRadius="md"
        />
        <Text fontSize="2xl" fontWeight="bold" color="gray.700">
          Oops! Something went wrong
        </Text>
        <Text color="gray.600">
          We apologize for the inconvenience. Our team has been notified and is
          working to fix this issue. If you don't hear from us soon, please
          submit a ticket at our homepage.
        </Text>
        <Text fontSize="sm" color="gray.500">
          Error: {error?.message || "An unexpected error occurred"}
        </Text>
        <Button colorScheme="blue" onClick={() => navigate("/")}>
          Return to Homepage
        </Button>
      </VStack>
    </Box>
  );
};

export default ErrorBoundary;
