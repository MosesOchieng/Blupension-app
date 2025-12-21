import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaHome,
  FaBriefcase,
  FaChartLine,
  FaHistory,
  FaCog,
} from "react-icons/fa";

const MobileFooter = () => {
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeColor = useColorModeValue("blue.500", "blue.300");
  const inactiveColor = useColorModeValue("gray.500", "gray.400");

  const navItems = [
    { path: "/", icon: FaHome, label: "Home" },
    { path: "/portfolio", icon: FaBriefcase, label: "Portfolio" },
    { path: "/market", icon: FaChartLine, label: "Market" },
    { path: "/transactions", icon: FaHistory, label: "Transactions" },
    { path: "/settings", icon: FaCog, label: "Settings" },
  ];

  return (
    <Box
      as="nav"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      zIndex={1000}
      display={{ base: "block", md: "none" }}
      boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
    >
      <Flex
        justify="space-around"
        align="center"
        h="60px"
        px={2}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Box
              key={item.path}
              as={RouterLink}
              to={item.path}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              flex={1}
              py={2}
              px={1}
              _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
              transition="all 0.2s"
            >
              <Icon
                as={item.icon}
                boxSize={6}
                color={isActive ? activeColor : inactiveColor}
                mb={1}
              />
              <Text
                fontSize="2xs"
                color={isActive ? activeColor : inactiveColor}
                fontWeight={isActive ? "semibold" : "normal"}
              >
                {item.label}
              </Text>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default MobileFooter;

