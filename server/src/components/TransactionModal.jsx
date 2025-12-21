import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useColorModeValue,
  HStack,
  Icon,
  SimpleGrid,
  Box,
} from "@chakra-ui/react";
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaCreditCard,
  FaUniversity, 
  FaMobileAlt,
  FaEthereum,
  FaWallet,
} from "react-icons/fa";

const TransactionModal = ({ isOpen, onClose, type }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);

  // All hooks must be called at the top level
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "blue.900");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const isDeposit = type === "deposit";

  const paymentMethods = [
    { value: "card", label: "Credit/Debit Card", icon: FaCreditCard, color: "blue" },
    { value: "bank", label: "Bank Transfer", icon: FaUniversity, color: "green" },
    { value: "mobile", label: "Mobile Money", icon: FaMobileAlt, color: "purple" },
    { value: "crypto", label: "Crypto Wallet", icon: FaEthereum, color: "orange" },
  ];

  const handleSubmit = async () => {
    if (!amount || !method) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert(`${isDeposit ? "Deposit" : "Withdrawal"} of $${amount} via ${method} submitted successfully!`);
      setAmount("");
      setMethod("");
      onClose();
    }, 1000);
  };

  const selectedMethod = paymentMethods.find((pm) => pm.value === method);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent bg={bgColor} borderRadius="xl" maxW="400px">
        <ModalHeader fontSize="lg" fontWeight="bold" pb={2}>
          {isDeposit ? "Deposit Funds" : "Withdraw Funds"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" mb={2}>Amount (USD)</FormLabel>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                size="md"
                fontSize="lg"
                fontWeight="semibold"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" mb={2}>Payment Method</FormLabel>
              <SimpleGrid columns={2} spacing={3}>
                {paymentMethods.map((pm) => (
                  <Box
                    key={pm.value}
                    as="button"
                    type="button"
                    p={4}
                    borderWidth="2px"
                    borderColor={method === pm.value ? "blue.500" : borderColor}
                    borderRadius="lg"
                    bg={method === pm.value ? hoverBg : "transparent"}
                    _hover={{ borderColor: "blue.400", bg: hoverBg }}
                    onClick={() => setMethod(pm.value)}
                    transition="all 0.2s"
                    cursor="pointer"
                  >
                    <VStack spacing={2}>
                      <Icon
                        as={pm.icon}
                        boxSize={6}
                        color={method === pm.value ? "blue.500" : `${pm.color}.500`}
                      />
                      <Text fontSize="xs" fontWeight="medium" textAlign="center">
                        {pm.label}
                      </Text>
                </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </FormControl>

            {method && amount && (
              <Box
                p={3}
                bg={hoverBg}
                borderRadius="md"
                w="full"
                borderWidth="1px"
                borderColor="blue.200"
              >
                <HStack spacing={2}>
                  <Icon
                    as={selectedMethod?.icon}
                    boxSize={5}
                    color="blue.500"
                  />
                  <Text fontSize="xs" color={textColor}>
                    {isDeposit
                      ? `Deposit $${amount} via ${selectedMethod?.label}`
                      : `Withdraw $${amount} to ${selectedMethod?.label}`}
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter pt={2}>
          <Button 
            variant="ghost" 
            mr={3} 
            onClick={onClose}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            bg="blue.500"
            _hover={{ bg: "blue.600" }}
            onClick={handleSubmit}
            isLoading={loading}
            leftIcon={isDeposit ? <FaArrowUp /> : <FaArrowDown />}
            size="sm"
            isDisabled={!amount || !method}
          >
            {isDeposit ? "Deposit" : "Withdraw"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransactionModal;
