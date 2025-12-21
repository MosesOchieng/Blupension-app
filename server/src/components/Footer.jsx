import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Badge,
  Link,
} from "@chakra-ui/react";
import {
  FaArrowUp,
  FaArrowDown,
  FaBitcoin,
  FaEthereum,
  FaDollarSign,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  // Sample transactions data
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
    {
      id: 4,
      type: "reward",
      amount: "$50",
      date: "2024-03-17",
      status: "completed",
      icon: FaDollarSign,
      color: "blue",
    },
  ];

  return (
    <Box as="footer" bg={bgColor} borderTop="1px" borderColor={borderColor} mt="auto" display={{ base: "none", md: "block" }}>
      <Container maxW="container.xl" py={{ base: 6, md: 8 }}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 6, md: 8 }}>
          {/* Company Info */}
          <VStack align="start" spacing={4}>
            <Box
              as={RouterLink}
              to="/"
              display="flex"
              alignItems="center"
              _hover={{ opacity: 0.8 }}
            >
              <Box
                as="img"
                src="/icons/blupension.png"
                alt="Blupension Logo"
                h={{ base: "32px", md: "40px" }}
                w="auto"
                objectFit="contain"
              />
            </Box>
            <Text fontSize="sm" color={textColor}>
              Addressing Africa's Pension Challenges with blockchain technology and innovative investment solutions.
            </Text>
            <HStack spacing={4}>
              <Link href="#" isExternal>
                <Icon as={FaTwitter} boxSize={5} color={textColor} _hover={{ color: "blue.500" }} />
              </Link>
              <Link href="#" isExternal>
                <Icon as={FaFacebook} boxSize={5} color={textColor} _hover={{ color: "blue.500" }} />
              </Link>
              <Link href="#" isExternal>
                <Icon as={FaInstagram} boxSize={5} color={textColor} _hover={{ color: "blue.500" }} />
              </Link>
              <Link href="#" isExternal>
                <Icon as={FaLinkedin} boxSize={5} color={textColor} _hover={{ color: "blue.500" }} />
              </Link>
            </HStack>
          </VStack>

          {/* Quick Links */}
          <VStack align="start" spacing={4}>
            <Heading size="sm">Quick Links</Heading>
            <VStack align="start" spacing={2}>
              <Link as={RouterLink} to="/portfolio" fontSize="sm" color={textColor} _hover={{ color: "blue.500" }}>
                Portfolio
              </Link>
              <Link as={RouterLink} to="/savings" fontSize="sm" color={textColor} _hover={{ color: "blue.500" }}>
                Savings
              </Link>
              <Link as={RouterLink} to="/investment-flow" fontSize="sm" color={textColor} _hover={{ color: "blue.500" }}>
                Investment Flow
              </Link>
              <Link as={RouterLink} to="/investments" fontSize="sm" color={textColor} _hover={{ color: "blue.500" }}>
                Investments
              </Link>
              <Link as={RouterLink} to="/market" fontSize="sm" color={textColor} _hover={{ color: "blue.500" }}>
                Market
              </Link>
            </VStack>
          </VStack>

          {/* Recent Transactions */}
          <VStack align="start" spacing={4}>
            <Heading size="sm">Recent Transactions</Heading>
            <VStack align="stretch" spacing={3} w="full">
              {recentTransactions.map((transaction) => (
                <HStack
                  key={transaction.id}
                  p={2}
                  bg={useColorModeValue("white", "gray.800")}
                  borderRadius="md"
                  justify="space-between"
                  flexDirection={{ base: "column", sm: "row" }}
                  align={{ base: "start", sm: "center" }}
                  spacing={2}
                >
                  <HStack spacing={2} flex={1}>
                    <Icon
                      as={transaction.icon}
                      color={`${transaction.color}.500`}
                      fontSize="sm"
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" textTransform="capitalize" fontSize="xs">
                        {transaction.type}
                      </Text>
                      <Text fontSize="2xs" color={textColor}>
                        {transaction.date}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="xs">{transaction.amount}</Text>
                    <Badge colorScheme={transaction.color} fontSize="2xs">
                      {transaction.status}
                    </Badge>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </VStack>

          {/* Contact Info */}
          <VStack align="start" spacing={4}>
            <Heading size="sm">Contact</Heading>
            <VStack align="start" spacing={2} fontSize="sm" color={textColor}>
              <Text>20 Wenlock Road N1 7GU</Text>
              <Text>London, United Kingdom</Text>
              <Text mt={2}>
                <Text as="span" fontWeight="bold">Phone:</Text> +1 5589 55488 55
              </Text>
              <Text>
                <Text as="span" fontWeight="bold">Email:</Text> info@blupension.com
              </Text>
            </VStack>
          </VStack>
        </SimpleGrid>

        <Divider my={6} />

        {/* Copyright */}
        <Box textAlign="center">
          <Text fontSize="sm" color={textColor}>
            © {new Date().getFullYear()} Blupension. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

