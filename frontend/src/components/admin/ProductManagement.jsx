import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
} from "../../redux/slices/productSlice";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { products, categories, loading, error } = useSelector(
    (state) => state.product
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    originalPrice: "",
    countInStock: "",
    images: [""],
    gender: "unisex",
    isFeatured: false,
    isNewArrival: false,
    variants: [
      {
        color: "",
        colorCode: "#000000",
        images: [""],
        sizes: [{ size: "", countInStock: 0 }],
      },
    ],
  });

  // Fetch categories when component mounts
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" ||
            name === "countInStock" ||
            name === "originalPrice"
          ? Number(value)
          : value,
    });
  };

  // Handle image URL changes
  const handleImageChange = (index, value) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData({ ...formData, images: updatedImages });
  };

  // Add another image field
  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  // Handle variant changes
  const handleVariantChange = (variantIndex, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex][field] = value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  // Add a new variant
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          color: "",
          colorCode: "#000000",
          images: [""],
          sizes: [{ size: "", countInStock: 0 }],
        },
      ],
    });
  };

  // Handle size changes within variants
  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes[sizeIndex][field] =
      field === "countInStock" ? Number(value) : value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  // Add a new size to a variant
  const addSize = (variantIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes.push({ size: "", countInStock: 0 });
    setFormData({ ...formData, variants: updatedVariants });
  };

  // Open modal for creating a new product
  const handleAddProduct = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      brand: "",
      category: "",
      description: "",
      price: "",
      originalPrice: "",
      countInStock: "",
      images: [""],
      gender: "unisex",
      isFeatured: false,
      isNewArrival: false,
      variants: [
        {
          color: "",
          colorCode: "#000000",
          images: [""],
          sizes: [{ size: "", countInStock: 0 }],
        },
      ],
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing product
  const handleEditProduct = (product) => {
    setIsEditing(true);
    setSelectedProduct(product);

    // Transform product data to match form structure
    const formattedProduct = {
      name: product.name,
      brand: product.brand,
      category: product.category?._id || product.category,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      countInStock: product.countInStock,
      images: product.images?.length ? product.images : [""],
      gender: product.gender || "unisex",
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false,
      variants: product.variants?.length
        ? product.variants
        : [
            {
              color: "",
              colorCode: "#000000",
              images: [""],
              sizes: [{ size: "", countInStock: 0 }],
            },
          ],
    };

    setFormData(formattedProduct);
    setIsModalOpen(true);
  };

  // In handleSubmit function of ProductManagement.jsx
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Clean up empty fields
  const cleanedData = {
    ...formData,
    // Only include category if it has a value
    ...(formData.category ? { category: formData.category } : {}),
    images: formData.images.filter(img => img.trim() !== ''),
    variants: formData.variants.map(variant => ({
      ...variant,
      images: variant.images.filter(img => img.trim() !== ''),
      sizes: variant.sizes.filter(size => size.size !== '')
    })).filter(variant => variant.color !== '')
  };
  
  if (isEditing && selectedProduct) {
    dispatch(updateProduct({ id: selectedProduct._id, productData: cleanedData }));
  } else {
    dispatch(createProduct(cleanedData));
  }
  
  setIsModalOpen(false);
};

  // Handle product deletion
  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(productId));
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error:{" "}
          {typeof error === "string"
            ? error
            : error.message || "An unknown error occurred"}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add New Product
        </button>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products &&
              products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded object-cover"
                          src={
                            product.images?.[0] ||
                            "https://via.placeholder.com/150"
                          }
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {typeof product.category === "object"
                        ? product.category?.name
                        : product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${product.price?.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.countInStock === 0
                          ? "bg-red-100 text-red-800"
                          : product.countInStock <= 5
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.countInStock === 0
                        ? "Out of Stock"
                        : product.countInStock <= 5
                        ? `Low: ${product.countInStock}`
                        : product.countInStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div>
                  <h3 className="font-semibold mb-2 border-b pb-1">
                    Basic Information
                  </h3>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="name"
                    >
                      Product Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="brand"
                    >
                      Brand*
                    </label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>

                  <div className="mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
    Category
  </label>
  <select
    id="category"
    name="category"
    value={formData.category}
    onChange={handleChange}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  >
    <option value="sneaker">Select a category</option>
    {categories && categories.length > 0 ? (
      categories.map(category => (
        <option key={category._id} value={category._id}>
          {category.name}
        </option>
      ))
    ) : (
      <option value="sneaker" disabled>No categories available</option>
    )}
  </select>
</div>


                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="gender"
                    >
                      Gender*
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="description"
                    >
                      Description*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Pricing and Inventory */}
                <div>
                  <h3 className="font-semibold mb-2 border-b pb-1">
                    Pricing & Inventory
                  </h3>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="price"
                    >
                      Price*
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="originalPrice"
                    >
                      Original Price (before discount)
                    </label>
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="countInStock"
                    >
                      Count In Stock*
                    </label>
                    <input
                      type="number"
                      id="countInStock"
                      name="countInStock"
                      value={formData.countInStock}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      min="0"
                      required
                    />
                  </div>

                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label
                      className="text-gray-700 text-sm font-bold"
                      htmlFor="isFeatured"
                    >
                      Featured Product
                    </label>
                  </div>

                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="isNewArrival"
                      name="isNewArrival"
                      checked={formData.isNewArrival}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label
                      className="text-gray-700 text-sm font-bold"
                      htmlFor="isNewArrival"
                    >
                      New Arrival
                    </label>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2 border-b pb-1">
                  Product Images
                </h3>
                {formData.images.map((image, index) => (
                  <div
                    key={`image-${index}`}
                    className="mb-2 flex items-center"
                  >
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="Image URL"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {index === formData.images.length - 1 && (
                      <button
                        type="button"
                        onClick={addImageField}
                        className="ml-2 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Variants */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2 border-b pb-1">
                  Product Variants
                </h3>
                {formData.variants.map((variant, variantIndex) => (
                  <div
                    key={`variant-${variantIndex}`}
                    className="mb-6 p-4 border rounded"
                  >
                    <h4 className="font-medium mb-2">
                      Variant {variantIndex + 1}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Color Name
                        </label>
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "color",
                              e.target.value
                            )
                          }
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Color Code
                        </label>
                        <input
                          type="color"
                          value={variant.colorCode}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "colorCode",
                              e.target.value
                            )
                          }
                          className="shadow appearance-none border rounded w-full py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Sizes</h5>
                      {variant.sizes.map((size, sizeIndex) => (
                        <div
                          key={`size-${variantIndex}-${sizeIndex}`}
                          className="flex items-center mb-2"
                        >
                          <input
                            type="text"
                            placeholder="Size (e.g., 42)"
                            value={size.size}
                            onChange={(e) =>
                              handleSizeChange(
                                variantIndex,
                                sizeIndex,
                                "size",
                                e.target.value
                              )
                            }
                            className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                          />
                          <input
                            type="number"
                            placeholder="Stock"
                            value={size.countInStock}
                            onChange={(e) =>
                              handleSizeChange(
                                variantIndex,
                                sizeIndex,
                                "countInStock",
                                e.target.value
                              )
                            }
                            className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            min="0"
                          />
                          {sizeIndex === variant.sizes.length - 1 && (
                            <button
                              type="button"
                              onClick={() => addSize(variantIndex)}
                              className="ml-2 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                            >
                              +
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVariant}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Add Variant
                </button>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Product"}
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
