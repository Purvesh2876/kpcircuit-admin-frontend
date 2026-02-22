import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Select,
  Checkbox,
  Image,
  SimpleGrid,
  IconButton,
  Text,
  Textarea, // Added Textarea for description
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CloseIcon } from "@chakra-ui/icons";

import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  getSubCategoriesByCategory,
} from "../actions/apiActions";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // SEPARATE STATE FOR IMAGES
  // 1. Array of strings (URLs) for images already on the server
  const [existingImages, setExistingImages] = useState([]);
  // 2. Array of File objects for new uploads
  const [newImages, setNewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    category: "",
    subCategory: "",
    description: "",
    price: "",
    stock: "",
    featured: false,
  });

  /* ---------------- FETCH ---------------- */

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      if (!categoryId) {
        setSubCategories([]);
        return;
      }
      const data = await getSubCategoriesByCategory(categoryId);
      setSubCategories(data);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ---------------- MODAL ---------------- */

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      manufacturer: "",
      category: "",
      subCategory: "",
      description: "",
      price: "",
      stock: "",
      featured: false,
    });
    setExistingImages([]); // Reset images
    setNewImages([]); // Reset images
    setSubCategories([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      manufacturer: product.manufacturer,
      category: product.category?._id || "", // Safe navigation
      subCategory: product.subCategory?._id || "", // Safe navigation
      description: product.description,
      price: product.price,
      stock: product.stock,
      featured: product.featured,
    });

    // Set existing images from the product object
    setExistingImages(product.images || []);
    setNewImages([]); // Reset new images

    if (product.category?._id) {
      fetchSubCategories(product.category._id);
    }
    setIsModalOpen(true);
  };

  /* ---------------- HANDLERS ---------------- */

  const handleCategoryChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, category: value, subCategory: "" });
    fetchSubCategories(value);
  };

  // Handle selecting new files
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...filesArray]);
    }
  };

  // Remove a newly selected image (File object)
  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  // Remove an existing image (String URL)
  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    // 1. Append standard fields
    Object.entries(formData).forEach(([key, value]) => {
      // Ensure we don't send null/undefined values
      const valToSend = value === null || value === undefined ? "" : value;
      fd.append(key, valToSend);
    });

    // 2. Append NEW images (Files)
    newImages.forEach((img) => {
      fd.append("images", img);
    });

    // 3. Append EXISTING images (Strings) - using JSON.stringify
    // This fixes the "Unexpected token" error on the backend
    if (existingImages.length > 0) {
      fd.append("existingImages", JSON.stringify(existingImages));
    } else {
      // Even if empty, sending an empty array as string helps backend logic
      fd.append("existingImages", JSON.stringify([]));
    }

    // Also send removedImages as empty array to prevent backend crash if it expects it
    fd.append("removedImages", JSON.stringify([]));

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, fd);
      } else {
        await createProduct(fd);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Operation failed:", error);
      alert("Failed to save product. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Heading>Product Management</Heading>
        <Button colorScheme="purple" onClick={openAddModal}>
          + Add Product
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Image</Th>
            <Th>Category</Th>
            <Th>Price</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((p) => (
            <Tr key={p._id}>
              <Td>{p.name}</Td>
              <Td>
                {p.images && p.images[0] && (
                  <Image
                    // Fallback to localhost if ENV not set, change as needed
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/'}uploads${p.images[0]}`}
                    boxSize="50px"
                    objectFit="cover"
                  />
                )}
              </Td>
              <Td>{p.category?.name}</Td>
              <Td>₹{p.price}</Td>
              <Td>
                <ButtonGroup size="sm">
                  <Button onClick={() => openEditModal(p)}>
                    <EditIcon />
                  </Button>
                  <Button colorScheme="red" onClick={() => handleDelete(p._id)}>
                    <DeleteIcon />
                  </Button>
                </ButtonGroup>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* ---------------- MODAL ---------------- */}
      {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingProduct ? "Edit Product" : "Add Product"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4} pb={6}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Manufacturer</FormLabel>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        manufacturer: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    placeholder="Select Category"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>SubCategory</FormLabel>
                  <Select
                    value={formData.subCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, subCategory: e.target.value })
                    }
                    placeholder="Select SubCategory"
                  >
                    {subCategories.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Price</FormLabel>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Stock</FormLabel>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl>
                  <Checkbox
                    isChecked={formData.featured}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featured: e.target.checked,
                      })
                    }
                  >
                    Featured Product
                  </Checkbox>
                </FormControl>

                <FormControl>
                  <FormLabel>Images</FormLabel>

                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    sx={{
                      "::file-selector-button": {
                        height: 10,
                        padding: 0,
                        mr: 4,
                        background: "none",
                        border: "none",
                        fontWeight: "bold",
                      },
                    }}
                  />

                  <Box mt={4}>
                    <Text fontSize="sm" mb={2} color="gray.500">
                      Selected Images:
                    </Text>

                    <SimpleGrid columns={[3, 4, 5]} spacing={4}>
                      {existingImages.map((img, index) => (
                        <Box key={`existing-${index}`} position="relative">
                          <Image
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/'}uploads${img}`}
                            boxSize="70px"
                            objectFit="cover"
                            borderRadius="md"
                            border="1px solid #ddd"
                          />
                          <IconButton
                            icon={<CloseIcon />}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top="-8px"
                            right="-8px"
                            rounded="full"
                            onClick={() => removeExistingImage(index)}
                            aria-label="Remove image"
                          />
                        </Box>
                      ))}

                      {newImages.map((file, index) => (
                        <Box key={`new-${index}`} position="relative">
                          <Image
                            src={URL.createObjectURL(file)}
                            boxSize="70px"
                            objectFit="cover"
                            borderRadius="md"
                            border="2px solid purple" 
                          />
                          <IconButton
                            icon={<CloseIcon />}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top="-8px"
                            right="-8px"
                            rounded="full"
                            onClick={() => removeNewImage(index)}
                            aria-label="Remove image"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                </FormControl>

                <Button type="submit" colorScheme="purple">
                  Save Product
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal> */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="lg">
            {editingProduct ? "Edit Product" : "Add Product"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>

                {/* -------- BASIC INFO GRID -------- */}
                <SimpleGrid columns={[1, 2]} spacing={3}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Name</FormLabel>
                    <Input
                      size="sm"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Manufacturer</FormLabel>
                    <Input
                      size="sm"
                      value={formData.manufacturer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manufacturer: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                {/* -------- CATEGORY GRID -------- */}
                <SimpleGrid columns={[1, 2]} spacing={3}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Category</FormLabel>
                    <Select
                      size="sm"
                      value={formData.category}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">SubCategory</FormLabel>
                    <Select
                      size="sm"
                      value={formData.subCategory}
                      onChange={(e) =>
                        setFormData({ ...formData, subCategory: e.target.value })
                      }
                    >
                      <option value="">Select SubCategory</option>
                      {subCategories.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* -------- DESCRIPTION -------- */}
                <FormControl>
                  <FormLabel fontSize="sm">Description</FormLabel>
                  <Textarea
                    size="sm"
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </FormControl>

                {/* -------- PRICE & STOCK -------- */}
                <SimpleGrid columns={[1, 2]} spacing={3}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Price</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Stock</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                <Checkbox
                  size="sm"
                  isChecked={formData.featured}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featured: e.target.checked,
                    })
                  }
                >
                  Featured Product
                </Checkbox>

                {/* -------- IMAGES -------- */}
                <FormControl>
                  <FormLabel fontSize="sm">Images</FormLabel>
                  <Input
                    size="sm"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <SimpleGrid columns={[3, 4]} spacing={3} mt={3}>
                    {existingImages.map((img, index) => (
                      <Box key={index} position="relative">
                        <Image
                          src={`${process.env.REACT_APP_API_URL || "http://localhost:5000/"}uploads${img}`}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top="-5px"
                          right="-5px"
                          rounded="full"
                          onClick={() => removeExistingImage(index)}
                        />
                      </Box>
                    ))}

                    {newImages.map((file, index) => (
                      <Box key={index} position="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                          border="2px solid purple"
                        />
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top="-5px"
                          right="-5px"
                          rounded="full"
                          onClick={() => removeNewImage(index)}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                </FormControl>

                <Button type="submit" colorScheme="purple" size="sm" mt={2}>
                  Save Product
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductManagement;