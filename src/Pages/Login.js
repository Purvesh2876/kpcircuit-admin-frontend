// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChakraProvider, Container, Heading, Box, Input, Button, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { login } from '../actions/apiActions';


const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      console.log(response);
      if (response.success === true) {
        toast({
          title: 'Login Successful',
          description: 'You have successfully logged in.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        localStorage.setItem('token', response.token);
        navigate('/dashboard');
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error('Error during login:', error.message);
    }
  };

  return (

    <Container maxW="container.md" centerContent>
      <Box mt="10">
        <Heading mb="4">Admin Login</Heading>
        <Input
          placeholder="Email"
          mb="4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          mb="4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button colorScheme="teal" onClick={handleLogin}>
          Login
        </Button>
      </Box>
    </Container>

  );
};

export default Login;
