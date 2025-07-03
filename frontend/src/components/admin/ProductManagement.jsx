// src/components/admin/ProductManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
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

  // Enhanced state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [formData, setFormData] = useState({ ...initialFormData });

  // Form helpers
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  // Trigger animations
  useEffect(() => {
    setAnimateCards(true);
  }, []);

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

  // Enhanced filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter(product => {
      // Search filter
      const searchMatch = !searchTerm || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && product.isActive) ||
        (statusFilter === 'inactive' && !product.isActive) ||
        (statusFilter === 'featured' && product.isFeatured) ||
        (statusFilter === 'low-stock' && calculateTotalStock(product) < 10) ||
        (statusFilter === 'out-of-stock' && calculateTotalStock(product) === 0);

      // Category filter
      const categoryMatch = categoryFilter === 'all' || product.category === categoryFilter;

      return searchMatch && statusMatch && categoryMatch;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'stock':
          aValue = calculateTotalStock(a);
          bValue = calculateTotalStock(b);
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Calculate product statistics
  const productStats = useMemo(() => {
    if (!products) return {};

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const featuredProducts = products.filter(p => p.isFeatured).length;
    const lowStockProducts = products.filter(p => calculateTotalStock(p) < 10).length;
    const outOfStockProducts = products.filter(p => calculateTotalStock(p) === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * calculateTotalStock(p)), 0);

    return {
      totalProducts,
      activeProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue
    };
  }, [products]);

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

  // Image management
  const handleImageChange = (e) => {
    const imageUrl = e.target.value.trim();
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

  // Specification management
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

  // Keyword management
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

  // Variant management
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

  // Size management
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

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
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

  // Enhanced bulk actions
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = (action) => {
    // Implementation for bulk actions
    console.log(`Bulk action: ${action} on products:`, selectedProducts);
    setSelectedProducts([]);
    setShowBulkActions(false);
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

  const getStockStatus = (product) => {
    const stock = calculateTotalStock(product);
    if (!product.isActive) return { status: 'Inactive', color: 'from-gray-500 to-gray-600', icon: 'fa-pause' };
    if (stock === 0) return { status: 'Out of Stock', color: 'from-red-500 to-red-600', icon: 'fa-times-circle' };
    if (stock < 10) return { status: 'Low Stock', color: 'from-yellow-500 to-orange-500', icon: 'fa-exclamation-triangle' };
    return { status: 'In Stock', color: 'from-green-500 to-green-600', icon: 'fa-check-circle' };
  };

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'fa-info-circle' },
    { id: 'images', label: 'Images', icon: 'fa-images' },
    { id: 'variants', label: 'Variants', icon: 'fa-palette' },
    { id: 'specs', label: 'Specifications', icon: 'fa-list-ul' },
    { id: 'meta', label: 'SEO & Shipping', icon: 'fa-search' }
  ];

  if (loading && (!products || products.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              <i className="fas fa-box mr-2 text-blue-500"></i>
              Loading Products
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              <i className="fas fa-database mr-2"></i>
              Fetching product data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                <i className="fas fa-box mr-3"></i>
                Product Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                <i className="fas fa-store mr-2"></i>
                Manage your product catalog and inventory
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openCreateModal}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Product
              </button>
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105">
                <i className="fas fa-file-import mr-2"></i>
                Import
              </button>
              <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105">
                <i className="fas fa-file-export mr-2"></i>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {[
          {
            title: 'Total Products',
            value: productStats.totalProducts?.toLocaleString() || '0',
            icon: 'fa-box',
            color: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Active Products',
            value: productStats.activeProducts?.toLocaleString() || '0',
            icon: 'fa-check-circle',
            color: 'from-green-500 to-green-600'
          },
          {
            title: 'Featured',
            value: productStats.featuredProducts?.toLocaleString() || '0',
            icon: 'fa-star',
            color: 'from-yellow-500 to-orange-500'
          },
          {
            title: 'Low Stock',
            value: productStats.lowStockProducts?.toLocaleString() || '0',
            icon: 'fa-exclamation-triangle',
            color: 'from-orange-500 to-red-500'
          },
          {
            title: 'Out of Stock',
            value: productStats.outOfStockProducts?.toLocaleString() || '0',
            icon: 'fa-times-circle',
            color: 'from-red-500 to-red-600'
          },
          {
            title: 'Total Value',
            value: `$${productStats.totalValue?.toLocaleString() || '0'}`,
            icon: 'fa-dollar-sign',
            color: 'from-purple-500 to-purple-600'
          }
        ].map((stat, index) => (
          <div
            key={index}
            className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden ${
              animateCards ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <i className={`fas ${stat.icon} text-white text-lg`}></i>
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Controls */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products, brands, or SKUs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <i className="fas fa-search text-gray-400"></i>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all" className="bg-gray-800 text-white">All Products</option>
                <option value="active" className="bg-gray-800 text-white">Active</option>
                <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
                <option value="featured" className="bg-gray-800 text-white">Featured</option>
                <option value="low-stock" className="bg-gray-800 text-white">Low Stock</option>
                <option value="out-of-stock" className="bg-gray-800 text-white">Out of Stock</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <i className="fas fa-filter text-gray-400"></i>
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all" className="bg-gray-800 text-white">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id} className="bg-gray-800 text-white">
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <i className="fas fa-tags text-gray-400"></i>
              </div>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="appearance-none bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="createdAt-desc" className="bg-gray-800 text-white">Newest First</option>
                <option value="createdAt-asc" className="bg-gray-800 text-white">Oldest First</option>
                <option value="name-asc" className="bg-gray-800 text-white">Name A-Z</option>
                <option value="name-desc" className="bg-gray-800 text-white">Name Z-A</option>
                <option value="price-asc" className="bg-gray-800 text-white">Price Low-High</option>
                <option value="price-desc" className="bg-gray-800 text-white">Price High-Low</option>
                <option value="stock-asc" className="bg-gray-800 text-white">Stock Low-High</option>
                <option value="stock-desc" className="bg-gray-800 text-white">Stock High-Low</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <i className="fas fa-sort text-gray-400"></i>
              </div>
            </div>
          </div>

          {/* View Mode and Bulk Actions */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <i className="fas fa-table"></i>
              </button>
            </div>

            {/* Results Count */}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <i className="fas fa-box mr-1"></i>
              {filteredAndSortedProducts.length} products
            </span>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedProducts.length} selected
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200"
                >
                  <i className="fas fa-list mr-2"></i>
                  Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Menu */}
        {showBulkActions && selectedProducts.length > 0 && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-check-circle mr-2"></i>
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-pause-circle mr-2"></i>
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('feature')}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-star mr-2"></i>
                Feature
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-trash mr-2"></i>
                Delete
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-times mr-2"></i>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Products Display */}
      {viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentProducts.map((product, index) => {
            const stockInfo = getStockStatus(product);
            const stockCount = calculateTotalStock(product);
            return (
              <div
                key={product._id}
                className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all duration-500 relative group ${
                  animateCards ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => toggleProductSelection(product._id)}
                    className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                  />
                </div>

                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {product.isFeatured && (
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        <i className="fas fa-star mr-1"></i>Featured
                      </span>
                    )}
                    {product.isNewArrival && (
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        <i className="fas fa-sparkles mr-1"></i>New
                      </span>
                    )}
                    {product.originalPrice > product.price && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        <i className="fas fa-percentage mr-1"></i>
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => openEditModal(product)}
                      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id, product.name)}
                      className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Brand and SKU */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {product.brand}
                    </span>
                    {product.sku && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>

                  {/* Category */}
                  <div className="flex items-center mb-3">
                    <i className="fas fa-tag text-purple-500 mr-2"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {categories.find(c => c._id === product.category)?.name || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ${product.price?.toFixed(2)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${product.originalPrice?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <i className={`fas ${stockInfo.icon} text-sm mr-2`}></i>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Stock: {stockCount}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${stockInfo.color} text-white`}>
                      {stockInfo.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id, product.name)}
                      className="w-12 h-10 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl flex items-center justify-center transition-all duration-200"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Enhanced Table View */
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20 dark:divide-gray-700/20">
              <thead className="bg-white/10 backdrop-blur-lg">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(currentProducts.map(p => p._id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-image mr-2"></i>Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-barcode mr-2"></i>SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-tags mr-2"></i>Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-dollar-sign mr-2"></i>Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-boxes mr-2"></i>Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-info-circle mr-2"></i>Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-cog mr-2"></i>Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-gray-700/20">
                {currentProducts.map((product, index) => {
                  const stockInfo = getStockStatus(product);
                  const stockCount = calculateTotalStock(product);
                  return (
                    <tr
                      key={product._id}
                      className={`hover:bg-white/10 transition-all duration-200 ${
                        animateCards ? 'animate-fade-in' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => toggleProductSelection(product._id)}
                          className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-16 h-16 mr-4">
                            <img
                              src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=100&auto=format&fit=crop'}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-2xl shadow-lg"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white max-w-xs truncate">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {product.brand}
                            </div>
                            <div className="flex space-x-1 mt-1">
                              {product.isFeatured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                  <i className="fas fa-star mr-1"></i>Featured
                                </span>
                              )}
                              {product.isNewArrival && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                  <i className="fas fa-sparkles mr-1"></i>New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 dark:text-white">
                          {product.sku || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {categories.find(c => c._id === product.category)?.name || 'Uncategorized'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${product.price?.toFixed(2)}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {stockCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${stockInfo.color} text-white`}>
                          <i className={`fas ${stockInfo.icon} mr-1`}></i>
                          {stockInfo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                          >
                            <i className="fas fa-edit mr-2"></i>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} mr-3 text-blue-500`}></i>
                    {isEditing ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {isEditing ? "Update product information" : "Create a new product in your catalog"}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white/20 transition-all duration-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Enhanced Tab Navigation */}
            <div className="bg-white/5 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/20 p-4">
              <div className="flex space-x-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`fas ${tab.icon}`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                
                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          <i className="fas fa-tag mr-2 text-blue-500"></i>
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          <i className="fas fa-building mr-2 text-green-500"></i>
                          Brand *
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter brand name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          <i className="fas fa-barcode mr-2 text-purple-500"></i>
                          SKU
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Leave empty for auto-generation"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          <i className="fas fa-list mr-2 text-orange-500"></i>
                          Category
                        </label>
                        <div className="relative">
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                          >
                            <option value="" className="bg-gray-800 text-white">Select a category</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id} className="bg-gray-800 text-white">
                                {category.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <i className="fas fa-chevron-down text-gray-400"></i>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          <i className="fas fa-venus-mars mr-2 text-pink-500"></i>
                          Gender
                        </label>
                        <div className="relative">
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                          >
                            <option value="men" className="bg-gray-800 text-white">Men</option>
                            <option value="women" className="bg-gray-800 text-white">Women</option>
                            <option value="unisex" className="bg-gray-800 text-white">Unisex</option>
                          </select>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <i className="fas fa-chevron-down text-gray-400"></i>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          <i className="fas fa-align-left mr-2 text-cyan-500"></i>
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                          placeholder="Enter product description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          <i className="fas fa-dollar-sign mr-2 text-green-500"></i>
                          Price *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          min={0}
                          step={0.01}
                          required
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          <i className="fas fa-tag mr-2 text-red-500"></i>
                          Original Price
                        </label>
                        <input
                          type="number"
                          name="originalPrice"
                          value={formData.originalPrice}
                          onChange={handleChange}
                          min={0}
                          step={0.01}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          <i className="fas fa-boxes mr-2 text-blue-500"></i>
                          Stock Count *
                        </label>
                        <input
                          type="number"
                          name="countInStock"
                          value={formData.countInStock}
                          onChange={handleChange}
                          min={0}
                          required
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Used when no variants are specified
                        </p>
                      </div>
                    </div>

                    {/* Status Checkboxes */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        <i className="fas fa-toggle-on mr-2 text-purple-500"></i>
                        Product Status
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'isActive', label: 'Active', icon: 'fa-power-off', color: 'text-green-500' },
                          { id: 'isFeatured', label: 'Featured', icon: 'fa-star', color: 'text-yellow-500' },
                          { id: 'isNewArrival', label: 'New Arrival', icon: 'fa-sparkles', color: 'text-purple-500' }
                        ].map((status) => (
                          <label key={status.id} className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                id={status.id}
                                name={status.id}
                                checked={formData[status.id]}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <div className={`w-6 h-6 rounded-lg border-2 border-white/30 flex items-center justify-center transition-all duration-200 ${
                                formData[status.id] ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400' : 'bg-white/10 group-hover:bg-white/20'
                              }`}>
                                {formData[status.id] && <i className="fas fa-check text-white text-sm"></i>}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className={`fas ${status.icon} ${status.color}`}></i>
                              <span className="text-gray-900 dark:text-white font-medium">{status.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Images Tab */}
                {activeTab === "images" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        <i className="fas fa-images mr-2 text-blue-500"></i>
                        Product Images
                      </h4>
                      
                      {/* Add Image Section */}
                      <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 mb-6">
                        <div className="flex gap-4">
                          <input
                            type="text"
                            placeholder="Enter image URL"
                            className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleImageChange(e);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
                            onClick={(e) => {
                              const input = e.target.previousElementSibling;
                              handleImageChange({ target: { value: input.value } });
                              input.value = '';
                            }}
                          >
                            <i className="fas fa-plus mr-2"></i>
                            Add Image
                          </button>
                        </div>
                      </div>

                      {/* Image Grid */}
                      {formData.images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <div className="aspect-w-1 aspect-h-1 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl overflow-hidden">
                                <img
                                  src={img}
                                  alt={`Product ${idx + 1}`}
                                  className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <button
                                type="button"
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                onClick={() => removeImage(idx)}
                              >
                                <i className="fas fa-times text-sm"></i>
                              </button>
                              {idx === 0 && (
                                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                  <i className="fas fa-star mr-1"></i>Primary
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl">
                          <i className="fas fa-images text-6xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No images added yet</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm">Add product images to showcase your product</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Continue with other tabs... */}
                {/* For brevity, I'll show the structure for other tabs */}
                
                {/* Variants Tab */}
                {activeTab === "variants" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        <i className="fas fa-palette mr-2 text-purple-500"></i>
                        Product Variants
                      </h4>
                      <button
                        type="button"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200"
                        onClick={addVariant}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Add Variant
                      </button>
                    </div>

                    {formData.variants.length > 0 ? (
                      <div>
                        {/* Variant Tabs */}
                        <div className="flex border-b border-white/20 dark:border-gray-700/20 mb-6 overflow-x-auto">
                          {formData.variants.map((variant, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`relative px-6 py-3 font-semibold transition-all duration-200 whitespace-nowrap ${
                                activeVariantIndex === idx
                                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              }`}
                              onClick={() => setActiveVariantIndex(idx)}
                            >
                              <span className="flex items-center space-x-2">
                                {variant.colorCode && (
                                  <div
                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: variant.colorCode }}
                                  ></div>
                                )}
                                <span>{variant.color || `Variant ${idx + 1}`}</span>
                              </span>
                              <button
                                type="button"
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeVariant(idx);
                                }}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </button>
                          ))}
                        </div>

                        {/* Variant Content */}
                        {formData.variants[activeVariantIndex] && (
                          <div className="space-y-6">
                            {/* Color Information */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  <i className="fas fa-palette mr-2 text-purple-500"></i>
                                  Color Name
                                </label>
                                <input
                                  type="text"
                                  value={formData.variants[activeVariantIndex].color || ""}
                                  onChange={(e) =>
                                    handleVariantChange(activeVariantIndex, "color", e.target.value)
                                  }
                                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  placeholder="e.g. Red, Blue, etc."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  <i className="fas fa-eye-dropper mr-2 text-pink-500"></i>
                                  Color Code
                                </label>
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="text"
                                    value={formData.variants[activeVariantIndex].colorCode || ""}
                                    onChange={(e) =>
                                      handleVariantChange(activeVariantIndex, "colorCode", e.target.value)
                                    }
                                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="#RRGGBB"
                                  />
                                  <input
                                    type="color"
                                    value={formData.variants[activeVariantIndex].colorCode || "#000000"}
                                    onChange={(e) =>
                                      handleVariantChange(activeVariantIndex, "colorCode", e.target.value)
                                    }
                                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white/20"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Variant Images */}
                            <div>
                              <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                                <i className="fas fa-images mr-2 text-cyan-500"></i>
                                Variant Images
                              </h5>
                              
                              <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 mb-4">
                                <div className="flex gap-4">
                                  <input
                                    type="text"
                                    placeholder="Enter image URL for this variant"
                                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleVariantImageChange(activeVariantIndex, e.target.value);
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
                                    onClick={(e) => {
                                      const input = e.target.previousElementSibling;
                                      handleVariantImageChange(activeVariantIndex, input.value);
                                      input.value = "";
                                    }}
                                  >
                                    <i className="fas fa-plus mr-2"></i>
                                    Add
                                  </button>
                                </div>
                              </div>

                              {formData.variants[activeVariantIndex].images.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                  {formData.variants[activeVariantIndex].images.map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative group">
                                      <div className="aspect-w-1 aspect-h-1 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl overflow-hidden">
                                        <img
                                          src={img}
                                          alt={`Variant ${activeVariantIndex} image ${imgIdx}`}
                                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        onClick={() => removeVariantImage(activeVariantIndex, imgIdx)}
                                      >
                                        <i className="fas fa-times text-xs"></i>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-white/5 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl">
                                  <i className="fas fa-images text-4xl text-gray-400 mb-2"></i>
                                  <p className="text-gray-500 dark:text-gray-400">No variant images added</p>
                                </div>
                              )}
                            </div>

                            {/* Sizes Management */}
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="text-md font-semibold text-gray-900 dark:text-white">
                                  <i className="fas fa-ruler mr-2 text-orange-500"></i>
                                  Available Sizes
                                </h5>
                                <button
                                  type="button"
                                  className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200"
                                  onClick={() => addSize(activeVariantIndex)}
                                >
                                  <i className="fas fa-plus mr-2"></i>
                                  Add Size
                                </button>
                              </div>

                              {formData.variants[activeVariantIndex].sizes.length > 0 ? (
                                <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                      <thead className="bg-white/10">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            <i className="fas fa-ruler mr-2"></i>Size
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            <i className="fas fa-boxes mr-2"></i>Stock
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            <i className="fas fa-dollar-sign mr-2"></i>Price
                                          </th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            <i className="fas fa-cog mr-2"></i>Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/20 dark:divide-gray-700/20">
                                        {formData.variants[activeVariantIndex].sizes.map((size, sizeIdx) => (
                                          <tr key={sizeIdx} className="hover:bg-white/5">
                                            <td className="px-4 py-3">
                                              <input
                                                type="number"
                                                value={size.size}
                                                onChange={(e) =>
                                                  handleSizeChange(activeVariantIndex, sizeIdx, "size", e.target.value)
                                                }
                                                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                min="0"
                                              />
                                            </td>
                                            <td className="px-4 py-3">
                                              <input
                                                type="number"
                                                value={size.countInStock}
                                                onChange={(e) =>
                                                  handleSizeChange(activeVariantIndex, sizeIdx, "countInStock", e.target.value)
                                                }
                                                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                min="0"
                                              />
                                            </td>
                                            <td className="px-4 py-3">
                                              <input
                                                type="number"
                                                value={size.price}
                                                onChange={(e) =>
                                                  handleSizeChange(activeVariantIndex, sizeIdx, "price", e.target.value)
                                                }
                                                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                min="0"
                                                step="0.01"
                                              />
                                            </td>
                                            <td className="px-4 py-3">
                                              <button
                                                type="button"
                                                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-2 px-3 rounded-xl transition-all duration-200"
                                                onClick={() => removeSize(activeVariantIndex, sizeIdx)}
                                              >
                                                <i className="fas fa-trash"></i>
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-white/5 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl">
                                  <i className="fas fa-ruler text-4xl text-gray-400 mb-2"></i>
                                  <p className="text-gray-500 dark:text-gray-400">No sizes added yet</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl">
                        <i className="fas fa-palette text-6xl text-gray-400 mb-4"></i>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No variants added yet</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                          Add variants to specify different colors and sizes for your product
                        </p>
                        <button
                          type="button"
                          onClick={addVariant}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Your First Variant
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Specifications Tab */}
                {activeTab === "specs" && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      <i className="fas fa-list-ul mr-2 text-green-500"></i>
                      Product Specifications
                    </h4>

                    {/* Add Specification */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="Specification name (e.g., Material)"
                          value={newSpecKey}
                          onChange={(e) => setNewSpecKey(e.target.value)}
                          className="px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                          type="text"
                          placeholder="Specification value (e.g., Leather)"
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                          className="px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSpecification();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
                          onClick={addSpecification}
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Spec
                        </button>
                      </div>
                    </div>

                    {/* Specifications List */}
                    {Object.keys(formData.specifications).length > 0 ? (
                      <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-white/10">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                  <i className="fas fa-tag mr-2"></i>Specification
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                  <i className="fas fa-info mr-2"></i>Value
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                  <i className="fas fa-cog mr-2"></i>Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20 dark:divide-gray-700/20">
                              {Object.entries(formData.specifications).map(([key, value], idx) => (
                                <tr key={idx} className="hover:bg-white/5">
                                  <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{key}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{value}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      type="button"
                                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                                      onClick={() => removeSpecification(key)}
                                    >
                                      <i className="fas fa-trash mr-2"></i>
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/5 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl">
                        <i className="fas fa-list-ul text-6xl text-gray-400 mb-4"></i>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No specifications added yet</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          Add product specifications to provide detailed information to customers
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* SEO & Shipping Tab */}
                {activeTab === "meta" && (
                  <div className="space-y-8">
                    
                    {/* SEO Section */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        <i className="fas fa-search mr-2 text-blue-500"></i>
                        SEO Information
                      </h4>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            <i className="fas fa-heading mr-2 text-purple-500"></i>
                            Meta Title
                          </label>
                          <input
                            type="text"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Leave empty to use product name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            <i className="fas fa-align-left mr-2 text-green-500"></i>
                            Meta Description
                          </label>
                          <textarea
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                            placeholder="Leave empty to use product description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            <i className="fas fa-tags mr-2 text-yellow-500"></i>
                            Meta Keywords
                          </label>
                          <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 mb-4">
                            <div className="flex gap-4">
                              <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
                                onClick={addKeyword}
                              >
                                <i className="fas fa-plus mr-2"></i>
                                Add
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.metaKeywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full text-sm font-medium"
                              >
                                {keyword}
                                <button
                                  type="button"
                                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                  onClick={() => removeKeyword(idx)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Section */}
                    <div className="border-t border-white/20 dark:border-gray-700/20 pt-8">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        <i className="fas fa-shipping-fast mr-2 text-cyan-500"></i>
                        Shipping Information
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            <i className="fas fa-weight mr-2 text-orange-500"></i>
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            min={0}
                            step={0.01}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="lg:col-span-1">
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            <i className="fas fa-cube mr-2 text-pink-500"></i>
                            Dimensions (cm)
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Length</label>
                              <input
                                type="number"
                                name="dimensions.length"
                                value={formData.dimensions.length}
                                onChange={handleChange}
                                min={0}
                                step={0.1}
                                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="0.0"
                              />
                            </div>
                                                      <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Width</label>
                              <input
                                type="number"
                                name="dimensions.width"
                                value={formData.dimensions.width}
                                onChange={handleChange}
                                min={0}
                                step={0.1}
                                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="0.0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Height</label>
                              <input
                                type="number"
                                name="dimensions.height"
                                value={formData.dimensions.height}
                                onChange={handleChange}
                                min={0}
                                step={0.1}
                                className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="0.0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Shipping Options */}
                      <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-700/20">
                        <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                          <i className="fas fa-truck mr-2 text-blue-500"></i>
                          Shipping Options
                        </h5>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            {[
                              { id: 'freeShipping', label: 'Free Shipping', icon: 'fa-truck', color: 'text-green-500' },
                              { id: 'expressShipping', label: 'Express Shipping Available', icon: 'fa-bolt', color: 'text-yellow-500' },
                              { id: 'internationalShipping', label: 'International Shipping', icon: 'fa-globe', color: 'text-blue-500' },
                              { id: 'fragileItem', label: 'Fragile Item', icon: 'fa-exclamation-triangle', color: 'text-red-500' }
                            ].map((option) => (
                              <label key={option.id} className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    id={option.id}
                                    name={option.id}
                                    checked={formData[option.id] || false}
                                    onChange={handleChange}
                                    className="sr-only"
                                  />
                                  <div className={`w-6 h-6 rounded-lg border-2 border-white/30 flex items-center justify-center transition-all duration-200 ${
                                    formData[option.id] ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400' : 'bg-white/10 group-hover:bg-white/20'
                                  }`}>
                                    {formData[option.id] && <i className="fas fa-check text-white text-sm"></i>}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <i className={`fas ${option.icon} ${option.color}`}></i>
                                  <span className="text-gray-900 dark:text-white font-medium">{option.label}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                          
                          {/* Shipping Cost Calculator */}
                          <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6">
                            <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                              <i className="fas fa-calculator mr-2 text-purple-500"></i>
                              Estimated Shipping Cost
                            </h6>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Standard Shipping:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formData.freeShipping ? 'Free' : '$5.99'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Express Shipping:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formData.expressShipping ? '$12.99' : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">International:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formData.internationalShipping ? '$25.99' : 'N/A'}
                                </span>
                              </div>
                              {formData.fragileItem && (
                                <div className="flex justify-between items-center pt-2 border-t border-white/20 dark:border-gray-700/20">
                                  <span className="text-red-600 dark:text-red-400 text-sm">Fragile Handling:</span>
                                  <span className="font-semibold text-red-600 dark:text-red-400">+$3.99</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Modal Footer */}
                <div className="sticky bottom-0 bg-white/10 backdrop-blur-lg border-t border-white/20 dark:border-gray-700/20 p-6 mt-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    {/* Form Progress Indicator */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <i className="fas fa-info-circle text-blue-500"></i>
                      <span>
                        Tab {tabs.findIndex(tab => tab.id === activeTab) + 1} of {tabs.length}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {Object.keys(formData).filter(key => 
                          key !== 'variants' && key !== 'images' && key !== 'specifications' && 
                          key !== 'metaKeywords' && formData[key] && formData[key] !== 0
                        ).length} fields completed
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      
                      {/* Save as Draft Button */}
                      <button
                        type="button"
                        className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/20 transition-all duration-200"
                        onClick={() => {
                          // Save as draft logic
                          const draftData = { ...formData, isActive: false };
                          console.log('Saving as draft:', draftData);
                        }}
                      >
                        <i className="fas fa-save mr-2"></i>
                        Save as Draft
                      </button>

                      {/* Cancel Button */}
                      <button
                        type="button"
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                        onClick={() => setIsModalOpen(false)}
                      >
                        <i className="fas fa-times mr-2"></i>
                        Cancel
                      </button>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading || !formData.name || !formData.description || !formData.brand || !formData.price}
                        className={`font-semibold py-3 px-8 rounded-2xl transition-all duration-200 transform ${
                          loading || !formData.name || !formData.description || !formData.brand || !formData.price
                            ? 'bg-gray-500/50 cursor-not-allowed text-gray-300'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:scale-105 active:scale-95'
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'}`}></i>
                            <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
                            <i className="fas fa-arrow-right"></i>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Form Validation Messages */}
                  {(!formData.name || !formData.description || !formData.brand || !formData.price) && (
                    <div className="mt-4 p-4 bg-yellow-500/20 backdrop-blur-lg border border-yellow-300/50 rounded-2xl">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="fas fa-exclamation text-white text-sm"></i>
                        </div>
                        <div>
                          <h6 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">
                            Required Fields Missing
                          </h6>
                          <ul className="text-yellow-700 dark:text-yellow-300 text-sm mt-1 space-y-1">
                            {!formData.name && <li>• Product Name is required</li>}
                            {!formData.description && <li>• Description is required</li>}
                            {!formData.brand && <li>• Brand is required</li>}
                            {!formData.price && <li>• Price is required</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {!loading && (!products || products.length === 0) && (
        <div className="text-center py-20">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 max-w-lg mx-auto">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <i className="fas fa-box text-4xl text-white"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start building your product catalog by adding your first product.
            </p>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105"
            >
              <i className="fas fa-plus mr-3"></i>
              Add Your First Product
            </button>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        /* Custom scrollbar for modal */
        .modal-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .modal-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .modal-content::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        .modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        
        /* Enhanced select dropdown styling */
        select option {
          background-color: #1f2937;
          color: white;
          padding: 8px;
        }
        
        select option:checked {
          background-color: #3b82f6;
        }
        
        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Tab indicator animation */
        .tab-indicator {
          position: relative;
          overflow: hidden;
        }
        
        .tab-indicator::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        
        .tab-indicator.active::after {
          transform: translateX(0);
        }
        
        /* Enhanced form validation styles */
        .form-field.error input,
        .form-field.error textarea,
        .form-field.error select {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .form-field.success input,
        .form-field.success textarea,
        .form-field.success select {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        /* Enhanced button states */
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }
        
        /* Enhanced modal backdrop */
        .modal-backdrop {
          backdrop-filter: blur(8px);
          background: rgba(0, 0, 0, 0.4);
        }
        
        /* Product card hover effects */
        .product-card {
          transition: all 0.3s ease;
          transform-origin: center;
        }
        
        .product-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
        
        /* Enhanced loading animation */
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Responsive grid utilities */
        @media (max-width: 640px) {
          .mobile-stack {
            flex-direction: column;
          }
          
          .mobile-full {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductManagement;

