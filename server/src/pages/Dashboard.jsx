import { Link as RouterLink } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import {
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import TransactionModal from "../components/TransactionModal";

const Dashboard = () => {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  // Rotating images
  const heroImages = [
    "/images/hero.jpg",
    "/images/portfolio.jpg",
    "/images/investement.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <Box w="full" minH="calc(100vh - 124px)" pb={{ base: 4, md: 8 }}>
      <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={6}>
          {/* Rotating Hero Images */}
      <Box
        position="relative"
            height={{ base: "180px", md: "250px" }}
        borderRadius="lg"
        overflow="hidden"
            mb={4}
          >
            {heroImages.map((img, index) => (
              <Box
                key={index}
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgImage={`url('${img}')`}
        bgSize="cover"
        bgPosition="center"
                opacity={index === currentImageIndex ? 1 : 0}
                transition="opacity 1s ease-in-out"
              />
            ))}
        <Box
          position="absolute"
          inset={0}
              bg="blackAlpha.400"
        />
        <Box
          position="relative"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          textAlign="center"
              px={4}
            >
              <Heading size={{ base: "md", md: "lg" }}>Welcome to Blupension</Heading>
            </Box>
          </Box>

          {/* Three Small Balance Cards */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
            <Card size="sm" variant="outline">
              <CardBody p={4}>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.500">Total Portfolio</StatLabel>
                  <StatNumber fontSize="lg" fontWeight="bold">$25,000</StatNumber>
                  <StatHelpText fontSize="xs" mb={0}>
                    <StatArrow type="increase" />
                    12.5%
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card size="sm" variant="outline">
              <CardBody p={4}>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.500">BPT Holdings</StatLabel>
                  <StatNumber fontSize="lg" fontWeight="bold">1,234.56 BPT</StatNumber>
                  <StatHelpText fontSize="xs" mb={0}>
                    <StatArrow type="increase" />
                    8.3%
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card size="sm" variant="outline">
              <CardBody p={4}>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.500">Monthly Returns</StatLabel>
                  <StatNumber fontSize="lg" fontWeight="bold" color="blue.500">+$1,250</StatNumber>
                  <StatHelpText fontSize="xs" mb={0}>
                    <StatArrow type="increase" />
                    5.2%
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Deposit and Withdraw Buttons */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
            <Button 
              leftIcon={<FaArrowUp />} 
              colorScheme="blue"
              bg="blue.500"
              _hover={{ bg: "blue.600" }}
              size="md"
              onClick={() => setIsDepositOpen(true)}
              w="full"
            >
              Deposit
            </Button>
            <Button
              leftIcon={<FaArrowDown />} 
              colorScheme="blue"
              variant="outline"
              borderColor="blue.500"
              color="blue.500"
              _hover={{ bg: "blue.50" }}
              size="md"
              onClick={() => setIsWithdrawOpen(true)}
              w="full"
            >
              Withdraw
            </Button>
          </SimpleGrid>
          </VStack>
      </Container>
      
      <TransactionModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        type="deposit"
      />
      <TransactionModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        type="withdraw"
      />
      </Box>
  );
};

export default Dashboard;
