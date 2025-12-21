import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  HStack,
  VStack,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { FaCoins, FaLock, FaGift } from 'react-icons/fa';

const TokenManagement = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');

  // Sample data
  const tokenData = {
    balance: 1000,
    stakedAmount: 500,
    totalRewards: 50,
    apr: 12.5,
  };

  const handleStake = async () => {
    if (!stakeAmount || isNaN(stakeAmount) || parseFloat(stakeAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount to stake',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Tokens Staked',
        description: `Successfully staked ${stakeAmount} BLU tokens`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setStakeAmount('');
    } catch (error) {
      toast({
        title: 'Staking Failed',
        description: 'Failed to stake tokens. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={8}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg">Token Management</Heading>
          <Text mt={2} color="gray.600">
            Manage your Blupension (BLU) tokens and staking
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Icon as={FaCoins} boxSize={6} color="blue.500" />
                <Stat>
                  <StatLabel>Available Balance</StatLabel>
                  <StatNumber>{tokenData.balance} BLU</StatNumber>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Icon as={FaLock} boxSize={6} color="purple.500" />
                <Stat>
                  <StatLabel>Staked Amount</StatLabel>
                  <StatNumber>{tokenData.stakedAmount} BLU</StatNumber>
                  <StatHelpText>
                    {((tokenData.stakedAmount / (tokenData.balance + tokenData.stakedAmount)) * 100).toFixed(1)}% of total
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Icon as={FaGift} boxSize={6} color="green.500" />
                <Stat>
                  <StatLabel>Total Rewards</StatLabel>
                  <StatNumber>{tokenData.totalRewards} BLU</StatNumber>
                  <StatHelpText>
                    APR: {tokenData.apr}%
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FaLock} />
              <Heading size="md">Stake Tokens</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Amount to Stake</FormLabel>
                <Input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter BLU amount"
                />
              </FormControl>
              <Button
                colorScheme="blue"
                width="full"
                onClick={handleStake}
                isLoading={isLoading}
              >
                Stake Tokens
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
};

export default TokenManagement; 