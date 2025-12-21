import React from "react";
import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Button,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import {
  FaArrowUp,
  FaArrowDown,
  FaBitcoin,
  FaEthereum,
  FaDollarSign,
  FaChartLine,
  FaWallet,
  FaPiggyBank,
} from "react-icons/fa";

const Dashboard = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const recentTransactions = [
    {
      id: 1,
      type: "deposit",
      amount: "$1,000",
      date: "2024-03-20",
      status: "completed",
      icon: FaArrowUp,
      color: "green",
    },
    {
      id: 2,
      type: "withdrawal",
      amount: "$500",
      date: "2024-03-19",
      status: "completed",
      icon: FaArrowDown,
      color: "red",
    },
    {
      id: 3,
      type: "investment",
      amount: "0.5 BTC",
      date: "2024-03-18",
      status: "completed",
      icon: FaBitcoin,
      color: "orange",
    },
  ];

  const investmentPlans = [
    {
      name: "Aggressive",
      description: "Higher allocation to high-growth assets",
      allocation: {
        btc: "60%",
        stablecoins: "20%",
        other: "20%",
      },
      risk: "High",
      color: "red",
    },
    {
      name: "Moderate",
      description: "Balanced allocation between assets",
      allocation: {
        btc: "40%",
        stablecoins: "40%",
        other: "20%",
      },
      risk: "Medium",
      color: "yellow",
    },
    {
      name: "Conservative",
      description: "Focus on capital preservation",
      allocation: {
        btc: "20%",
        stablecoins: "60%",
        other: "20%",
      },
      risk: "Low",
      color: "green",
    },
  ];

  return (
    <Box ml={{ base: 0, md: "250px" }} p={{ base: 4, md: 8 }} pt={{ base: 16, md: 8 }}>
      {/* Header Section */}
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" flexDirection={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }} spacing={4}>
          <Heading size={{ base: "md", md: "lg" }}>Dashboard</Heading>
          <HStack spacing={2} w={{ base: "full", md: "auto" }}>
            <Button leftIcon={<FaArrowUp />} colorScheme="green" size={{ base: "sm", md: "md" }} flex={{ base: 1, md: "none" }}>
              Deposit
            </Button>
            <Button leftIcon={<FaArrowDown />} colorScheme="red" size={{ base: "sm", md: "md" }} flex={{ base: 1, md: "none" }}>
              Withdraw
            </Button>
          </HStack>
        </HStack>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Portfolio Value</StatLabel>
                <StatNumber>$25,000</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12.5%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>BPT Holdings</StatLabel>
                <StatNumber>1,234.56 BPT</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  8.3%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Monthly Returns</StatLabel>
                <StatNumber>+$1,250</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  5.2%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Investment Plans */}
        <Card>
          <CardHeader>
            <Heading size="md">Investment Plans</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {investmentPlans.map((plan) => (
                <Card key={plan.name} variant="outline">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Heading size="sm">{plan.name}</Heading>
                        <Badge colorScheme={plan.color}>{plan.risk} Risk</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {plan.description}
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="bold">
                            BTC:
                          </Text>{" "}
                          {plan.allocation.btc}
                        </Text>
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="bold">
                            Stablecoins:
                          </Text>{" "}
                          {plan.allocation.stablecoins}
                        </Text>
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="bold">
                            Other:
                          </Text>{" "}
                          {plan.allocation.other}
                        </Text>
                      </VStack>
                      <Button colorScheme="blue" size="sm">
                        Select Plan
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <Heading size="md">Recent Transactions</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {recentTransactions.map((transaction) => (
                <HStack
                  key={transaction.id}
                  p={{ base: 3, md: 4 }}
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderRadius="lg"
                  justify="space-between"
                  flexDirection={{ base: "column", sm: "row" }}
                  align={{ base: "stretch", sm: "center" }}
                  spacing={{ base: 2, sm: 4 }}
                >
                  <HStack flex={1}>
                    <Icon
                      as={transaction.icon}
                      color={`${transaction.color}.500`}
                      fontSize={{ base: "md", md: "lg" }}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" textTransform="capitalize" fontSize={{ base: "sm", md: "md" }}>
                        {transaction.type}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {transaction.date}
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack align={{ base: "start", sm: "end" }} spacing={0}>
                    <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>{transaction.amount}</Text>
                    <Badge colorScheme={transaction.color} fontSize={{ base: "xs", md: "sm" }}>
                      {transaction.status}
                    </Badge>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Dashboard;
