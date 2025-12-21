import React, { useEffect, useState } from "react";
import {
  Box,
  Spinner,
  Text,
  VStack,
  useToast,
  ScaleFade,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

const LoadingRedirect = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Show loading for 1.5 seconds
    setTimeout(() => {
      setShowSuccess(true);
      // Show success for 1 second then redirect
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }, 1500);
  }, []);

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="white"
    >
      <ScaleFade initialScale={0.9} in={true}>
        <VStack spacing={4}>
          {!showSuccess ? (
            <>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
              <Text fontSize="lg" color="gray.600">
                Redirecting to dashboard...
              </Text>
            </>
          ) : (
            <>
              <Box
                bg="green.500"
                borderRadius="full"
                p={2}
                color="white"
                fontSize="2xl"
              >
                <CheckIcon boxSize={6} />
              </Box>
              <Text fontSize="lg" color="gray.600">
                Success!
              </Text>
            </>
          )}
        </VStack>
      </ScaleFade>
    </Box>
  );
};

export default LoadingRedirect;
