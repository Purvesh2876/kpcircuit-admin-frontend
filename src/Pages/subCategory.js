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
  Spinner,
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
  Textarea,
  Flex,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon, CloseIcon } from "@chakra-ui/icons";
import { IconButton, Badge } from "@chakra-ui/react";

import {
  getAllCategories,
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../actions/apiActions";

const SubCategory = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: null,
    filterAttributes: [],
  });

  // filterAttributes rows keep options as a raw comma-separated string while
  // editing (optionsText); it is split into an array only at submit time.
  const toAttributeRows = (attrs) =>
    (attrs || []).map((a) => ({
      name: a.name || "",
      type: a.type || "select",
      unit: a.unit || "",
      optionsText: (a.options || []).join(", "),
    }));

  const serializeAttributeRows = (rows) =>
    JSON.stringify(
      rows
        .filter((r) => r.name.trim())
        .map((r) => ({
          name: r.name.trim(),
          type: r.type,
          unit: r.unit.trim(),
          options:
            r.type === "select"
              ? r.optionsText.split(",").map((o) => o.trim()).filter(Boolean)
              : [],
        }))
    );

  /* ---------- Color Mode (Top Only) ---------- */
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeadBg = useColorModeValue("gray.100", "gray.700");
  const rowHoverBg = useColorModeValue("gray.50", "gray.700");

  /* ---------------- FETCH ---------------- */
  const fetchData = async () => {
    setLoading(true);
    const [cats, subs] = await Promise.all([
      getAllCategories(),
      getAllSubCategories(),
    ]);
    setCategories(cats);
    setSubCategories(subs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- ADD ---------------- */
  const openAddModal = () => {
    setFormData({ name: "", description: "", category: "", image: null, filterAttributes: [] });
    setImagePreview(null);
    setAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    fd.append("filterAttributes", serializeAttributeRows(formData.filterAttributes));
    if (formData.image) fd.append("image", formData.image);
    try {
      await createSubCategory(fd);
      setAddModalOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Failed to create subcategory",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
      });
    }
  };

  /* ---------------- EDIT ---------------- */
  const openEditModal = (sub) => {
    setSelectedSubCategory(sub);
    setFormData({
      name: sub.name,
      description: sub.description || "",
      category: sub.category._id,
      image: null,
      filterAttributes: toAttributeRows(sub.filterAttributes),
    });
    setImagePreview(
      sub.image
        ? `/uploads${sub.image}`
        : null
    ); // ${process.env.REACT_APP_API_URL}
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    fd.append("filterAttributes", serializeAttributeRows(formData.filterAttributes));
    if (formData.image) fd.append("image", formData.image);
    try {
      await updateSubCategory(selectedSubCategory._id, fd);
      setEditModalOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Failed to update subcategory",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
      });
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteSubCategory(id);
      fetchData();
    } catch (error) {
      toast({
        title: "Failed to delete subcategory",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
      });
    }
  };

  return (
    <Box maxW="100%">
      {/* ---------- Header ---------- */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold" letterSpacing="tight" mb={1}>Subcategories</Heading>
          <Text fontSize="sm" color="gray.500">
            Organize your subcategories efficiently
          </Text>
        </Box>

        <Button
          bg="black"
          color="white"
          _hover={{ bg: "gray.800" }}
          leftIcon={<Text fontSize="xl" mb={1}>+</Text>}
          onClick={openAddModal}
        >
          Create Subcategory
        </Button>
      </Box>

      {/* ---------- Table Container ---------- */}
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
        ) : subCategories.length === 0 ? (
          <Flex justify="center" align="center" p={10}>
            <Text color="gray.500">No subcategories found.</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">#</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Name</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Image</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Category</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Filters</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Description</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {subCategories.map((sub, index) => (
                  <Tr key={sub._id} _hover={{ bg: "gray.50" }}>
                    <Td color="gray.500">{index + 1}</Td>
                    <Td fontWeight="medium" color="black">{sub.name}</Td>
                    <Td>
                      {sub.image ? (
                        <img
                          src={`/uploads${sub.image}`} // ${process.env.REACT_APP_API_URL}
                          alt={sub.name}
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td color="gray.600">{sub.category?.name}</Td>
                    <Td>
                      {sub.filterAttributes?.length > 0 ? (
                        <Badge colorScheme="purple" borderRadius="full" px={2}>
                          {sub.filterAttributes.length} filter
                          {sub.filterAttributes.length > 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <Text as="span" color="gray.400">—</Text>
                      )}
                    </Td>
                    <Td maxW="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" color="gray.600">
                      {sub.description || "-"}
                    </Td>
                    <Td textAlign="right">
                      <ButtonGroup size="sm" variant="ghost" spacing={1}>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="gray.300"
                          color="gray.600"
                          _hover={{ bg: "gray.50" }}
                          onClick={() => openEditModal(sub)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="gray.300"
                          color="gray.600"
                          _hover={{ color: "red.500", bg: "red.50" }}
                          onClick={() => handleDelete(sub._id)}
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

      {/* ---------- ADD MODAL ---------- */}
      <SubCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add SubCategory"
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        onSubmit={handleAddSubmit}
        submitLabel="Add SubCategory"
      />

      {/* ---------- EDIT MODAL ---------- */}
      <SubCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit SubCategory"
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        onSubmit={handleEditSubmit}
        submitLabel="Update SubCategory"
      />
    </Box>
  );
};

/* ---------- Reusable Modal ---------- */
const SubCategoryModal = ({
  isOpen,
  onClose,
  title,
  formData,
  setFormData,
  categories,
  imagePreview,
  setImagePreview,
  onSubmit,
  submitLabel,
}) => {
  const attributeRows = formData.filterAttributes || [];

  const updateRow = (index, patch) => {
    const rows = attributeRows.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    setFormData({ ...formData, filterAttributes: rows });
  };

  const addRow = () => {
    setFormData({
      ...formData,
      filterAttributes: [
        ...attributeRows,
        { name: "", type: "select", unit: "", optionsText: "" },
      ],
    });
  };

  const removeRow = (index) => {
    setFormData({
      ...formData,
      filterAttributes: attributeRows.filter((_, i) => i !== index),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
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
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  borderRadius="lg"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setFormData({ ...formData, image: file });
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
              </FormControl>

              {imagePreview && (
                <Box>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "120px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  />
                </Box>
              )}

              {/* ---------- Filter Parameters ---------- */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <FormLabel mb={0}>Filter Parameters</FormLabel>
                  <Button size="xs" leftIcon={<AddIcon />} onClick={addRow}>
                    Add Parameter
                  </Button>
                </Flex>

                {attributeRows.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No filter parameters. Products in this subcategory will only
                    use the global filters (search, sort, price).
                  </Text>
                ) : (
                  <Stack spacing={3}>
                    {attributeRows.map((row, index) => (
                      <Box
                        key={index}
                        p={3}
                        borderWidth="1px"
                        borderColor="gray.200"
                        borderRadius="lg"
                      >
                        <Flex gap={2} mb={2}>
                          <Input
                            placeholder="Name (e.g. Resistance)"
                            size="sm"
                            value={row.name}
                            onChange={(e) => updateRow(index, { name: e.target.value })}
                          />
                          <Select
                            size="sm"
                            w="130px"
                            value={row.type}
                            onChange={(e) => updateRow(index, { type: e.target.value })}
                          >
                            <option value="select">Select</option>
                            <option value="number">Number</option>
                            <option value="text">Text</option>
                          </Select>
                          <Input
                            placeholder="Unit"
                            size="sm"
                            w="100px"
                            value={row.unit}
                            onChange={(e) => updateRow(index, { unit: e.target.value })}
                          />
                          <IconButton
                            aria-label="Remove parameter"
                            icon={<CloseIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeRow(index)}
                          />
                        </Flex>
                        {row.type === "select" && (
                          <Input
                            placeholder="Options, comma separated (e.g. 0603, 0805, 1206)"
                            size="sm"
                            value={row.optionsText}
                            onChange={(e) =>
                              updateRow(index, { optionsText: e.target.value })
                            }
                          />
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

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

export default SubCategory;