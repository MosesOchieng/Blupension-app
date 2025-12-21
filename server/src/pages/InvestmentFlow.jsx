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
  Progress,
  CircularProgress,
  CircularProgressLabel,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FaArrowRight, FaChartLine, FaPiggyBank, FaCoins } from "react-icons/fa";

const InvestmentFlow = () => {
  const [flowData, setFlowData] = useState(null);
  const [growthHistory, setGrowthHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [allocation, setAllocation] = useState({
    conservative: 0.4,
    moderate: 0.4,
    aggressive: 0.2,
  });
  const [selectedPlan, setSelectedPlan] = useState("moderate");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const COLORS = ["#3182CE", "#38A169", "#D69E2E", "#E53E3E"];

  useEffect(() => {
    fetchFlowData();
    fetchGrowthHistory();
  }, []);

  const fetchFlowData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/investment/flow", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setFlowData(data);
      }
    } catch (error) {
      console.error("Error fetching flow data:", error);
    }
  };

  const fetchGrowthHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/investment/growth-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setGrowthHistory(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching growth history:", error);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (parseFloat(transferAmount) > (flowData?.savings?.balance || 0)) {
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
      const response = await fetch("/api/savings/transfer-to-investment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(transferAmount),
          allocation: {
            [selectedPlan]: 1.0,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Transfer successful",
          description: `$${transferAmount} has been transferred to your investment portfolio`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTransferAmount("");
        onClose();
        fetchFlowData();
        fetchGrowthHistory();
      } else {
        toast({
          title: "Transfer failed",
          description: data.message || "An error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while processing your transfer",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value || 0);
  };

  const chartData = growthHistory.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: parseFloat(item.value),
    growth: parseFloat(item.growth),
  }));

  const pieData = flowData?.allocation?.map((item, index) => ({
    name: item.name,
    value: parseFloat(item.amount),
    color: COLORS[index % COLORS.length],
  })) || [];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Investment Flow
          </Heading>
          <Text color="gray.600">
            Track your money from savings to investment allocation and growth
          </Text>
        </Box>

        {/* Flow Visualization */}
        {flowData && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {/* Savings Stage */}
            <Card bg={bgColor} borderWidth="2px" borderColor="blue.300" position="relative">
              <CardBody>
                <VStack spacing={4}>
                  <Box
                    position="absolute"
                    top={-4}
                    left={4}
                    bg="blue.500"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    Step 1
                  </Box>
                  <FaPiggyBank size={40} color="#3182CE" />
                  <Stat textAlign="center">
                    <StatLabel fontSize="md">Savings Account</StatLabel>
                    <StatNumber fontSize="2xl" color="blue.500">
                      {formatCurrency(flowData.savings.balance)}
                    </StatNumber>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>

            {/* Arrow */}
            <Box display="flex" alignItems="center" justifyContent="center">
              <FaArrowRight size={40} color="#3182CE" />
            </Box>

            {/* Investment Allocation Stage */}
            <Card bg={bgColor} borderWidth="2px" borderColor="green.300" position="relative">
              <CardBody>
                <VStack spacing={4}>
                  <Box
                    position="absolute"
                    top={-4}
                    left={4}
                    bg="green.500"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    Step 2
                  </Box>
                  <FaCoins size={40} color="#38A169" />
                  <Stat textAlign="center">
                    <StatLabel fontSize="md">Investment Allocation</StatLabel>
                    <StatNumber fontSize="2xl" color="green.500">
                      {formatCurrency(flowData.portfolio.value)}
                    </StatNumber>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Allocation Breakdown */}
        {flowData && flowData.allocation && flowData.allocation.length > 0 && (
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Heading size="md" mb={4}>
                Investment Allocation Breakdown
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Pie Chart */}
                <Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                {/* Allocation List */}
                <VStack spacing={4} align="stretch">
                  {flowData.allocation.map((item, index) => (
                    <Box key={index} p={4} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between" mb={2}>
                        <HStack>
                          <Text fontSize="2xl">{item.icon}</Text>
                          <Text fontWeight="semibold">{item.name}</Text>
                        </HStack>
                        <Text fontWeight="bold" color="blue.500">
                          {item.percentage.toFixed(1)}%
                        </Text>
                      </HStack>
                      <Progress
                        value={item.percentage}
                        colorScheme="blue"
                        size="sm"
                        borderRadius="md"
                      />
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Growth Visualization */}
        {growthHistory.length > 0 && (
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Heading size="md" mb={4}>
                Portfolio Growth Over Time
              </Heading>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3182CE" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3182CE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelStyle={{ color: "#000" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3182CE"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}

        {/* Growth Stats */}
        {flowData && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Portfolio Value</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">
                    {formatCurrency(flowData.portfolio.value)}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Growth Amount</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">
                    {formatCurrency(flowData.portfolio.growth)}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Value</StatLabel>
                  <StatNumber fontSize="2xl" color="purple.500">
                    {formatCurrency(flowData.totalValue)}
                  </StatNumber>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Savings + Portfolio
                  </Text>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Transfer Button */}
        <Box textAlign="center">
          <Button
            leftIcon={<FaArrowRight />}
            colorScheme="blue"
            size="lg"
            onClick={onOpen}
          >
            Transfer from Savings to Investment
          </Button>
        </Box>

        {/* Transfer Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transfer to Investment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Box w="full">
                  <Text mb={2}>Amount (USD)</Text>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    size="lg"
                  />
                </Box>
                <Box w="full">
                  <Text mb={2}>Investment Plan</Text>
                  <Select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    size="lg"
                  >
                    <option value="conservative">Conservative (5% annual return)</option>
                    <option value="moderate">Moderate (8% annual return)</option>
                    <option value="aggressive">Aggressive (12% annual return)</option>
                  </Select>
                </Box>
                {flowData && (
                  <Text fontSize="sm" color="gray.600">
                    Available in savings: {formatCurrency(flowData.savings.balance)}
                  </Text>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleTransfer}
                isLoading={loading}
              >
                Transfer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default InvestmentFlow;

