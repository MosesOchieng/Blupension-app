import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Button,
  useColorModeValue,
  Badge,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

const Investments = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const plans = [
    {
      name: "Conservative Plan",
      description: "Low risk, stable returns",
      features: [
        "60% Bonds",
        "30% Blue-chip stocks",
        "10% Cash",
        "Annual return: 5-7%",
        "Minimum investment: $1,000",
      ],
      color: "blue",
    },
    {
      name: "Balanced Plan",
      description: "Moderate risk, balanced returns",
      features: [
        "40% Bonds",
        "50% Stocks",
        "10% Alternative investments",
        "Annual return: 7-10%",
        "Minimum investment: $2,500",
      ],
      color: "blue",
    },
    {
      name: "Growth Plan",
      description: "Higher risk, potential for higher returns",
      features: [
        "20% Bonds",
        "70% Stocks",
        "10% Cryptocurrency",
        "Annual return: 10-15%",
        "Minimum investment: $5,000",
      ],
      color: "blue",
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>
            Investment Plans
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Choose the investment plan that best suits your retirement goals
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {plans.map((plan) => (
            <Box
              key={plan.name}
              bg={bgColor}
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              shadow="sm"
            >
              <VStack align="stretch" spacing={4}>
                <Badge colorScheme="blue" alignSelf="start" fontSize="sm" px={2} py={1}>
                  {plan.name}
                </Badge>
                <Text fontSize="lg" fontWeight="semibold">
                  {plan.description}
                </Text>
                <List spacing={3}>
                  {plan.features.map((feature) => (
                    <ListItem key={feature}>
                      <ListIcon as={CheckIcon} color="green.500" />
                      {feature}
                    </ListItem>
                  ))}
                </List>
                <Button
                  as={RouterLink}
                  to="/portfolio"
                  colorScheme="blue"
                  bg="blue.500"
                  _hover={{ bg: "blue.600" }}
                  size="lg"
                  mt={4}
                  w="full"
                >
                  Select Plan
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default Investments;
