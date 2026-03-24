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
      `/uploads${cat.image}`
    ); // ${process.env.REACT_APP_API_URL || "http://76.13.247.39:5000/"}
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
    <Box maxW="100%">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold" letterSpacing="tight" mb={1}>Categories</Heading>
          <Text color="gray.500" fontSize="sm">
            Manage and organize your product catalog structure
          </Text>
        </Box>

        <Button
          bg="black"
          color="white"
          _hover={{ bg: "gray.800" }}
          leftIcon={<Text fontSize="xl" mb={1}>+</Text>}
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
        >
          Create Category
        </Button>
      </Box>

      {/* Table Container */}
      <Box
        bg="white"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        overflow="hidden"
      >
        {loading ? (
          <Flex justify="center" align="center" p={10}>
            <Spinner size="xl" />
          </Flex>
        ) : categories.length === 0 ? (
          <Flex justify="center" align="center" p={10}>
            <Text color="gray.500">No categories found.</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">#</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Name</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Image</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((cat, i) => (
                  <Tr key={cat._id} _hover={{ bg: "gray.50" }}>
                    <Td color="gray.500">{i + 1}</Td>
                    <Td fontWeight="medium" color="black">{cat.name}</Td>
                    <Td>
                      <Image
                        src={`/uploads${cat.image}`} // ${process.env.REACT_APP_API_URL || "http://76.13.247.39:5000/"}
                        boxSize="40px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    </Td>
                    <Td textAlign="right">
                      <ButtonGroup size="sm" variant="ghost" spacing={1}>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="gray.300"
                          color="gray.600"
                          _hover={{ bg: "gray.50" }}
                          onClick={() => openEdit(cat)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="gray.300"
                          color="gray.600"
                          _hover={{ color: "red.500", bg: "red.50" }}
                          onClick={() => handleDelete(cat._id)}
                        >
                          Delete
                        </Button>
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
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