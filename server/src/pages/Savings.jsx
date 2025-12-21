import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Input,
  useToast,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaArrowUp, FaArrowDown, FaExchangeAlt } from "react-icons/fa";

const Savings = () => {
  const [balance, setBalance] = useState({ savingsBalance: 0, investmentBalance: 0, portfolioValue: 0, totalValue: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/savings/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/savings/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setHistory(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/savings/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Deposit successful",
          description: `$${amount} has been deposited to your savings account`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setAmount("");
        onClose();
        fetchBalance();
        fetchHistory();
      } else {
        toast({
          title: "Deposit failed",
          description: data.message || "An error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while processing your deposit",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (parseFloat(amount) > balance.savingsBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds in your savings account",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/savings/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Withdrawal successful",
          description: `$${amount} has been withdrawn from your savings account`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setAmount("");
        onClose();
        fetchBalance();
        fetchHistory();
      } else {
        toast({
          title: "Withdrawal failed",
          description: data.message || "An error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while processing your withdrawal",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (actionType) => {
    setAction(actionType);
    onOpen();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Savings Account
          </Heading>
          <Text color="gray.600">Manage your savings and transfer to investments</Text>
        </Box>

        {/* Balance Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Savings Balance</StatLabel>
                <StatNumber fontSize="2xl">{formatCurrency(balance.savingsBalance)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Investment Balance</StatLabel>
                <StatNumber fontSize="2xl">{formatCurrency(balance.investmentBalance)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Portfolio Value</StatLabel>
                <StatNumber fontSize="2xl">{formatCurrency(balance.portfolioValue)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Action Buttons */}
        <HStack spacing={4} justify="center">
          <Button
            leftIcon={<FaArrowUp />}
            colorScheme="blue"
            onClick={() => openModal("deposit")}
            size="lg"
          >
            Deposit
          </Button>
          <Button
            leftIcon={<FaArrowDown />}
            colorScheme="red"
            onClick={() => openModal("withdraw")}
            size="lg"
          >
            Withdraw
          </Button>
          <Button
            leftIcon={<FaExchangeAlt />}
            colorScheme="green"
            onClick={() => window.location.href = "/investment-flow"}
            size="lg"
          >
            Transfer to Investment
          </Button>
        </HStack>

        {/* Transaction History */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>
              Transaction History
            </Heading>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Description</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {history.length === 0 ? (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={8}>
                        <Text color="gray.500">No transactions yet</Text>
                      </Td>
                    </Tr>
                  ) : (
                    history.map((transaction) => (
                      <Tr key={transaction.id}>
                        <Td>{formatDate(transaction.completedAt)}</Td>
                        <Td>
                          <Text
                            textTransform="capitalize"
                            fontWeight={
                              transaction.type === "deposit" ? "semibold" : "normal"
                            }
                            color={
                              transaction.type === "deposit"
                                ? "green.500"
                                : transaction.type === "withdraw"
                                ? "red.500"
                                : "blue.500"
                            }
                          >
                            {transaction.type}
                          </Text>
                        </Td>
                        <Td>{formatCurrency(transaction.amount)}</Td>
                        <Td>
                          <Text
                            textTransform="capitalize"
                            color={
                              transaction.status === "completed"
                                ? "green.500"
                                : transaction.status === "failed"
                                ? "red.500"
                                : "yellow.500"
                            }
                          >
                            {transaction.status}
                          </Text>
                        </Td>
                        <Td>{transaction.description || "N/A"}</Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Deposit/Withdraw Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {action === "deposit" ? "Deposit to Savings" : "Withdraw from Savings"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Box w="full">
                  <Text mb={2}>Amount (USD)</Text>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    size="lg"
                  />
                </Box>
                {action === "withdraw" && (
                  <Text fontSize="sm" color="gray.600">
                    Available balance: {formatCurrency(balance.savingsBalance)}
                  </Text>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={action === "deposit" ? "blue" : "red"}
                onClick={action === "deposit" ? handleDeposit : handleWithdraw}
                isLoading={loading}
              >
                {action === "deposit" ? "Deposit" : "Withdraw"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default Savings;

