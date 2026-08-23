// Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Button,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { login } from '../actions/apiActions';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Inform the admin when they land here because their session expired,
  // rather than leaving them to wonder why they were logged out.
  useEffect(() => {
    if (sessionStorage.getItem('sessionExpired')) {
      sessionStorage.removeItem('sessionExpired');
      toast({
        title: 'Session expired',
        description: 'Please log in again to continue.',
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({
        title: 'Missing details',
        description: 'Enter both email and password.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login(email.trim(), password);

      if (response.success === true) {
        localStorage.setItem('token', response.token);
        if (response.user) {
          localStorage.setItem('adminName', response.user.name);
          localStorage.setItem('adminEmail', response.user.email);
        }
        toast({
          title: 'Login successful',
          description: 'Redirecting to your dashboard…',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
        if (onLogin) onLogin(true);
        navigate('/dashboard');
      } else {
        toast({
          title: 'Login failed',
          description: response.data || response.message || 'Please check your credentials and try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      // adminLogin puts its error text under `data` (a plain string), while
      // most other endpoints use `message` — check both so a real message
      // shows instead of a blank/undefined description.
      const serverMessage = error?.response?.data?.data || error?.response?.data?.message;
      toast({
        title: 'Login failed',
        description: serverMessage || 'Invalid email or password.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(135deg, gray.50 0%, purple.50 100%)"
      px={4}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        w="full"
        maxW="420px"
        borderRadius="2xl"
        boxShadow="0 20px 60px rgba(0,0,0,0.08)"
        border="1px solid"
        borderColor="gray.100"
        p={{ base: 8, md: 10 }}
      >
        <Flex direction="column" align="center" mb={8}>
          <Flex
            align="center"
            justify="center"
            boxSize="56px"
            borderRadius="full"
            bg="purple.500"
            color="white"
            fontWeight="700"
            fontSize="lg"
            mb={4}
          >
            KP
          </Flex>
          <Heading size="md" fontWeight="700">
            KPCircuit Admin
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Sign in to manage your store
          </Text>
        </Flex>

        <Stack spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <EmailIcon color="gray.400" />
            </InputLeftElement>
            <Input
              type="email"
              placeholder="Email"
              borderRadius="lg"
              bg="gray.50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              isRequired
            />
          </InputGroup>

          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <LockIcon color="gray.400" />
            </InputLeftElement>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              borderRadius="lg"
              bg="gray.50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              isRequired
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                variant="ghost"
                size="sm"
                color="gray.400"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              />
            </InputRightElement>
          </InputGroup>

          <Button
            type="submit"
            colorScheme="purple"
            borderRadius="lg"
            size="lg"
            isLoading={isSubmitting}
            loadingText="Signing in…"
            mt={2}
          >
            Sign In
          </Button>
        </Stack>

        <Text color="gray.400" fontSize="xs" textAlign="center" mt={8}>
          Authorized personnel only
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
