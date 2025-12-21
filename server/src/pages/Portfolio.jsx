import React from "react";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Text,
  Card,
  CardBody,
  CardHeader,
  Badge,
  HStack,
  VStack,
  CircularProgress,
  CircularProgressLabel,
  useColorModeValue,
} from "@chakra-ui/react";

const Portfolio = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Sample portfolio data
  const portfolioStats = [
    { label: "Total Value", value: "$25,430.50", change: 8.2 },
    { label: "Monthly Returns", value: "$1,245.30", change: 12.5 },
    { label: "Annual Returns", value: "$4,567.80", change: 15.8 },
    { label: "Total Contributions", value: "$20,000.00", change: 0 },
  ];

  const assetAllocation = [
    { name: "Stocks", percentage: 45, color: "blue" },
    { name: "Bonds", percentage: 30, color: "blue" },
    { name: "Real Estate", percentage: 15, color: "blue" },
    { name: "Crypto", percentage: 10, color: "blue" },
  ];

  const investments = [
    {
      name: "Growth Fund",
      value: "$12,500.25",
      change: 5.4,
      allocation: 45,
      risk: "Moderate",
    },
    {
      name: "Income Fund",
      value: "$8,230.15",
      change: -1.2,
      allocation: 30,
      risk: "Low",
    },
    {
      name: "Real Estate Trust",
      value: "$3,200.10",
      change: 2.8,
      allocation: 15,
      risk: "Moderate",
    },
    {
      name: "Crypto Fund",
      value: "$1,500.00",
      change: 15.3,
      allocation: 10,
      risk: "High",
    },
  ];

  return (
    <Box w="full" minH="100vh" pb={8}>
      <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={6}>
          <Heading size={{ base: "md", md: "lg" }}>Portfolio</Heading>

          {/* Portfolio Stats */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
            {portfolioStats.map((stat, index) => (
              <Card key={index}>
                <CardBody>
                  <Stat>
                    <StatLabel fontSize={{ base: "sm", md: "md" }}>{stat.label}</StatLabel>
                    <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{stat.value}</StatNumber>
                    {stat.change !== 0 && (
                      <StatHelpText>
                        <StatArrow type={stat.change > 0 ? "increase" : "decrease"} />
                        {Math.abs(stat.change)}%
                      </StatHelpText>
                    )}
                  </Stat>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Asset Allocation */}
          <Card>
            <CardHeader>
              <Heading size={{ base: "sm", md: "md" }}>Asset Allocation</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack spacing={4} align="stretch">
                  {assetAllocation.map((asset, index) => (
                    <Box key={index}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                          {asset.name}
                        </Text>
                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                          {asset.percentage}%
                        </Text>
                      </HStack>
                      <Progress
                        value={asset.percentage}
                        colorScheme="blue"
                        size="lg"
                        borderRadius="md"
                      />
                    </Box>
                  ))}
                </VStack>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <CircularProgress
                    value={100}
                    size={{ base: "150px", md: "200px" }}
                    thickness="8px"
                  >
                    <CircularProgressLabel fontSize={{ base: "md", md: "lg" }}>
                      Total Portfolio
                    </CircularProgressLabel>
                  </CircularProgress>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Investments List */}
          <Card>
            <CardHeader>
              <Heading size={{ base: "sm", md: "md" }}>Your Investments</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {investments.map((investment, index) => (
                  <Box
                    key={index}
                    p={4}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                          {investment.name}
                        </Text>
                        <Badge
                          colorScheme="blue"
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          {investment.risk}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                            Value
                          </Text>
                          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                            {investment.value}
                          </Text>
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                            Change
                          </Text>
                          <Text
                            fontSize={{ base: "lg", md: "xl" }}
                            fontWeight="bold"
                            color={investment.change >= 0 ? "green.500" : "red.500"}
                          >
                            {investment.change >= 0 ? "+" : ""}
                            {investment.change}%
                          </Text>
                        </VStack>
                      </HStack>
                      <Progress
                        value={investment.allocation}
                        size="sm"
                        colorScheme="blue"
                        bg="blue.50"
                        borderRadius="md"
                      />
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default Portfolio;
