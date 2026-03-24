// UsersPage.js
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Button, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, Input, useDisclosure, Badge, Stack, useToast, Center, Text
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import Select from 'react-select'; // Import React Select
import axios from 'axios';

// Define the available roles for your system
const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'support', label: 'Support' }
];

const UsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // State for Editing
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentUser, setCurrentUser] = useState(null); // The user being edited
  const [selectedRoles, setSelectedRoles] = useState([]); // For React Select

  const toast = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getAllUsers`, {
        withCredentials: true,
      });

      // FIX 1: Accessing response.data.data per your finding
      // We also add a fallback to an empty array [] to prevent .map crashes
      // console.log('response', response.data.data);
      // console.log('response', response.data.data.map(user => user.role))
      setUsers(response.data.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Error fetching users', status: 'error', duration: 3000 });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Handle Edit Click ---
  const handleEditClick = (user) => {
    setCurrentUser(user);

    // 1. Get the user's existing roles (or empty array if none)
    const dbRoles = user.role || [];

    // 2. Convert database strings to React Select Objects
    // Example: "ADMIN" -> { value: "ADMIN", label: "Admin" }
    const formattedRoles = dbRoles.map(roleStr => {
      // Try to find the "pretty" label from your options constant
      const foundOption = ROLE_OPTIONS.find(opt => opt.value === roleStr);

      // If found, return that option. If not, make a new one using the string.
      return foundOption || { value: roleStr, label: roleStr };
    });

    // 3. Set this into state. The Select component reads this variable.
    setSelectedRoles(formattedRoles);

    // 4. Open the modal
    onOpen();
  };

  // --- Handle Save Changes ---
  // --- Handle Save Changes ---
  const handleSave = async () => {
    try {
      // Convert React Select objects back to a simple string array
      const finalRoles = selectedRoles.map(option => option.value);

      const updatedData = {
        ...currentUser,
        // CRITICAL FIX: Changed 'roles' to 'role' to match your database key
        role: finalRoles
      };

      // API Call
      await axios.put(`${process.env.REACT_APP_API_URL}/auth/updateUser/${currentUser._id}`, updatedData, {
        withCredentials: true
      }); // http://76.13.247.39:5000/api

      toast({ title: 'User updated successfully', status: 'success', duration: 3000 });

      // Refresh list and close modal
      fetchUsers();
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      toast({ title: 'Update failed', status: 'error', duration: 3000 });
    }
  };

  // --- Handle Input Changes (Name, Mobile, etc) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box maxW="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold" letterSpacing="tight" mb={1}>Users</Heading>
          <Text color="gray.500" fontSize="sm">Manage accounts and platform access</Text>
        </Box>
      </Box>

      {loading ? (
        <Center h="40vh">
          <Spinner size="xl" />
        </Center>
      ) : (
        <Box bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Name</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Email</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Mobile</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Roles</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" textAlign="right">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users?.map((user) => (
                  <Tr key={user._id} _hover={{ bg: "gray.50" }}>
                    <Td fontWeight="medium" color="black">{user.name || 'N/A'}</Td>
                    <Td color="gray.600">{user.email}</Td>
                    <Td color="gray.600">{user.mobile || 'N/A'}</Td>
                    <Td>
                      {Array.isArray(user.role) ? (
                        <Stack direction="row" spacing={2}>
                          {user.role.map((r, i) => (
                            <Badge key={i} colorScheme={r === "admin" ? "purple" : "gray"} borderRadius="full" px="2" py="0.5">
                              {r.toUpperCase()}
                            </Badge>
                          ))}
                        </Stack>
                      ) : (
                        <Text color="gray.500">N/A</Text>
                      )}
                    </Td>
                    <Td textAlign="right">
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.600"
                        _hover={{ bg: "gray.50" }}
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* --- EDIT MODAL --- */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentUser && (
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={currentUser.name || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    value={currentUser.email || ''}
                    isReadOnly // Usually we don't let admins edit email directly
                    bg="gray.100"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Mobile</FormLabel>
                  <Input
                    name="mobile"
                    value={currentUser.mobile || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Roles</FormLabel>
                  {/* React Select Component */}
                  <Select
                    isMulti // <--- Allows multiple selections
                    name="roles"
                    options={ROLE_OPTIONS} // The const defined at top
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={selectedRoles}
                    onChange={setSelectedRoles}
                  />
                </FormControl>
              </Stack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSave}>Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default UsersPage;