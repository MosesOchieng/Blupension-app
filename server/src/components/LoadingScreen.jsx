import React from "react";
import {
  Box,
  VStack,
  Spinner,
  Text,
  ScaleFade,
  useColorModeValue,
} from "@chakra-ui/react";

const LoadingScreen = ({ message = "Loading..." }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg={bgColor}
      zIndex="overlay"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <ScaleFade initialScale={0.9} in={true}>
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
          <Text fontSize="lg" color={textColor}>
            {message}
          </Text>
        </VStack>
      </ScaleFade>
    </Box>
  );
};

export default LoadingScreen;
