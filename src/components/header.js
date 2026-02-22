// Header.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Flex, IconButton, Drawer, Text, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, VStack, HStack, Divider } from '@chakra-ui/react';
import { HamburgerIcon, Search2Icon } from '@chakra-ui/icons';
import { FaUser, FaShoppingCart } from 'react-icons/fa';

import logo from './logo.png'
import { logout } from '../actions/apiActions';

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const handleToggle = () => setIsOpen(!isOpen);
  const handleLogout = async () => {
    localStorage.clear();
    const response = await logout();
    navigate('/');
  }
  return (
    <Flex
      color="white"
      // p={4}
      // pl={200}
      // pr={200}
      p={4}
      pl={[0, 0, 10, 200]} // Responsive padding: 0px on mobile, 200px on desktop
      pr={[0, 0, 10, 200]} // Responsive padding: 0px on mobile, 200px on desktop
      height="100px"
      align="center"
      justifyContent="space-between"
    >
      <HStack spacing={4}>
        <IconButton icon={<HamburgerIcon fontSize="2xl" />} variant="ghost" onClick={handleToggle} />

        {/* Sidebar Drawer */}
        <Drawer placement="left" onClose={handleToggle} isOpen={isOpen}>
          <DrawerOverlay>
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Login</DrawerHeader>
              <Divider />
              <DrawerBody>
                {/* Add your sidebar content here */}
                <VStack align='left' fontFamily='sans-serif' spacing={4}>
                  {/* Your sidebar items go here */}
                  <Text><Link to="/dashboard">Dashboard</Link></Text>
                  <Divider />
                  <Text><Link to="/category">Categories</Link></Text>
                  <Divider />
                  <Text><Link to="/subcategory">Sub Categories</Link></Text>
                  <Divider />
                  <Text><Link to="/products">Products</Link></Text>
                  <Divider />
                  <Text><Link to="/orders">Orders</Link></Text>
                  <Divider />
                  <Text><Link to="/users">Users</Link></Text>
                  <Divider />
                  <Text onClick={handleLogout}>Logout</Text>
                  <Divider />
                  <Text>VISIT STORE</Text>
                  <Divider />
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
      </HStack>


      {/* Center (Logo) */}
      <Box align="center" color="black" >
        <img src={logo} height={'50%'} width={'50%'}></img>
      </Box>

      <Box display={'flex'}>
        <IconButton icon={<Search2Icon fontSize="xl" />} variant="ghost" />
        <IconButton icon={<FaUser fontSize="2xl" />} variant="ghost" />
        <IconButton icon={<FaShoppingCart fontSize="2xl" />} variant="ghost" />
      </Box>
    </Flex>
  );
};

export default Header;