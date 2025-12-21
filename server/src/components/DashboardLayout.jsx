import React from "react";
import { Outlet, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Flex,
  VStack,
  Icon,
  Text,
  Link,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaChartPie,
  FaGlobe,
  FaExchangeAlt,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";

const NavItem = ({ icon, children, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const activeColor = useColorModeValue("blue.600", "blue.200");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : "transparent"}
        color={isActive ? activeColor : "inherit"}
        _hover={{
          bg: isActive ? activeBg : hoverBg,
        }}
      >
        {icon && <Icon mr="4" fontSize="16" as={icon} />}
        {children}
      </Flex>
    </Link>
  );
};

const Sidebar = () => {
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      borderRight="1px"
      borderRightColor={borderColor}
    >
      <VStack h="full" spacing={0} align="stretch">
        <Box p="5">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Blupension
          </Text>
        </Box>
        <Divider />
        <VStack spacing={1} align="stretch" flex={1}>
          <NavItem icon={FaChartPie} to="/dashboard">
            Portfolio
          </NavItem>
          <NavItem icon={FaGlobe} to="/dashboard/market">
            Market
          </NavItem>
          <NavItem icon={FaExchangeAlt} to="/dashboard/transactions">
            Transactions
          </NavItem>
          <NavItem icon={FaCog} to="/dashboard/settings">
            Settings
          </NavItem>
          <NavItem icon={FaQuestionCircle} to="/dashboard/help">
            Help & Support
          </NavItem>
        </VStack>
      </VStack>
    </Box>
  );
};

const DashboardLayout = () => {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box ml={{ base: 0, md: 60 }} p="4" w="full">
        <Outlet />
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
