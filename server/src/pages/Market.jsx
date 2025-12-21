import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { FaBitcoin, FaEthereum, FaChartLine, FaChartBar } from "react-icons/fa";

const Market = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const marketOverview = [
    { label: "Total Market Cap", value: "$2.4T", change: 5.2 },
    { label: "24h Volume", value: "$156.8B", change: 12.4 },
    { label: "BTC Dominance", value: "52.3%", change: -1.2 },
    { label: "Active Markets", value: "12,458", change: 3.5 },
  ];

  const cryptoAssets = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      price: "$43,250.50",
      change: 2.45,
      marketCap: "$847.2B",
      icon: FaBitcoin,
      color: "orange",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      price: "$2,580.30",
      change: -1.23,
      marketCap: "$310.5B",
      icon: FaEthereum,
      color: "blue",
    },
    {
      name: "Blupension Token",
      symbol: "BPT",
      price: "$1.25",
      change: 5.67,
      marketCap: "$125M",
      icon: FaChartLine,
      color: "purple",
    },
  ];

  return (
    <Box w="full" minH="100vh" pb={8}>
      <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={6}>
          <Heading size={{ base: "md", md: "lg" }}>Market Overview</Heading>

          {/* Market Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {marketOverview.map((stat, index) => (
              <Card key={index}>
                <CardBody>
                  <Stat>
                    <StatLabel fontSize={{ base: "xs", md: "sm" }}>{stat.label}</StatLabel>
                    <StatNumber fontSize={{ base: "md", md: "xl" }}>{stat.value}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={stat.change > 0 ? "increase" : "decrease"} />
                      {Math.abs(stat.change)}%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Featured Assets */}
          <Card>
            <CardHeader>
              <Heading size={{ base: "sm", md: "md" }}>Featured Assets</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {cryptoAssets.map((asset, index) => (
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
                        <HStack spacing={2}>
                          <Box
                            as={asset.icon}
                            boxSize={6}
                            color={`${asset.color}.500`}
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                              {asset.name}
                            </Text>
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                              {asset.symbol}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge colorScheme="blue" fontSize={{ base: "xs", md: "sm" }}>
                          {asset.change >= 0 ? "+" : ""}
                          {asset.change}%
                        </Badge>
                      </HStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                          {asset.price}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                          Market Cap: {asset.marketCap}
                        </Text>
                      </VStack>
                    </VStack>
      </Box>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Market Table */}
          <Card>
            <CardHeader>
              <Heading size={{ base: "sm", md: "md" }}>Asset Prices</Heading>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead>
                    <Tr>
                      <Th>Asset</Th>
                      <Th isNumeric>Price</Th>
                      <Th isNumeric>24h Change</Th>
                      <Th isNumeric>Market Cap</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {cryptoAssets.map((asset, index) => (
                      <Tr key={index}>
                        <Td>
                          <HStack spacing={2}>
                            <Box as={asset.icon} boxSize={5} color={`${asset.color}.500`} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                                {asset.name}
                              </Text>
                              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                                {asset.symbol}
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td isNumeric fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                          {asset.price}
                        </Td>
                        <Td isNumeric>
                          <Text
                            color="blue.500"
                            fontWeight="bold"
                            fontSize={{ base: "sm", md: "md" }}
                          >
                            {asset.change >= 0 ? "+" : ""}
                            {asset.change}%
                          </Text>
                        </Td>
                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                          {asset.marketCap}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>

          {/* Market Info */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Box as={FaChartBar} boxSize={6} color="blue.500" />
                  <Heading size={{ base: "sm", md: "md" }}>Market Information</Heading>
                </HStack>
                <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
                  Stay updated with real-time market data, price movements, and trading volumes.
                  Market data is updated every minute to provide you with the latest information
                  for informed investment decisions.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
    </Container>
    </Box>
  );
};

export default Market;
