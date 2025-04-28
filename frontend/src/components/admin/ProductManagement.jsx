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

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { products, categories, loading, error } = useSelector((state) => state.product);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  const [formData, setFormData] = useState({
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
  });

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
    setFormData({
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
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      brand: product.brand || "",
      category: product.category || "",
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      countInStock: product.countInStock || 0,
      gender: product.gender || "unisex",
      images: product.images || [],
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false,
      variants: product.variants || [],
      specifications: product.specifications || {},
      isActive: product.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const imageUrl = e.target.value;
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl],
      });
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.brand || !formData.price) {
      toast.error("Please fill all required fields");
      return;
    }
    const productData = {
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || Number(formData.price),
      countInStock: Number(formData.countInStock),
      discountPercentage:
        formData.originalPrice > 0
          ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
          : 0,
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

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openCreateModal} disabled={loading}>
          Add New Product
        </button>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stockCount = product.variants && product.variants.length > 0
              ? product.variants.reduce((total, v) =>
                  total + (v.sizes ? v.sizes.reduce((sum, s) => sum + (Number(s.countInStock) || 0), 0) : 0), 0)
              : product.countInStock;
            return (
              <tr key={product._id} className="border-b">
                <td>
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} style={{ width: 50, height: 50, objectFit: "cover" }} />
                  ) : (
                    "No image"
                  )}
                </td>
                <td>{product.name}</td>
                <td>{categories.find((c) => c._id === product.category)?.name || "Uncategorized"}</td>
                <td>
                  ${product.price.toFixed(2)}
                  {product.originalPrice > product.price && (
                    <span className="line-through text-gray-400 ml-1">${product.originalPrice.toFixed(2)}</span>
                  )}
                </td>
                <td>{stockCount}</td>
                <td>
                  {stockCount <= 0
                    ? <span className="text-red-600">Out of Stock</span>
                    : stockCount < 10
                    ? <span className="text-yellow-600">Low Stock</span>
                    : <span className="text-green-600">In Stock</span>
                  }
                  {product.isFeatured && <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Featured</span>}
                  {product.isNewArrival && <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">New</span>}
                </td>
                <td>
                  <button className="text-blue-600 mr-2" onClick={() => openEditModal(product)}>Edit</button>
                  <button className="text-red-600" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit Product" : "Add New Product"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Product Name*</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Brand*</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} required className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded">
                    <option value="Uncategorised">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded">
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1 font-medium">Description*</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full border p-2 rounded" rows={3} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Price*</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} min={0} step={0.01} required className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Original Price</label>
                  <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min={0} step={0.01} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Stock Count*</label>
                  <input type="number" name="countInStock" value={formData.countInStock} onChange={handleChange} min={0} required className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Featured</label>
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="ml-2" />
                  <span className="ml-2">New Arrival</span>
                  <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="ml-2" />
                  <span className="ml-2">Active</span>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="ml-2" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1 font-medium">Product Images</label>
                  <input type="text" placeholder="Enter image URL and press Add" className="w-2/3 border p-2 rounded mr-2" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleImageChange(e); } }} />
                  <button type="button" className="bg-gray-200 px-2 py-1 rounded" onClick={e => handleImageChange({ target: { value: e.target.previousSibling.value } })}>Add</button>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16">
                        <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover rounded" />
                        <button type="button" className="absolute top-0 right-0 bg-white text-red-600 rounded-full px-1" onClick={() => removeImage(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
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
