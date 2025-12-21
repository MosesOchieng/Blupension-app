import React, { useState } from "react";
import {
  Box,
  Flex,
  Button,
  IconButton,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  FaEthereum,
  FaHistory,
  FaChartLine,
  FaUniversity,
  FaWallet,
  FaMobileAlt,
  FaUserCircle,
  FaBriefcase,
} from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [connectedType, setConnectedType] = useState(null);

  const connectMetaMask = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setConnectedAccount(accounts[0]);
        setConnectedType("metamask");
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const connectBank = () => {
    // Implement bank connection logic
    setConnectedType("bank");
  };

  const connectMobileMoney = () => {
    // Implement mobile money connection logic
    setConnectedType("mobile");
  };

  return (
    <Box 
      bg={useColorModeValue("white", "gray.800")} 
      px={4} 
      shadow="sm"
      position={{ base: "fixed", md: "relative" }}
      top={0}
      left={0}
      right={0}
      zIndex={999}
      w="full"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        {/* Logo */}
        <Flex alignItems="center" as={RouterLink} to="/" _hover={{ opacity: 0.8 }}>
          <Box
            as="img"
            src="/icons/blupension.png"
            alt="Blupension Logo"
            h={{ base: "32px", md: "40px" }}
            w="auto"
            objectFit="contain"
          />
        </Flex>

        {/* Center Navigation - Hidden on mobile, shown on desktop */}
        <HStack spacing={{ base: 2, md: 8 }} display={{ base: "none", lg: "flex" }}>
          <Button
            as={RouterLink}
            to="/portfolio"
            variant="ghost"
            leftIcon={<FaBriefcase />}
            size={{ base: "sm", md: "md" }}
            colorScheme="blue"
          >
            <Box as="span" display={{ base: "none", xl: "inline" }}>Portfolio</Box>
          </Button>
          <Button
            as={RouterLink}
            to="/transactions"
            variant="ghost"
            leftIcon={<FaHistory />}
            size={{ base: "sm", md: "md" }}
            colorScheme="blue"
          >
            <Box as="span" display={{ base: "none", xl: "inline" }}>Transactions</Box>
          </Button>
          <Button
            as={RouterLink}
            to="/market"
            variant="ghost"
            leftIcon={<FaChartLine />}
            size={{ base: "sm", md: "md" }}
            colorScheme="blue"
          >
            <Box as="span" display={{ base: "none", xl: "inline" }}>Market</Box>
          </Button>
        </HStack>

        {/* Right Side Actions */}
        <Flex alignItems="center" gap={{ base: 2, md: 4 }}>
          {/* Connect Account Button */}
          <Menu
            isOpen={isConnectOpen}
            onOpen={() => setIsConnectOpen(true)}
            onClose={() => setIsConnectOpen(false)}
          >
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              colorScheme="blue"
              bg={connectedAccount ? "transparent" : "blue.500"}
              borderColor="blue.500"
              variant={connectedAccount ? "outline" : "solid"}
              _hover={{ bg: connectedAccount ? "blue.50" : "blue.600" }}
              size={{ base: "sm", md: "md" }}
            >
              {connectedAccount ? (
                <HStack>
                  <FaEthereum />
                  <Text display={{ base: "none", md: "block" }}>
                    {`${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`}
                  </Text>
                </HStack>
              ) : (
                <Box as="span" display={{ base: "none", md: "inline" }}>Connect Account</Box>
              )}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={connectMetaMask}>
                <HStack>
                  <FaEthereum />
                  <Text>MetaMask</Text>
                </HStack>
              </MenuItem>
              <MenuItem onClick={connectBank}>
                <HStack>
                  <FaUniversity />
                  <Text>Bank Account</Text>
                </HStack>
              </MenuItem>
              <MenuItem onClick={connectMobileMoney}>
                <HStack>
                  <FaMobileAlt />
                  <Text>Mobile Money</Text>
                </HStack>
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Dark Mode Toggle */}
          <IconButton
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />

          {/* User Profile */}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaUserCircle size="24px" />}
              variant="ghost"
            />
            <MenuList>
              <MenuItem>Profile Settings</MenuItem>
              <MenuItem>Security</MenuItem>
              <MenuItem>Notifications</MenuItem>
              <MenuItem>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
