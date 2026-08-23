// Header.js
import React from 'react';
import { Box, Flex, IconButton, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { logout } from '../actions/apiActions';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = async () => {
    localStorage.clear();
    await logout();
    window.location.href = "/admin";
  };

  return (
    <Flex
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      p={4}
      height="70px"
      align="center"
      justifyContent="space-between"
      position="sticky"
      top="0"
      zIndex="10"
    >
      {/* Left Area Empty */}
      <Box></Box>

      {/* Center Logo Removed */}
      <Box></Box>

      {/* Right Icons */}
      <Box display="flex">
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FaUser fontSize="xl" />}
            variant="ghost"
            aria-label="Profile"
            isDisabled={!isLoggedIn}
            _hover={{ bg: "gray.100" }}
          />
          <MenuList>
            <MenuItem color="red.500" fontWeight="bold" onClick={handleLogout}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
};

export default Header;