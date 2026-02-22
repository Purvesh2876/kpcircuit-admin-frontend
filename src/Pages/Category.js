// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Heading,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Spinner,
//   Image,
//   Button,
//   ButtonGroup,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   Stack,
//   FormControl,
//   FormLabel,
//   Input,
//   Text,
//   useToast
// } from "@chakra-ui/react";
// import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
// import {
//   getAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../actions/apiActions";

// const Category = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const toast = useToast();

//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   // State for Form
//   const [name, setName] = useState("");
//   const [imageFile, setImageFile] = useState(null); // The actual File object to send
//   const [imagePreview, setImagePreview] = useState(null); // The URL for display

//   /* ---------------- FETCH ---------------- */
//   const fetchCategories = async () => {
//     setLoading(true);
//     try {
//       const data = await getAllCategories();
//       setCategories(data);
//     } catch (error) {
//       console.error("Error fetching categories", error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   /* ---------------- HANDLERS ---------------- */

//   // Helper to handle file selection and generate preview
//   const handleImageChange = (e) => {
//     const file = e.target.files[0]; // IMPORTANT: Always take the first file
//     if (file) {
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file)); // Create local preview URL
//     }
//   };

//   const resetForm = () => {
//     setName("");
//     setImageFile(null);
//     setImagePreview(null);
//   };

//   const handleAdd = async (e) => {
//     e.preventDefault();

//     if (!imageFile) {
//         toast({ title: "Please select an image", status: "warning" });
//         return;
//     }

//     const fd = new FormData();
//     fd.append("name", name);
//     // Appending the single file object. 
//     // Backend 'upload.single("image")' should handle this.
//     fd.append("image", imageFile); 

//     await createCategory(fd);
    
//     setIsAddOpen(false);
//     resetForm();
//     fetchCategories();
//   };

//   const openEdit = (cat) => {
//     setSelectedCategory(cat);
//     setName(cat.name);
//     // Set existing image as preview
//     setImagePreview(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/'}uploads${cat.image}`);
//     setImageFile(null); // Null means "no new file selected"
//     setIsEditOpen(true);
//   };

//   const handleEdit = async (e) => {
//     e.preventDefault();

//     const fd = new FormData();
//     fd.append("name", name);
    
//     // Only append image if a NEW file was selected
//     if (imageFile) {
//       fd.append("image", imageFile);
//     }

//     await updateCategory(selectedCategory._id, fd);
//     setIsEditOpen(false);
//     resetForm();
//     fetchCategories();
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this category?")) {
//       await deleteCategory(id);
//       fetchCategories();
//     }
//   };

//   /* ---------------- UI ---------------- */
//   return (
//     <Box p={6}>
//       <Box display="flex" justifyContent="space-between" mb={4}>
//         <Heading>Category Management</Heading>
//         <Button colorScheme="purple" onClick={() => { resetForm(); setIsAddOpen(true); }}>
//           + Add Category
//         </Button>
//       </Box>

//       {loading ? (
//         <Spinner />
//       ) : (
//         <Table variant="simple">
//           <Thead>
//             <Tr>
//               <Th>#</Th>
//               <Th>Name</Th>
//               <Th>Image</Th>
//               <Th>Actions</Th>
//             </Tr>
//           </Thead>
//           <Tbody>
//             {categories.map((cat, i) => (
//               <Tr key={cat._id}>
//                 <Td>{i + 1}</Td>
//                 <Td>{cat.name}</Td>
//                 <Td>
//                   {/* Assuming your backend serves images from /uploads */}
//                   <Image
//                     src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/'}uploads${cat.image}`}
//                     height="50px"
//                     width="50px"
//                     objectFit="cover"
//                     borderRadius="md"
//                     fallbackSrc="https://via.placeholder.com/50"
//                   />
//                 </Td>
//                 <Td>
//                   <ButtonGroup size="sm">
//                     <Button onClick={() => openEdit(cat)}>
//                       <EditIcon />
//                     </Button>
//                     <Button colorScheme="red" onClick={() => handleDelete(cat._id)}>
//                       <DeleteIcon />
//                     </Button>
//                   </ButtonGroup>
//                 </Td>
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       )}

//       {/* ADD MODAL */}
//       <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Add Category</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <form onSubmit={handleAdd}>
//               <Stack spacing={4} pb={4}>
//                 <FormControl isRequired>
//                   <FormLabel>Name</FormLabel>
//                   <Input value={name} onChange={(e) => setName(e.target.value)} />
//                 </FormControl>

//                 <FormControl isRequired>
//                   <FormLabel>Image</FormLabel>
//                   <Input 
//                     type="file" 
//                     accept="image/*"
//                     onChange={handleImageChange} 
//                     sx={{
//                         "::file-selector-button": {
//                           height: 10,
//                           padding: 0,
//                           mr: 4,
//                           background: "none",
//                           border: "none",
//                           fontWeight: "bold",
//                         },
//                       }}
//                   />
//                   {imagePreview && (
//                     <Box mt={3}>
//                         <Text fontSize="sm" mb={1} color="gray.500">Preview:</Text>
//                         <Image src={imagePreview} height="100px" borderRadius="md" border="1px solid #ddd" />
//                     </Box>
//                   )}
//                 </FormControl>

//                 <Button type="submit" colorScheme="purple">
//                   Save
//                 </Button>
//               </Stack>
//             </form>
//           </ModalBody>
//         </ModalContent>
//       </Modal>

//       {/* EDIT MODAL */}
//       <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Edit Category</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <form onSubmit={handleEdit}>
//               <Stack spacing={4} pb={4}>
//                 <FormControl isRequired>
//                   <FormLabel>Name</FormLabel>
//                   <Input value={name} onChange={(e) => setName(e.target.value)} />
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Replace Image</FormLabel>
//                   <Input 
//                     type="file" 
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     sx={{
//                         "::file-selector-button": {
//                           height: 10,
//                           padding: 0,
//                           mr: 4,
//                           background: "none",
//                           border: "none",
//                           fontWeight: "bold",
//                         },
//                       }}
//                   />
//                   {imagePreview && (
//                     <Box mt={3}>
//                         <Text fontSize="sm" mb={1} color="gray.500">
//                              {imageFile ? "New Preview:" : "Current Image:"}
//                         </Text>
//                         <Image src={imagePreview} height="100px" borderRadius="md" border="1px solid #ddd" />
//                     </Box>
//                   )}
//                 </FormControl>

//                 <Button type="submit" colorScheme="purple">
//                   Update
//                 </Button>
//               </Stack>
//             </form>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default Category;

// src/Pages/Category.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Image,
  Button,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Flex,
  useColorModeValue,
  Icon
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../actions/apiActions";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const theadbg = useColorModeValue("gray.100", "gray.700");

  /* ---------------- FETCH ---------------- */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setName("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast({ title: "Please select an image", status: "warning" });
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("image", imageFile);

    await createCategory(fd);
    setIsAddOpen(false);
    resetForm();
    fetchCategories();
  };

  const openEdit = (cat) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setImagePreview(
      `${process.env.REACT_APP_API_URL || "http://localhost:5000/"}uploads${cat.image}`
    );
    setImageFile(null);
    setIsEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name);
    if (imageFile) fd.append("image", imageFile);

    await updateCategory(selectedCategory._id, fd);
    setIsEditOpen(false);
    resetForm();
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      await deleteCategory(id);
      fetchCategories();
    }
  };

  return (
    <Box p={8} bg={pageBg} minH="100vh">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Category Management</Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and organize your product categories
          </Text>
        </Box>

        <Button
          leftIcon={<AddIcon />}
          colorScheme="purple"
          borderRadius="xl"
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
        >
          Add Category
        </Button>
      </Flex>

      {/* Table Container */}
      <Box
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
      >
        {loading ? (
          <Flex justify="center" align="center" p={10}>
            <Spinner size="lg" />
          </Flex>
        ) : categories.length === 0 ? (
          <Flex justify="center" align="center" p={10}>
            <Text color="gray.500">No categories found.</Text>
          </Flex>
        ) : (
          <Table variant="simple">
            <Thead bg={theadbg}>
              <Tr>
                <Th>#</Th>
                <Th>Name</Th>
                <Th>Image</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map((cat, i) => (
                <Tr key={cat._id} _hover={{ bg: "gray.50" }}>
                  <Td>{i + 1}</Td>
                  <Td fontWeight="medium">{cat.name}</Td>
                  <Td>
                    <Image
                      src={`${process.env.REACT_APP_API_URL || "http://localhost:5000/"}uploads${cat.image}`}
                      boxSize="55px"
                      objectFit="cover"
                      borderRadius="lg"
                      border="1px solid #eee"
                    />
                  </Td>
                  <Td textAlign="center">
                    <ButtonGroup size="sm" variant="ghost">
                      <Button onClick={() => openEdit(cat)}>
                        <EditIcon />
                      </Button>
                      <Button colorScheme="red" onClick={() => handleDelete(cat._id)}>
                        <DeleteIcon />
                      </Button>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* ADD MODAL */}
      <CategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Category"
        name={name}
        setName={setName}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
        onSubmit={handleAdd}
        submitLabel="Save"
      />

      {/* EDIT MODAL */}
      <CategoryModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Category"
        name={name}
        setName={setName}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
        onSubmit={handleEdit}
        submitLabel="Update"
      />
    </Box>
  );
};

/* ================= Modal Component ================= */

const CategoryModal = ({
  isOpen,
  onClose,
  title,
  name,
  setName,
  imagePreview,
  handleImageChange,
  onSubmit,
  submitLabel
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={onSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Image</FormLabel>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <Box mt={3}>
                    <Image
                      src={imagePreview}
                      height="120px"
                      borderRadius="lg"
                      border="1px solid #ddd"
                    />
                  </Box>
                )}
              </FormControl>

              <Button type="submit" colorScheme="purple" borderRadius="lg">
                {submitLabel}
              </Button>
            </Stack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Category;