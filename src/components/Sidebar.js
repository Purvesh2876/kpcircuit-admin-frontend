import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  Tooltip,
  Avatar,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  MdSpaceDashboard,
  MdListAlt,
  MdLayers,
  MdInventory2,
  MdGroup,
  MdAssignmentReturn,
  MdApps,
  MdUnfoldMore,
} from "react-icons/md";
import { logout } from "../actions/apiActions";
import { useNavigate } from "react-router-dom";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: MdSpaceDashboard, section: "General" },
  { name: "Categories", path: "/category", icon: MdListAlt, section: "General" },
  { name: "Sub Categories", path: "/subcategory", icon: MdLayers, section: "General" },
  { name: "Products", path: "/products", icon: MdInventory2, section: "General" },
  { name: "Orders", path: "/orders", icon: MdListAlt, section: "General" },
  { name: "Return Requests", path: "/returns", icon: MdAssignmentReturn, section: "General" },
  { name: "Users", path: "/users", icon: MdGroup, section: "General" },
];

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.clear();
    await logout();
    window.location.href = "/";
  };

  const adminName = localStorage.getItem("adminName") || "Admin";
  const adminEmail = localStorage.getItem("adminEmail") || "admin@example.com";

  return (
    <Box
      w={isCollapsed ? "80px" : "260px"}
      bg="white"
      color="black"
      h="100vh"
      transition="width 0.3s ease"
      display="flex"
      flexDirection="column"
      borderRight="1px solid"
      borderColor="gray.200"
      position="relative"
      m={1}
      borderRadius={10}
    >
      {/* HEADER LOGO */}
      <Flex
        h="55px"
        align="center"
        justify={isCollapsed ? "center" : "flex-start"}
        px={isCollapsed ? 0 : 6}
        mt={2}
      >
        <Flex
          bg="black"
          color="white"
          w="32px"
          h="32px"
          borderRadius="md"
          align="center"
          justify="center"
          cursor="pointer"
          onClick={onToggle}
        >
          <Icon as={MdApps} boxSize={5} />
        </Flex>
        {!isCollapsed && (
          <Text fontSize="lg" fontWeight="bold" ml={3}>
            KP CIRCUIT
          </Text>
        )}
      </Flex>

      {/* NAVIGATION ITEMS */}
      <VStack
        align="stretch"
        flex="1"
        spacing={1}
        py={2}
        px={isCollapsed ? 2 : 4}
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "gray.300" },
        }}
      >
        {/* Section Header */}
        {!isCollapsed && (
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color="gray.500"
            mb={2}
            mt={4}
            px={3}
          >
            General
          </Text>
        )}

        {SIDEBAR_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          const LinkBox = (
            <Flex
              as={Link}
              to={item.path}
              align="center"
              justify={isCollapsed ? "center" : "flex-start"}
              p={3}
              py={2.5}
              borderRadius="md"
              bg={isActive ? "gray.100" : "transparent"}
              color={isActive ? "black" : "gray.600"}
              _hover={{
                bg: "gray.100",
                color: "black",
              }}
              transition="all 0.2s"
              cursor="pointer"
              role="group"
            >
              <Icon
                as={item.icon}
                boxSize={5}
                mr={isCollapsed ? 0 : 3}
                color={isActive ? "black" : "gray.500"}
                _groupHover={{ color: "black" }}
              />
              {!isCollapsed && (
                <Text fontWeight={isActive ? "600" : "500"} fontSize="sm">
                  {item.name}
                </Text>
              )}
            </Flex>
          );

          return isCollapsed ? (
            <Tooltip key={item.name} label={item.name} placement="right" hasArrow>
              {LinkBox}
            </Tooltip>
          ) : (
            <Box key={item.name}>{LinkBox}</Box>
          );
        })}

        {/* You can add more sections here following the same pattern */}
        {!isCollapsed && (
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color="gray.500"
            mb={2}
            mt={6}
            px={3}
          >
            Projects
          </Text>
        )}
      </VStack>

      {/* FOOTER ACTIONS (USER PROFILE) */}
      <Box p={isCollapsed ? 2 : 4} mb={4}>
        <Menu placement="top-start">
          {isCollapsed ? (
            <Tooltip label={adminName} placement="right" hasArrow>
              <MenuButton>
                <Avatar size="sm" name={adminName} bg="gray.700" color="white" cursor="pointer" />
              </MenuButton>
            </Tooltip>
          ) : (
            <MenuButton
              w="100%"
              p={2}
              borderRadius="md"
              _hover={{ bg: "gray.100" }}
              transition="all 0.2s"
            >
              <Flex align="center" justify="space-between" cursor="pointer">
                <HStack spacing={3}>
                  <Avatar size="sm" name={adminName} bg="gray.700" color="white" />
                  <Box textAlign="left">
                    <Text fontSize="sm" fontWeight="bold" lineHeight="1.2">
                      {adminName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" lineHeight="1.2">
                      {adminEmail}
                    </Text>
                  </Box>
                </HStack>
                <Icon as={MdUnfoldMore} color="gray.500" />
              </Flex>
            </MenuButton>
          )}

          <MenuList>
            <MenuItem onClick={handleLogout} color="red.500" fontWeight="500">
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  );
};

export default Sidebar;
