import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";


// Redux actions
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  clearProductError
} from "../redux/slices/productSlice";
import productService from "../services/productService";

// Components
import LoadingSpinner from "../components/common/feedback/LoadingSpinner";

import Pagination from '../components/common/navigation/Pagination';
import ProductCard from "../components/products/ProductCard";
import ProductTable from "./products/ProductTable";
import ProductModal from "./products/ProductModal";
import ProductFilters from "./products/ProductFilters";
import ProductStats from "./products/ProductStats";
import BulkActionsPanel from "./products/BulkActionsPanel";
import ExportModal from "./products/ExportModal";
import ImportModal from "./products/ImportModal";
import ImageGalleryModal from "./products/ImageGalleryModal";

// Hooks
import useWebSocket from "../hooks/useWebSocket";
import useLocalStorage from "../hooks/useLocalStorage";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import useDragAndDrop from "../hooks/useDragAndDrop";

// Utils
import { trackEvent } from "../utils/analytics";
import { validateProduct, generateSKU } from "../utils/productUtils";

// Constants
const PRODUCTS_PER_PAGE_OPTIONS = [12, 24, 48, 96];
const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First', icon: 'fa-clock' },
  { value: 'createdAt-asc', label: 'Oldest First', icon: 'fa-history' },
  { value: 'name-asc', label: 'Name A-Z', icon: 'fa-sort-alpha-up' },
  { value: 'name-desc', label: 'Name Z-A', icon: 'fa-sort-alpha-down' },
  { value: 'price-asc', label: 'Price Low-High', icon: 'fa-sort-amount-up' },
  { value: 'price-desc', label: 'Price High-Low', icon: 'fa-sort-amount-down' },
  { value: 'stock-asc', label: 'Stock Low-High', icon: 'fa-sort-numeric-up' },
  { value: 'stock-desc', label: 'Stock High-Low', icon: 'fa-sort-numeric-down' }
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Products', icon: 'fa-list' },
  { value: 'active', label: 'Active', icon: 'fa-check-circle' },
  { value: 'inactive', label: 'Inactive', icon: 'fa-pause-circle' },
  { value: 'featured', label: 'Featured', icon: 'fa-star' },
  { value: 'low-stock', label: 'Low Stock', icon: 'fa-exclamation-triangle' },
  { value: 'out-of-stock', label: 'Out of Stock', icon: 'fa-times-circle' }
];

const BULK_ACTIONS = [
  { id: 'activate', label: 'Activate', icon: 'fa-check-circle', color: 'from-green-600 to-emerald-600' },
  { id: 'deactivate', label: 'Deactivate', icon: 'fa-pause-circle', color: 'from-orange-600 to-red-600' },
  { id: 'feature', label: 'Add to Featured', icon: 'fa-star', color: 'from-yellow-600 to-orange-600' },
  { id: 'unfeature', label: 'Remove from Featured', icon: 'fa-star-half-alt', color: 'from-gray-600 to-gray-700' },
  { id: 'duplicate', label: 'Duplicate', icon: 'fa-copy', color: 'from-blue-600 to-cyan-600' },
  { id: 'export', label: 'Export Selected', icon: 'fa-download', color: 'from-purple-600 to-pink-600' },
  { id: 'delete', label: 'Delete', icon: 'fa-trash', color: 'from-red-600 to-pink-600' }
];

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
  // Enhanced fields
  tags: [],
  compareAtPrice: 0,
  costPrice: 0,
  barcode: "",
  trackQuantity: true,
  requiresShipping: true,
  taxable: true,
  vendor: "",
  productType: "",
  seoTitle: "",
  seoDescription: "",
  handle: ""
};

const ProductManagement = ({ realtimeData, onDataUpdate, isLoading, externalAction, onActionHandled }) => {
  const dispatch = useDispatch();

  // Redux state
  const { products, categories, loading, error, pagination } = useSelector(
    (state) => state.product
  );
  const { user } = useSelector((state) => state.auth);

  // WebSocket for real-time updates
  const { isConnected, lastMessage } = useWebSocket('/admin/products');

  // Local state with persistent storage
  const [viewMode, setViewMode] = useLocalStorage('productViewMode', 'cards');
  const [productsPerPage, setProductsPerPage] = useLocalStorage('productsPerPage', 24);
  const [statusFilter, setStatusFilter] = useLocalStorage('productStatusFilter', 'all');
  const [categoryFilter, setCategoryFilter] = useLocalStorage('productCategoryFilter', 'all');
  const [sortBy, setSortBy] = useLocalStorage('productSortBy', 'createdAt');
  const [sortOrder, setSortOrder] = useLocalStorage('productSortOrder', 'desc');

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  // Form state
  const [formData, setFormData] = useState({ ...initialFormData });
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  // Refs
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': () => openCreateModal(),
    'ctrl+r': () => handleRefresh(),
    'ctrl+e': () => setShowExportModal(true),
    'ctrl+i': () => setShowImportModal(true),
    'ctrl+f': () => document.getElementById('product-search')?.focus(),
    'delete': () => selectedProducts.length > 0 && handleBulkAction('delete'),
    'escape': () => {
      setIsModalOpen(false);
      setSelectedProducts([]);
    }
  });

  // File drop handler
  const handleFilesDrop = useCallback(async (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const dataFiles = files.filter(file => 
      file.name.endsWith('.csv') || file.name.endsWith('.xlsx')
    );

    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        return URL.createObjectURL(file);
      });
      try {
        const uploadedUrls = await Promise.all(uploadPromises);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
        toast.success(`${imageFiles.length} image(s) uploaded successfully!`);
      } catch (error) {
        toast.error('Failed to upload images');
      }
    }

    if (dataFiles.length > 0) {
      setShowImportModal(true);
    }
  }, [setFormData, setShowImportModal]);

  // Drag and drop for bulk file upload
  const { isDragging, dragProps } = useDragAndDrop({
    onDrop: handleFilesDrop,
    accept: ['image/*', '.csv', '.xlsx'],
    multiple: true
  });

  // Initialize component
  useEffect(() => {
    setTimeout(() => setAnimateCards(true), 100);
    loadInitialData();
    
    trackEvent('admin_products_viewed', {
      user_id: user?._id,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage && isConnected) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'product_update') {
        handleRealTimeProductUpdate(data.payload);
      }
    }
  }, [lastMessage, isConnected]);

  // Load data when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadProductsData();
  }, [
    searchTerm,
    statusFilter,
    categoryFilter,
    sortBy,
    sortOrder,
    productsPerPage
  ]);

  // Load data when page changes
  useEffect(() => {
    loadProductsData();
  }, [currentPage]);

  // Clear errors after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearProductError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchCategories()),
        loadProductsData()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load product data');
    }
  }, [dispatch]);

  // Load products data with filters
  const loadProductsData = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: productsPerPage,
        sort: `${sortBy}:${sortOrder}`,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      };

      await dispatch(fetchProducts(params));
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    }
  }, [
    dispatch,
    currentPage,
    productsPerPage,
    sortBy,
    sortOrder,
    searchTerm,
    statusFilter,
    categoryFilter
  ]);

  // Handle real-time product updates
  const handleRealTimeProductUpdate = useCallback((updatedProduct) => {
    toast.info(`Product "${updatedProduct.name}" has been updated`);
    if (onDataUpdate) {
      onDataUpdate(updatedProduct);
    }
  }, [onDataUpdate]);

  // Stock calculations
  const calculateTotalStock = useCallback((product) => {
    if (product?.variants?.length) {
      return product.variants.reduce((total, variant) => {
        if (!variant?.sizes?.length) return total;
        return (
          total +
          variant.sizes.reduce(
            (sum, size) => sum + (Number(size?.countInStock) || 0),
            0
          )
        );
      }, 0);
    }

    return Number(product?.countInStock) || 0;
  }, []);

  const getStockStatus = useCallback((product) => {
    const stock = calculateTotalStock(product);
    if (!product?.isActive) {
      return {
        status: 'Inactive',
        color: 'from-gray-500 to-gray-600',
        icon: 'fa-pause'
      };
    }

    if (stock === 0) {
      return {
        status: 'Out of Stock',
        color: 'from-red-500 to-red-600',
        icon: 'fa-times-circle'
      };
    }

    if (stock < 10) {
      return {
        status: 'Low Stock',
        color: 'from-yellow-500 to-orange-500',
        icon: 'fa-exclamation-triangle'
      };
    }

    return {
      status: 'In Stock',
      color: 'from-green-500 to-green-600',
      icon: 'fa-check-circle'
    };
  }, [calculateTotalStock]);

  // Enhanced product statistics
  const productStats = useMemo(() => {
    if (!products) return {};

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const featuredProducts = products.filter(p => p.isFeatured).length;
    const lowStockProducts = products.filter(p => calculateTotalStock(p) < 10).length;
    const outOfStockProducts = products.filter(p => calculateTotalStock(p) === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * calculateTotalStock(p)), 0);
    const averagePrice = totalProducts > 0 ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;

    return {
      totalProducts,
      activeProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      averagePrice,
      inactiveProducts: totalProducts - activeProducts,
      totalStock: products.reduce((sum, p) => sum + calculateTotalStock(p), 0)
    };
  }, [products, calculateTotalStock]);

  // Enhanced form handlers
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      // Handle nested fields
      if (field.includes('.')) {
        const keys = field.split('.');
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        newData[field] = value;
      }

      // Auto-generate fields
      if (field === 'name' && !prev.handle) {
        newData.handle = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      if (field === 'name' && !prev.metaTitle) {
        newData.metaTitle = value;
      }
      if (field === 'name' && !prev.sku) {
        newData.sku = generateSKU(value, prev.brand);
      }

      return newData;
    });

    // Clear field-specific errors
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formErrors]);

  // Enhanced validation
  const validateForm = useCallback(() => {
    const errors = validateProduct(formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setIsEditing(false);
    setSelectedProduct(null);
    setFormData({ ...initialFormData });
    setFormErrors({});
    setActiveTab("basic");
    setActiveVariantIndex(0);
    setIsModalOpen(true);
    
    trackEvent('product_create_modal_opened', {
      user_id: user?._id
    });
  }, [user]);

  const openEditModal = useCallback((product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setFormData({
      ...initialFormData,
      ...product,
      images: product.images || [],
      variants: product.variants || [],
      specifications: product.specifications || {},
      metaKeywords: Array.isArray(product.metaKeywords) ? product.metaKeywords : [],
      dimensions: {
        length: product.dimensions?.length || 0,
        width: product.dimensions?.width || 0,
        height: product.dimensions?.height || 0,
      },
    });
    setFormErrors({});
    setActiveTab("basic");
    setActiveVariantIndex(0);
    setIsModalOpen(true);
    
    trackEvent('product_edit_modal_opened', {
      product_id: product._id,
      user_id: user?._id
    });
  }, [user]);

  useEffect(() => {
    if (!externalAction) {
      return;
    }

    if (externalAction.section && externalAction.section !== 'products') {
      onActionHandled?.(externalAction);
      return;
    }

    let handled = false;

    switch (externalAction.type) {
      case 'openCreateProduct':
        openCreateModal();
        handled = true;
        break;
      case 'openImportProducts':
        setShowImportModal(true);
        handled = true;
        break;
      case 'openExportProducts':
        setShowExportModal(true);
        handled = true;
        break;
      case 'searchProducts': {
        const nextTerm = externalAction?.payload?.term || '';
        setSearchTerm(nextTerm);
        setCurrentPage(1);

        if (nextTerm) {
          toast.info(`Filtering products for "${nextTerm}"`);
          trackEvent('admin_products_search_applied', {
            query: nextTerm,
            source: 'global_search'
          });
        }
        handled = true;
        break;
      }
      default:
        break;
    }

    if (handled) {
      trackEvent('product_quick_action_triggered', {
        type: externalAction.type,
        source: 'admin_dashboard'
      });
    }

    onActionHandled?.(externalAction);
  }, [externalAction, openCreateModal, onActionHandled, setShowImportModal, setShowExportModal]);

  // Enhanced form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
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
        await dispatch(updateProduct({ 
          id: selectedProduct._id, 
          productData 
        })).unwrap();
        
        toast.success("Product updated successfully!");
        
        trackEvent('product_updated', {
          product_id: selectedProduct._id,
          user_id: user?._id
        });
      } else {
        const result = await dispatch(createProduct(productData)).unwrap();
        
        toast.success("Product created successfully!");
        
        trackEvent('product_created', {
          product_id: result._id,
          user_id: user?._id
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
    }
  }, [formData, isEditing, selectedProduct, validateForm, dispatch, user]);

  // Enhanced deletion with confirmation
  const handleDeleteProduct = useCallback(async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?\n\nThis action cannot be undone and will remove all associated data including:\n• Product variants\n• Images\n• Specifications\n• Order history`
    );
    
    if (!confirmed) return;

    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success(`"${name}" has been deleted successfully`);
      
      trackEvent('product_deleted', {
        product_id: id,
        product_name: name,
        user_id: user?._id
      });
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
    }
  }, [dispatch, user]);

  // Enhanced bulk actions
  const handleBulkAction = useCallback(async (action) => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select products first');
      return;
    }

    const actionLabels = {
      activate: 'activate',
      deactivate: 'deactivate',
      feature: 'add to featured',
      unfeature: 'remove from featured',
      duplicate: 'duplicate',
      export: 'export',
      delete: 'delete'
    };

    const confirmMessage = action === 'delete'
      ? `Are you sure you want to delete ${selectedProducts.length} product(s)?\n\nThis action cannot be undone and will permanently remove all selected products and their associated data.`
      : `Are you sure you want to ${actionLabels[action]} ${selectedProducts.length} product(s)?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const loadingToast = toast.loading(`Processing ${selectedProducts.length} products...`);

      switch (action) {
        case 'activate':
          await dispatch(bulkUpdateProducts({
            productIds: selectedProducts,
            updates: { isActive: true }
          })).unwrap();
          break;
        
        case 'deactivate':
          await dispatch(bulkUpdateProducts({
            productIds: selectedProducts,
            updates: { isActive: false }
          })).unwrap();
          break;
        
        case 'feature':
          await dispatch(bulkUpdateProducts({
            productIds: selectedProducts,
            updates: { isFeatured: true }
          })).unwrap();
          break;
        
        case 'unfeature':
          await dispatch(bulkUpdateProducts({
            productIds: selectedProducts,
            updates: { isFeatured: false }
          })).unwrap();
          break;
        
        case 'duplicate':
          await handleBulkDuplicate();
          break;
        
        case 'export':
          await handleBulkExport();
          break;
        
        case 'delete':
          const deletePromises = selectedProducts.map(id => dispatch(deleteProduct(id)));
          await Promise.all(deletePromises);
          break;
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      toast.dismiss(loadingToast);
      toast.success(`Successfully ${actionLabels[action]}d ${selectedProducts.length} product(s)!`);
      
      setSelectedProducts([]);
      setShowBulkActions(false);
      
      trackEvent('bulk_product_action', {
        action,
        product_count: selectedProducts.length,
        user_id: user?._id
      });
      
    } catch (error) {
      toast.error(`Bulk ${action} failed: ${error.message}`);
    }
  }, [selectedProducts, dispatch, user]);

  // Bulk duplicate handler
  const handleBulkDuplicate = useCallback(async () => {
    const duplicatePromises = selectedProducts.map(async (productId) => {
      const product = products.find(p => p._id === productId);
      if (product) {
        const duplicateData = {
          ...product,
          name: `${product.name} (Copy)`,
          sku: generateSKU(`${product.name} Copy`, product.brand),
          isActive: false
        };
        delete duplicateData._id;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;
        
        return dispatch(createProduct(duplicateData));
      }
    });

    await Promise.all(duplicatePromises);
  }, [selectedProducts, products, dispatch]);

  // Bulk export handler
  const handleBulkExport = useCallback(async () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p._id));
    const exportData = await productService.exportProducts(selectedProductsData, 'csv');
    
    const blob = new Blob([exportData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected-products-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [selectedProducts, products]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProductsData().finally(() => setRefreshing(false));
    
    trackEvent('products_refreshed', {
      user_id: user?._id
    });
  }, [loadProductsData, user]);

  // Selection handlers
  const handleProductSelect = useCallback((productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const currentProductIds = products?.map(product => product._id) || [];
    setSelectedProducts(prev => 
      prev.length === currentProductIds.length ? [] : currentProductIds
    );
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter(product => {
      const searchMatch = !searchTerm || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && product.isActive) ||
        (statusFilter === 'inactive' && !product.isActive) ||
        (statusFilter === 'featured' && product.isFeatured) ||
        (statusFilter === 'low-stock' && calculateTotalStock(product) < 10) ||
        (statusFilter === 'out-of-stock' && calculateTotalStock(product) === 0);

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
  }, [products, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder, calculateTotalStock]);

  // Loading state
  if (isLoading || (loading && !products)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="admin-surface text-center">
          <LoadingSpinner size="large" />
          <h3 className="mt-4 text-base font-semibold">
            <i className="fa-solid fa-box mr-2" />
            Loading products
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Fetching product data and analytics…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" {...dragProps}>
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm">
          <div className="admin-surface text-center shadow-none">
            <i className="fa-solid fa-cloud-arrow-up mb-4 text-3xl" />
            <h3 className="text-base font-semibold">Drop files to upload</h3>
            <p className="mt-1 text-sm text-slate-500">Images, CSV, and Excel files are supported.</p>
          </div>
        </div>
      )}

      <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="admin-surface">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300">
                <i className="fa-solid fa-boxes-stacked text-blue-500" />
                Catalog
              </span>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Product Management</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Maintain pricing, inventory, and merchandising from a streamlined workspace.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {isConnected ? 'Live updates on' : 'Offline'}
                </span>
                {refreshing && (
                  <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    Syncing products…
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <i className="fa-solid fa-layer-group" />
                  {filteredAndSortedProducts.length.toLocaleString()} visible
                </span>
                {selectedProducts.length > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    <i className="fa-solid fa-check-double" />
                    {selectedProducts.length} selected
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                title="Refresh products (Ctrl+R)"
              >
                <i className={`fa-solid fa-arrow-rotate-right ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                title="Import products (Ctrl+I)"
              >
                <i className="fa-solid fa-file-arrow-up" />
                Import
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                title="Export products (Ctrl+E)"
              >
                <i className="fa-solid fa-file-arrow-down" />
                Export
              </button>
              <button
                onClick={openCreateModal}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-slate-900"
                title="Add new product (Ctrl+N)"
              >
                <i className="fa-solid fa-plus" />
                New product
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductStats
        stats={productStats}
        realtimeData={realtimeData}
        animateCards={animateCards}
      />

      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field, order) => {
          setSortBy(field);
          setSortOrder(order);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        productsPerPage={productsPerPage}
        onProductsPerPageChange={setProductsPerPage}
        selectedCount={selectedProducts.length}
        totalCount={filteredAndSortedProducts.length}
        onSelectAll={handleSelectAll}
        onClearSelection={() => setSelectedProducts([])}
        categories={categories}
        statusFilters={STATUS_FILTERS}
        sortOptions={SORT_OPTIONS}
        perPageOptions={PRODUCTS_PER_PAGE_OPTIONS}
        animateCards={animateCards}
      />

      {selectedProducts.length > 0 && (
        <BulkActionsPanel
          selectedCount={selectedProducts.length}
          actions={BULK_ACTIONS}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedProducts([])}
          animateCards={animateCards}
        />
      )}

      {filteredAndSortedProducts.length === 0 ? (
          <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="admin-surface text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <i className="fa-solid fa-box-open text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No products match your filters'
                : 'No products found'}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting filters or clearing the search to broaden results.'
                : 'Add your first product to start building the catalog.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                >
                  <i className="fa-solid fa-xmark" />
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <i className="fa-solid fa-plus" />
                  Add your first product
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {(loading || refreshing) && products && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <LoadingSpinner size="medium" message="Updating products..." />
            </div>
          )}

          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedProducts.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                  isSelected={selectedProducts.includes(product._id)}
                  stockInfo={getStockStatus(product)}
                  stockCount={calculateTotalStock(product)}
                  onSelect={() => handleProductSelect(product._id)}
                  onEdit={() => openEditModal(product)}
                  onDelete={() => handleDeleteProduct(product._id, product.name)}
                  onImageGallery={(images) => {
                    setGalleryImages(images);
                    setShowImageGallery(true);
                  }}
                  categories={categories}
                  animateCards={animateCards}
                />
              ))}
            </div>
          ) : (
            <ProductTable
              products={filteredAndSortedProducts}
              selectedProducts={selectedProducts}
              onSelect={handleProductSelect}
              onSelectAll={handleSelectAll}
              onEdit={openEditModal}
              onDelete={handleDeleteProduct}
              onImageGallery={(images) => {
                setGalleryImages(images);
                setShowImageGallery(true);
              }}
              getStockStatus={getStockStatus}
              calculateTotalStock={calculateTotalStock}
              categories={categories}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(field) => {
                const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
                setSortBy(field);
                setSortOrder(newOrder);
              }}
              animateCards={animateCards}
            />
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
                showInfo
                totalItems={pagination.totalItems}
                itemsPerPage={productsPerPage}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
              />
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isEditing={isEditing}
          formData={formData}
          formErrors={formErrors}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          categories={categories}
          loading={loading}
        />
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          products={products}
          selectedProducts={selectedProducts}
          onExport={async (format) => {
            toast.success(`Products exported as ${format.toUpperCase()}`);
          }}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={async () => {
            toast.success('Products imported successfully');
            loadProductsData();
          }}
        />
      )}

      {showImageGallery && (
        <ImageGalleryModal
          images={galleryImages}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </div>
  );
};

export default ProductManagement;
