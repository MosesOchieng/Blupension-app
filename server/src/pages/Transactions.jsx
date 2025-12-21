import React, { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  VStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  useColorModeValue,
  TableContainer,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaDownload,
  FaUpload,
  FaArrowUp,
  FaArrowDown,
  FaCoins,
  FaDollarSign,
} from "react-icons/fa";

const Transactions = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sample transactions data
  const transactions = [
    {
      id: 1,
      date: "2024-03-15",
      type: "Deposit",
      amount: "1,000.00",
      status: "Completed",
      method: "Bank Transfer",
      icon: FaArrowUp,
      color: "green",
    },
    {
      id: 2,
      date: "2024-03-14",
      type: "Withdrawal",
      amount: "500.00",
      status: "Pending",
      method: "Mobile Money",
      icon: FaArrowDown,
      color: "red",
    },
    {
      id: 3,
      date: "2024-03-13",
      type: "Investment",
      amount: "2,500.00",
      status: "Completed",
      method: "MetaMask",
      icon: FaCoins,
      color: "blue",
    },
    {
      id: 4,
      date: "2024-03-12",
      type: "Payment",
      amount: "50.00",
      status: "Completed",
      method: "System",
      icon: FaDollarSign,
      color: "purple",
    },
    {
      id: 5,
      date: "2024-03-11",
      type: "Deposit",
      amount: "2,000.00",
      status: "Completed",
      method: "Bank Transfer",
      icon: FaArrowUp,
      color: "green",
    },
    {
      id: 6,
      date: "2024-03-10",
      type: "Withdrawal",
      amount: "300.00",
      status: "Completed",
      method: "Mobile Money",
      icon: FaArrowDown,
      color: "red",
    },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === "all" || tx.type.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const transactionSummary = {
    total: transactions.length,
    deposits: transactions.filter((t) => t.type === "Deposit").length,
    withdrawals: transactions.filter((t) => t.type === "Withdrawal").length,
    investments: transactions.filter((t) => t.type === "Investment").length,
  };

  return (
    <Box w="full" minH="100vh" pb={8}>
      <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={6}>
          <Heading size={{ base: "md", md: "lg" }}>Transactions</Heading>

          {/* Transaction Summary */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <VStack align="start" spacing={1}>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    Total Transactions
                  </Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                    {transactionSummary.total}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <VStack align="start" spacing={1}>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    Deposits
                  </Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="blue.500">
                    {transactionSummary.deposits}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <VStack align="start" spacing={1}>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    Withdrawals
                  </Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="blue.500">
                    {transactionSummary.withdrawals}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <VStack align="start" spacing={1}>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    Investments
                  </Text>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="blue.500">
                    {transactionSummary.investments}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters and Search */}
          <Card>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter by type"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="investment">Investments</option>
                  <option value="payment">Payments</option>
                </Select>
                <HStack spacing={2}>
                  <Button 
                    leftIcon={<FaDownload />} 
                    colorScheme="blue"
                    bg="blue.500"
                    _hover={{ bg: "blue.600" }}
                    size={{ base: "sm", md: "md" }} 
                    flex={1}
                  >
                    Export
                  </Button>
                  <Button 
                    leftIcon={<FaUpload />} 
                    colorScheme="blue"
                    variant="outline"
                    borderColor="blue.500"
                    color="blue.500"
                    _hover={{ bg: "blue.50" }}
                    size={{ base: "sm", md: "md" }} 
                    flex={1}
                  >
                    Import
                  </Button>
                </HStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Transactions List - Mobile View */}
          <Box display={{ base: "block", md: "none" }}>
            <VStack spacing={4} align="stretch">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardBody>
                    <HStack justify="space-between" mb={3}>
                      <HStack spacing={3}>
                        <Icon
                          as={transaction.icon}
                          color={`${transaction.color}.500`}
                          boxSize={5}
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                            {transaction.type}
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                            {transaction.date}
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={0}>
                        <Text
                          fontWeight="bold"
                          fontSize={{ base: "sm", md: "md" }}
                          color="blue.500"
                        >
                          {transaction.type === "Deposit" || transaction.type === "Investment"
                            ? "+"
                            : "-"}
                          ${transaction.amount}
                        </Text>
                        <Badge colorScheme={transaction.color} fontSize={{ base: "xs", md: "sm" }}>
                          {transaction.status}
                        </Badge>
                      </VStack>
                    </HStack>
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                      Method: {transaction.method}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </Box>

          {/* Transactions Table - Desktop View */}
          <Card display={{ base: "none", md: "block" }}>
            <CardHeader>
              <Heading size="sm">Transaction History</Heading>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Type</Th>
                      <Th>Method</Th>
                      <Th isNumeric>Amount</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredTransactions.map((transaction) => (
                      <Tr key={transaction.id}>
                        <Td>{transaction.date}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon
                              as={transaction.icon}
                              color={`${transaction.color}.500`}
                            />
                            <Text>{transaction.type}</Text>
                          </HStack>
                        </Td>
                        <Td>{transaction.method}</Td>
                        <Td isNumeric>
                          <Text
                            fontWeight="bold"
                            color="blue.500"
                          >
                            {transaction.type === "Deposit" || transaction.type === "Investment"
                              ? "+"
                              : "-"}
                            ${transaction.amount}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={transaction.color}>{transaction.status}</Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default Transactions;
