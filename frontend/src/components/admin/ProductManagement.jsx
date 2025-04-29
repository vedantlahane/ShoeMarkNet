import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../redux/slices/productSlice";
import { toast } from "react-toastify";

// Helper for nested state update
const setNested = (obj, path, value) => {
  const keys = path.split(".");
  if (keys.length === 1) return { ...obj, [path]: value };
  return {
    ...obj,
    [keys[0]]: setNested(obj[keys[0]], keys.slice(1).join("."), value),
  };
};

const initialFormData = {
  name: "",
  description: "",
  brand: "",
  category: "",
  price: 0,
  originalPrice: 0,
  countInStock: 0,
  gender: "unisex",
  images: [],
  isFeatured: false,
  isNewArrival: false,
  variants: [],
  specifications: {},
  isActive: true,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: [],
  sku: "",
  weight: 0,
  dimensions: { length: 0, width: 0, height: 0 },
};

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { products, categories, loading, error } = useSelector(
    (state) => state.product
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({ ...initialFormData });

  // Specifications
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Meta keywords
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred");
      dispatch({ type: "product/clearProductError" });
    }
  }, [error, dispatch]);

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setFormData({ ...initialFormData });
    setActiveTab("basic");
    setActiveVariantIndex(0);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setFormData({
      ...initialFormData,
      ...product,
      images: product.images || [],
      variants: product.variants || [],
      specifications: product.specifications || {},
      metaKeywords: Array.isArray(product.metaKeywords)
        ? product.metaKeywords
        : [],
      dimensions: {
        length: product.dimensions?.length || 0,
        width: product.dimensions?.width || 0,
        height: product.dimensions?.height || 0,
      },
    });
    setActiveTab("basic");
    setActiveVariantIndex(0);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      setFormData((prev) =>
        setNested(prev, name, type === "checkbox" ? checked : value)
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? Number(value)
            : value,
      }));
    }
  };

  // Images
  const handleImageChange = (e) => {
    const imageUrl = e.target.value;
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Specifications
  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim(),
        },
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (key) => {
    setFormData((prev) => {
      const updatedSpecs = { ...prev.specifications };
      delete updatedSpecs[key];
      return { ...prev, specifications: updatedSpecs };
    });
  };

  // Meta keywords
  const addKeyword = () => {
    if (
      newKeyword.trim() &&
      !formData.metaKeywords.includes(newKeyword.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        metaKeywords: [...prev.metaKeywords, newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (index) => {
    setFormData((prev) => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter((_, i) => i !== index),
    }));
  };

  // Variants
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { color: "", colorCode: "", images: [], sizes: [] },
      ],
    }));
    setActiveVariantIndex(formData.variants.length);
  };

  const removeVariant = (index) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants.splice(index, 1);
      return { ...prev, variants: updatedVariants };
    });
    setActiveVariantIndex((prev) =>
      prev >= formData.variants.length - 1
        ? Math.max(0, formData.variants.length - 2)
        : prev
    );
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index][field] = value;
      return { ...prev, variants: updatedVariants };
    });
  };

  const handleVariantImageChange = (variantIndex, imageUrl) => {
    if (
      imageUrl &&
      !formData.variants[variantIndex].images.includes(imageUrl)
    ) {
      setFormData((prev) => {
        const updatedVariants = [...prev.variants];
        updatedVariants[variantIndex].images = [
          ...updatedVariants[variantIndex].images,
          imageUrl,
        ];
        return { ...prev, variants: updatedVariants };
      });
    }
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[variantIndex].images = updatedVariants[
        variantIndex
      ].images.filter((_, i) => i !== imageIndex);
      return { ...prev, variants: updatedVariants };
    });
  };

  // Variant sizes
  const addSize = (variantIndex) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[variantIndex].sizes.push({
        size: 0,
        countInStock: 0,
        price: formData.price,
      });
      return { ...prev, variants: updatedVariants };
    });
  };

  const removeSize = (variantIndex, sizeIndex) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[variantIndex].sizes = updatedVariants[
        variantIndex
      ].sizes.filter((_, i) => i !== sizeIndex);
      return { ...prev, variants: updatedVariants };
    });
  };

  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[variantIndex].sizes[sizeIndex][field] =
        field === "size" || field === "countInStock" || field === "price"
          ? Number(value)
          : value;
      return { ...prev, variants: updatedVariants };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.description ||
      !formData.brand ||
      !formData.price
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const productData = {
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || Number(formData.price),
      countInStock: Number(formData.countInStock),
      weight: Number(formData.weight),
      dimensions: {
        length: Number(formData.dimensions.length),
        width: Number(formData.dimensions.width),
        height: Number(formData.dimensions.height),
      },
      discountPercentage:
        formData.originalPrice > 0
          ? Math.round(
              ((formData.originalPrice - formData.price) /
                formData.originalPrice) *
                100
            )
          : 0,
      specifications: { ...formData.specifications },
    };

    if (isEditing) {
      dispatch(updateProduct({ id: selectedProduct._id, productData }))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          toast.success("Product updated successfully");
        })
        .catch((error) => {
          toast.error(error.message || "Failed to update product");
        });
    } else {
      dispatch(createProduct(productData))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          toast.success("Product created successfully");
        })
        .catch((error) => {
          toast.error(error.message || "Failed to create product");
        });
    }
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id))
        .unwrap()
        .then(() => {
          toast.success("Product deleted successfully");
        })
        .catch((error) => {
          toast.error(error.message || "Failed to delete product");
        });
    }
  };

  const calculateTotalStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce(
        (total, variant) =>
          total +
          (variant.sizes
            ? variant.sizes.reduce(
                (sum, size) => sum + (Number(size.countInStock) || 0),
                0
              )
            : 0),
        0
      );
    }
    return product.countInStock || 0;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={openCreateModal}
          disabled={loading}
        >
          Add New Product
        </button>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Image</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">SKU</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Stock</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stockCount = calculateTotalStock(product);
            return (
              <tr key={product._id} className="border-b">
                <td className="p-2">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{ width: 50, height: 50, objectFit: "cover" }}
                    />
                  ) : (
                    "No image"
                  )}
                </td>
                <td className="p-2">{product.name}</td>
                <td className="p-2">{product.sku || "N/A"}</td>
                <td className="p-2">
                  {categories.find((c) => c._id === product.category)?.name ||
                    "Uncategorized"}
                </td>
                <td className="p-2">
                  {typeof product.price === "number"
                    ? `$${product.price.toFixed(2)}`
                    : "N/A"}
                  {typeof product.originalPrice === "number" &&
                    typeof product.price === "number" &&
                    product.originalPrice > product.price && (
                      <span className="line-through text-gray-400 ml-1">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                </td>

                <td className="p-2">{stockCount}</td>
                <td className="p-2">
                  {!product.isActive ? (
                    <span className="text-gray-600">Inactive</span>
                  ) : stockCount <= 0 ? (
                    <span className="text-red-600">Out of Stock</span>
                  ) : stockCount < 10 ? (
                    <span className="text-yellow-600">Low Stock</span>
                  ) : (
                    <span className="text-green-600">In Stock</span>
                  )}
                  {product.isFeatured && (
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      Featured
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                      New
                    </span>
                  )}
                </td>
                <td className="p-2">
                  <button
                    className="text-blue-600 mr-2"
                    onClick={() => openEditModal(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h3>

            {/* Tab Navigation */}
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 ${
                  activeTab === "basic"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : ""
                }`}
                onClick={() => setActiveTab("basic")}
              >
                Basic Info
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "images"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : ""
                }`}
                onClick={() => setActiveTab("images")}
              >
                Images
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "variants"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : ""
                }`}
                onClick={() => setActiveTab("variants")}
              >
                Variants
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "specs"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : ""
                }`}
                onClick={() => setActiveTab("specs")}
              >
                Specifications
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "meta"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : ""
                }`}
                onClick={() => setActiveTab("meta")}
              >
                SEO & Shipping
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">
                      Product Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Brand*</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      placeholder="Leave empty for auto-generation"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Status</label>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="isActive">Active</label>

                      <input
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className="ml-4 mr-2"
                      />
                      <label htmlFor="isFeatured">Featured</label>

                      <input
                        type="checkbox"
                        id="isNewArrival"
                        name="isNewArrival"
                        checked={formData.isNewArrival}
                        onChange={handleChange}
                        className="ml-4 mr-2"
                      />
                      <label htmlFor="isNewArrival">New Arrival</label>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1 font-medium">
                      Description*
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="w-full border p-2 rounded"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Price*</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min={0}
                      step={0.01}
                      required
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Original Price
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      min={0}
                      step={0.01}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Stock Count*
                    </label>
                    <input
                      type="number"
                      name="countInStock"
                      value={formData.countInStock}
                      onChange={handleChange}
                      min={0}
                      required
                      className="w-full border p-2 rounded"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This is used when no variants are specified
                    </p>
                  </div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === "images" && (
                <div>
                  <h4 className="font-medium mb-2">Product Images</h4>
                  <div className="flex mb-4">
                    <input
                      type="text"
                      placeholder="Enter image URL"
                      className="w-2/3 border p-2 rounded mr-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleImageChange(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bg-gray-200 px-4 py-2 rounded"
                      onClick={(e) =>
                        handleImageChange({
                          target: { value: e.target.previousSibling.value },
                        })
                      }
                    >
                      Add Image
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`Product ${idx}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow"
                          onClick={() => removeImage(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.images.length === 0 && (
                    <p className="text-gray-500 italic">No images added yet</p>
                  )}
                </div>
              )}

              {/* Variants Tab */}
              {activeTab === "variants" && (
                <div>
                  <div className="flex justify-between mb-4">
                    <h4 className="font-medium">Product Variants</h4>
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      onClick={addVariant}
                    >
                      Add Variant
                    </button>
                  </div>

                  {formData.variants.length > 0 ? (
                    <div>
                      <div className="flex border-b mb-4">
                        {formData.variants.map((variant, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`px-4 py-2 relative ${
                              activeVariantIndex === idx
                                ? "border-b-2 border-blue-500 text-blue-600"
                                : ""
                            }`}
                            onClick={() => setActiveVariantIndex(idx)}
                          >
                            {variant.color || `Variant ${idx + 1}`}
                            <span
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeVariant(idx);
                              }}
                            >
                              ×
                            </span>
                          </button>
                        ))}
                      </div>

                      {formData.variants[activeVariantIndex] && (
                        <div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block mb-1 font-medium">
                                Color Name
                              </label>
                              <input
                                type="text"
                                value={
                                  formData.variants[activeVariantIndex].color ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleVariantChange(
                                    activeVariantIndex,
                                    "color",
                                    e.target.value
                                  )
                                }
                                className="w-full border p-2 rounded"
                                placeholder="e.g. Red, Blue, etc."
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-medium">
                                Color Code
                              </label>
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  value={
                                    formData.variants[activeVariantIndex]
                                      .colorCode || ""
                                  }
                                  onChange={(e) =>
                                    handleVariantChange(
                                      activeVariantIndex,
                                      "colorCode",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border p-2 rounded"
                                  placeholder="#RRGGBB"
                                />
                                <input
                                  type="color"
                                  value={
                                    formData.variants[activeVariantIndex]
                                      .colorCode || "#000000"
                                  }
                                  onChange={(e) =>
                                    handleVariantChange(
                                      activeVariantIndex,
                                      "colorCode",
                                      e.target.value
                                    )
                                  }
                                  className="ml-2 h-10 w-10 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-medium mb-2">Variant Images</h5>
                            <div className="flex mb-4">
                              <input
                                type="text"
                                placeholder="Enter image URL"
                                className="w-2/3 border p-2 rounded mr-2"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleVariantImageChange(
                                      activeVariantIndex,
                                      e.target.value
                                    );
                                    e.target.value = "";
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="bg-gray-200 px-4 py-2 rounded"
                                onClick={(e) => {
                                  handleVariantImageChange(
                                    activeVariantIndex,
                                    e.target.previousSibling.value
                                  );
                                  e.target.previousSibling.value = "";
                                }}
                              >
                                Add Image
                              </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                              {formData.variants[activeVariantIndex].images.map(
                                (img, imgIdx) => (
                                  <div key={imgIdx} className="relative">
                                    <img
                                      src={img}
                                      alt={`Variant ${activeVariantIndex} image ${imgIdx}`}
                                      className="w-full h-32 object-cover rounded border"
                                    />
                                    <button
                                      type="button"
                                      className="absolute top-1 right-1 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow"
                                      onClick={() =>
                                        removeVariantImage(
                                          activeVariantIndex,
                                          imgIdx
                                        )
                                      }
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between mb-2">
                              <h5 className="font-medium">Sizes</h5>
                              <button
                                type="button"
                                className="bg-gray-200 px-3 py-1 rounded text-sm"
                                onClick={() => addSize(activeVariantIndex)}
                              >
                                Add Size
                              </button>
                            </div>

                            {formData.variants[activeVariantIndex].sizes
                              .length > 0 ? (
                              <div className="border rounded overflow-hidden">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="p-2 text-left">Size</th>
                                      <th className="p-2 text-left">Stock</th>
                                      <th className="p-2 text-left">Price</th>
                                      <th className="p-2 text-left">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {formData.variants[
                                      activeVariantIndex
                                    ].sizes.map((size, sizeIdx) => (
                                      <tr key={sizeIdx} className="border-t">
                                        <td className="p-2">
                                          <input
                                            type="number"
                                            value={size.size}
                                            onChange={(e) =>
                                              handleSizeChange(
                                                activeVariantIndex,
                                                sizeIdx,
                                                "size",
                                                e.target.value
                                              )
                                            }
                                            className="w-full border p-1 rounded"
                                          />
                                        </td>
                                        <td className="p-2">
                                          <input
                                            type="number"
                                            value={size.countInStock}
                                            onChange={(e) =>
                                              handleSizeChange(
                                                activeVariantIndex,
                                                sizeIdx,
                                                "countInStock",
                                                e.target.value
                                              )
                                            }
                                            min={0}
                                            className="w-full border p-1 rounded"
                                          />
                                        </td>
                                        <td className="p-2">
                                          <input
                                            type="number"
                                            value={size.price}
                                            onChange={(e) =>
                                              handleSizeChange(
                                                activeVariantIndex,
                                                sizeIdx,
                                                "price",
                                                e.target.value
                                              )
                                            }
                                            min={0}
                                            step={0.01}
                                            className="w-full border p-1 rounded"
                                          />
                                        </td>
                                        <td className="p-2">
                                          <button
                                            type="button"
                                            className="text-red-600"
                                            onClick={() =>
                                              removeSize(
                                                activeVariantIndex,
                                                sizeIdx
                                              )
                                            }
                                          >
                                            Remove
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">
                                No sizes added yet
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No variants added yet. Add a variant to specify different
                      colors and sizes.
                    </p>
                  )}
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === "specs" && (
                <div>
                  <h4 className="font-medium mb-4">Product Specifications</h4>

                  <div className="flex mb-4">
                    <input
                      type="text"
                      placeholder="Specification name"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      className="w-1/3 border p-2 rounded mr-2"
                    />
                    <input
                      type="text"
                      placeholder="Specification value"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      className="w-1/3 border p-2 rounded mr-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSpecification();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bg-gray-200 px-4 py-2 rounded"
                      onClick={addSpecification}
                    >
                      Add Spec
                    </button>
                  </div>

                  {Object.keys(formData.specifications).length > 0 ? (
                    <div className="border rounded overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left">Specification</th>
                            <th className="p-2 text-left">Value</th>
                            <th className="p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(formData.specifications).map(
                            ([key, value], idx) => (
                              <tr key={idx} className="border-t">
                                <td className="p-2">{key}</td>
                                <td className="p-2">{value}</td>
                                <td className="p-2">
                                  <button
                                    type="button"
                                    className="text-red-600"
                                    onClick={() => removeSpecification(key)}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No specifications added yet
                    </p>
                  )}
                </div>
              )}

              {/* SEO & Shipping Tab */}
              {activeTab === "meta" && (
                <div>
                  <h4 className="font-medium mb-4">SEO Information</h4>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                      <label className="block mb-1 font-medium">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        placeholder="Leave empty to use product name"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">
                        Meta Description
                      </label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        rows={3}
                        placeholder="Leave empty to use product description"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">
                        Meta Keywords
                      </label>
                      <div className="flex mb-2">
                        <input
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          className="w-2/3 border p-2 rounded mr-2"
                          placeholder="Enter keyword and press Add"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addKeyword();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="bg-gray-200 px-4 py-2 rounded"
                          onClick={addKeyword}
                        >
                          Add Keyword
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.metaKeywords.map((keyword, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                          >
                            {keyword}
                            <button
                              type="button"
                              className="ml-2 text-gray-500 hover:text-red-600"
                              onClick={() => removeKeyword(idx)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-medium mb-4">Shipping Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        min={0}
                        step={0.01}
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-medium">
                        Dimensions (cm)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm text-gray-600">
                            Length
                          </label>
                          <input
                            type="number"
                            name="dimensions.length"
                            value={formData.dimensions.length}
                            onChange={handleChange}
                            min={0}
                            step={0.1}
                            className="w-full border p-2 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600">
                            Width
                          </label>
                          <input
                            type="number"
                            name="dimensions.width"
                            value={formData.dimensions.width}
                            onChange={handleChange}
                            min={0}
                            step={0.1}
                            className="w-full border p-2 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600">
                            Height
                          </label>
                          <input
                            type="number"
                            name="dimensions.height"
                            value={formData.dimensions.height}
                            onChange={handleChange}
                            min={0}
                            step={0.1}
                            className="w-full border p-2 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                <button
                  type="button"
                  className="bg-gray-200 px-4 py-2 rounded"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  {isEditing ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
