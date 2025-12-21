import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Button,
  useColorModeValue,
  Divider,
  Avatar,
  Badge,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react";
import {
  FaHome,
  FaWallet,
  FaChartBar,
  FaHistory,
  FaCog,
  FaQuestionCircle,
  FaBars,
} from "react-icons/fa";
import { Link as RouterLink, useLocation } from "react-router-dom";

const SidebarContent = ({ onClose }) => {
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const activeBgColor = useColorModeValue("blue.50", "blue.900");
  const activeTextColor = useColorModeValue("blue.600", "blue.200");

  const menuItems = [
    { icon: FaHome, label: "Dashboard", path: "/" },
    { icon: FaWallet, label: "Portfolio", path: "/portfolio" },
    { icon: FaChartBar, label: "Investments", path: "/investments" },
    { icon: FaHistory, label: "Transactions", path: "/transactions" },
    { icon: FaCog, label: "Settings", path: "/settings" },
    { icon: FaQuestionCircle, label: "Help & Support", path: "/help" },
  ];

  return (
    <VStack spacing={8} align="stretch" h="full">
      {/* Logo */}
      <Box px={4}>
        <Box
          as={RouterLink}
          to="/"
          display="flex"
          alignItems="center"
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
      </Box>

      {/* User Info */}
      <Box px={4}>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          John Doe
        </Text>
        <HStack spacing={4} mb={4} flexDirection={{ base: "column", md: "row" }}>
          <Box flex={1} w={{ base: "full", md: "auto" }}>
            <Text fontSize="sm" color="gray.500">
              BPT Balance
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              1,234.56 BPT
            </Text>
          </Box>
          <Box flex={1} w={{ base: "full", md: "auto" }}>
            <Text fontSize="sm" color="gray.500">
              Loan Balance
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              $5,000
            </Text>
          </Box>
        </HStack>
        <HStack spacing={2} flexDirection={{ base: "column", md: "row" }}>
          <Button size="sm" colorScheme="blue" flex={1} w={{ base: "full", md: "auto" }}>
            Deposit
          </Button>
          <Button size="sm" colorScheme="red" flex={1} w={{ base: "full", md: "auto" }}>
            Withdraw
          </Button>
        </HStack>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <VStack spacing={2} align="stretch" flex={1}>
        {menuItems.map((item) => (
          <Button
            key={item.path}
            as={RouterLink}
            to={item.path}
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<Icon as={item.icon} />}
            bg={
              location.pathname === item.path ? activeBgColor : "transparent"
            }
            color={
              location.pathname === item.path ? activeTextColor : textColor
            }
            _hover={{
              bg:
                location.pathname === item.path ? activeBgColor : "gray.100",
            }}
            onClick={onClose}
          >
            {item.label}
          </Button>
        ))}
      </VStack>
    </VStack>
  );
};

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <>
      {/* Mobile Menu Button */}
      <IconButton
        aria-label="Open menu"
        icon={<FaBars />}
        onClick={onOpen}
        display={{ base: "flex", md: "none" }}
        position="fixed"
        top={4}
        left={4}
        zIndex={1000}
        colorScheme="blue"
      />

      {/* Desktop Sidebar */}
      <Box
        as="nav"
        position="fixed"
        top="0"
        left="0"
        h="100vh"
        w={{ base: "0", md: "250px" }}
        bg={bgColor}
        borderRight="1px"
        borderColor={borderColor}
        py={4}
        px={4}
        display={{ base: "none", md: "block" }}
        overflowY="auto"
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Blupension</DrawerHeader>
          <DrawerBody p={0}>
            <Box
              bg={bgColor}
              h="full"
              py={4}
              px={4}
            >
              <SidebarContent onClose={onClose} />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
