// UsersPage.js
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Button, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, Input, useDisclosure, Badge, Stack, useToast
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
    <Box p={4}>
      <Heading mb={4}>User Management</Heading>

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Mobile</Th>
              <Th>Roles</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users?.map((user) => (
              <Tr key={user._id}>
                {/* Ensure we access properties safely */}
                <Td>{user.name || 'N/A'}</Td>
                <Td>{user.email}</Td>
                <Td>{user.mobile || 'N/A'}</Td>
                <Td>
                  {/* Check if roles exists and is an array, then join with comma */}
                  {Array.isArray(user.role) ? user.role.join(', ') : 'N/A'}
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<EditIcon />}
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
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