import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Search,
    Plus,
    Package,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    X,
    Check,
    ChevronLeft,
    ChevronRight,
    Image,
    Palette
} from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../redux/slices/productSlice';
import { formatCurrency } from '../utils/helpers';
import './styles/admin.css';

const ProductManagementMinimal = () => {
    const dispatch = useDispatch();
    const { products, loading, categories } = useSelector((state) => state.product);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [actionMenu, setActionMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Common shoe sizes
    const SHOE_SIZES = ['US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13'];

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        compareAtPrice: '',
        costPrice: '',
        countInStock: '',
        description: '',
        category: '',
        sku: '',
        barcode: '',
        images: [''],
        isActive: true,
        isFeatured: false,
        tags: '',
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        gender: 'unisex',
        variants: []
    });

    useEffect(() => {
        dispatch(fetchProducts({ limit: 200 }));
    }, [dispatch]);

    // Close action menu when clicking outside
    useEffect(() => {
        const handleClick = () => setActionMenu(null);
        if (actionMenu) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [actionMenu]);

    const productList = useMemo(() => {
        let filtered = Array.isArray(products) ? products : [];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(term) ||
                p.brand?.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term) ||
                p.category?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => {
                if (statusFilter === 'active') return p.isActive !== false;
                if (statusFilter === 'inactive') return p.isActive === false;
                if (statusFilter === 'low-stock') return p.countInStock < 10;
                if (statusFilter === 'featured') return p.isFeatured === true;
                return true;
            });
        }

        return filtered;
    }, [products, searchTerm, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(productList.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return productList.slice(start, start + itemsPerPage);
    }, [productList, currentPage, itemsPerPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: products?.length || 0,
        active: products?.filter(p => p.isActive !== false).length || 0,
        lowStock: products?.filter(p => p.countInStock < 10).length || 0,
        totalValue: products?.reduce((acc, p) => acc + (p.price * (p.countInStock || 0)), 0) || 0
    }), [products]);

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                brand: product.brand || '',
                price: product.price || '',
                compareAtPrice: product.compareAtPrice || '',
                costPrice: product.costPrice || '',
                countInStock: product.countInStock || '',
                description: product.description || '',
                category: product.category || '',
                sku: product.sku || '',
                barcode: product.barcode || '',
                images: product.images?.length ? product.images : [''],
                isActive: product.isActive !== false,
                isFeatured: product.isFeatured || false,
                tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
                weight: product.weight || '',
                dimensions: product.dimensions || { length: '', width: '', height: '' },
                gender: product.gender || 'unisex',
                variants: product.variants?.length ? product.variants : []
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                brand: '',
                price: '',
                compareAtPrice: '',
                costPrice: '',
                countInStock: '',
                description: '',
                category: '',
                sku: '',
                barcode: '',
                images: [''],
                isActive: true,
                isFeatured: false,
                tags: '',
                weight: '',
                dimensions: { length: '', width: '', height: '' },
                gender: 'unisex',
                variants: []
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleAddImageField = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, '']
        }));
    };

    const handleRemoveImageField = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => i === index ? value : img)
        }));
    };

    // Variant handlers
    const handleAddVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { color: '', colorCode: '#000000', sizes: SHOE_SIZES.map(s => ({ size: s, countInStock: 0 })) }]
        }));
    };

    const handleRemoveVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleVariantChange = (vIndex, field, value) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[vIndex] = { ...newVariants[vIndex], [field]: value };
            return { ...prev, variants: newVariants };
        });
    };

    const handleSizeStockChange = (vIndex, sIndex, stock) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            const newSizes = [...newVariants[vIndex].sizes];
            newSizes[sIndex] = { ...newSizes[sIndex], countInStock: parseInt(stock) || 0 };
            newVariants[vIndex] = { ...newVariants[vIndex], sizes: newSizes };
            return { ...prev, variants: newVariants };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error('Please fill in required fields (Name and Price)');
            return;
        }

        try {
            const productData = {
                name: formData.name,
                brand: formData.brand,
                price: parseFloat(formData.price),
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                countInStock: parseInt(formData.countInStock) || 0,
                description: formData.description,
                category: formData.category,
                sku: formData.sku,
                barcode: formData.barcode,
                images: formData.images.filter(img => img.trim()),
                isActive: formData.isActive,
                isFeatured: formData.isFeatured,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                dimensions: formData.dimensions,
                gender: formData.gender,
                variants: formData.variants.filter(v => v.color.trim())
            };

            if (editingProduct) {
                await dispatch(updateProduct({ id: editingProduct._id, productData })).unwrap();
                toast.success('Product updated successfully');
            } else {
                await dispatch(createProduct(productData)).unwrap();
                toast.success('Product created successfully');
            }

            handleCloseModal();
            dispatch(fetchProducts({ limit: 200 }));
        } catch (error) {
            toast.error(error?.message || 'Failed to save product');
        }
    };

    const handleDelete = async (productId) => {
        try {
            await dispatch(deleteProduct(productId)).unwrap();
            toast.success('Product deleted');
            setShowDeleteConfirm(null);
            dispatch(fetchProducts({ limit: 200 }));
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return;

        try {
            await Promise.all(selectedProducts.map(id => dispatch(deleteProduct(id)).unwrap()));
            toast.success(`Deleted ${selectedProducts.length} products`);
            setSelectedProducts([]);
            dispatch(fetchProducts({ limit: 200 }));
        } catch (error) {
            toast.error('Failed to delete some products');
        }
    };

    const toggleSelect = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === paginatedProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(paginatedProducts.map(p => p._id));
        }
    };

    if (loading && !products?.length) {
        return (
            <div className="admin-root">
                <div className="admin-loading">
                    <div className="admin-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="admin-root">
            <div className="admin-container">
                {/* Page Header */}
                <div className="admin-page-header admin-flex-between">
                    <div>
                        <h1 className="admin-page-title">Products</h1>
                        <p className="admin-page-subtitle">Manage your product catalog ({productList.length} products)</p>
                    </div>
                    <div className="admin-page-actions">
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => handleOpenModal()}
                        >
                            <Plus size={16} />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><Package size={14} /> Total Products</div>
                        <div className="admin-stat-value">{stats.total}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><Check size={14} /> Active</div>
                        <div className="admin-stat-value">{stats.active}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label admin-text-warning">Low Stock</div>
                        <div className="admin-stat-value">{stats.lowStock}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label">Stock Value</div>
                        <div className="admin-stat-value">{formatCurrency(stats.totalValue)}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="admin-filters">
                    <div className="admin-search" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search />
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="admin-input admin-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '140px' }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="low-stock">Low Stock</option>
                        <option value="featured">Featured</option>
                    </select>

                    <select
                        className="admin-input admin-select"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        style={{ width: '100px' }}
                    >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>

                    {selectedProducts.length > 0 && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="admin-text-muted" style={{ fontSize: '13px' }}>
                                {selectedProducts.length} selected
                            </span>
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Products Table */}
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>Product</th>
                                <th>Brand</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.length > 0 ? (
                                paginatedProducts.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product._id)}
                                                onChange={() => toggleSelect(product._id)}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    background: 'var(--admin-bg-primary)',
                                                    overflow: 'hidden',
                                                    flexShrink: 0
                                                }}>
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div className="admin-flex-center" style={{ width: '100%', height: '100%' }}>
                                                            <Package size={16} style={{ color: 'var(--admin-text-tertiary)' }} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                                                        {product.sku ? `SKU: ${product.sku}` : product.category || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-text-muted">{product.brand || '—'}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{formatCurrency(product.price)}</div>
                                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                <div style={{ fontSize: '11px', color: 'var(--admin-text-tertiary)', textDecoration: 'line-through' }}>
                                                    {formatCurrency(product.compareAtPrice)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={product.countInStock < 10 ? 'admin-text-warning' : ''}>
                                                {product.countInStock || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                <span className={`admin-badge ${product.isActive !== false ? 'admin-badge-success' : 'admin-badge-neutral'}`}>
                                                    {product.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                                {product.isFeatured && (
                                                    <span className="admin-badge admin-badge-info">Featured</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-dropdown" style={{ position: 'relative' }}>
                                                <button
                                                    className="admin-btn admin-btn-ghost admin-btn-icon"
                                                    onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === product._id ? null : product._id); }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {actionMenu === product._id && (
                                                    <div className="admin-dropdown-menu" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            className="admin-dropdown-item"
                                                            onClick={() => { handleOpenModal(product); setActionMenu(null); }}
                                                        >
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button
                                                            className="admin-dropdown-item"
                                                            onClick={() => window.open(`/products/${product.slug || product._id}`, '_blank')}
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
                                                        <button
                                                            className="admin-dropdown-item danger"
                                                            onClick={() => { setShowDeleteConfirm(product._id); setActionMenu(null); }}
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="admin-empty">
                                            <Package size={40} />
                                            <p className="admin-empty-title">No products found</p>
                                            <p className="admin-empty-text">Try adjusting your filters or add a new product</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: 'var(--admin-bg-secondary)',
                        borderRadius: '0 0 12px 12px',
                        marginTop: '-1px',
                        border: '1px solid var(--admin-border)',
                        borderTop: 'none'
                    }}>
                        <span className="admin-text-muted" style={{ fontSize: '13px' }}>
                            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, productList.length)} of {productList.length}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                className="admin-btn admin-btn-secondary admin-btn-icon"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let page;
                                if (totalPages <= 5) {
                                    page = i + 1;
                                } else if (currentPage <= 3) {
                                    page = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                } else {
                                    page = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={page}
                                        className={`admin-btn ${currentPage === page ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                                        onClick={() => setCurrentPage(page)}
                                        style={{ minWidth: '36px' }}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button
                                className="admin-btn admin-btn-secondary admin-btn-icon"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={handleCloseModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={handleCloseModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                {/* Basic Info */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--admin-text-secondary)' }}>
                                    BASIC INFORMATION
                                </h4>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Product Name *</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                <div className="admin-grid-2">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Brand</label>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            placeholder="Brand name"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Category</label>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="Product category"
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Description</label>
                                    <textarea
                                        className="admin-input"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Product description..."
                                        rows={3}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>

                                {/* Pricing */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '24px 0 12px', color: 'var(--admin-text-secondary)' }}>
                                    PRICING
                                </h4>
                                <div className="admin-grid-3">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Price *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="admin-input"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Compare at Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="admin-input"
                                            value={formData.compareAtPrice}
                                            onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                            placeholder="0.00"
                                        />
                                        <p className="admin-form-hint">Original price for sale items</p>
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Cost Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="admin-input"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Inventory */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '24px 0 12px', color: 'var(--admin-text-secondary)' }}>
                                    INVENTORY
                                </h4>
                                <div className="admin-grid-3">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Stock Quantity</label>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={formData.countInStock}
                                            onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">SKU</label>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                            placeholder="SKU-001"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Barcode</label>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            value={formData.barcode}
                                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                            placeholder="UPC or ISBN"
                                        />
                                    </div>
                                </div>

                                {/* Images */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '24px 0 12px', color: 'var(--admin-text-secondary)' }}>
                                    IMAGES
                                </h4>
                                {formData.images.map((img, index) => (
                                    <div key={index} className="admin-form-group" style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="url"
                                            className="admin-input"
                                            value={img}
                                            onChange={(e) => handleImageChange(index, e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            style={{ flex: 1 }}
                                        />
                                        {formData.images.length > 1 && (
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                                onClick={() => handleRemoveImageField(index)}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={handleAddImageField}
                                    style={{ marginTop: '8px' }}
                                >
                                    <Image size={14} /> Add Image URL
                                </button>

                                {/* Gender */}
                                <div className="admin-form-group" style={{ marginTop: '24px' }}>
                                    <label className="admin-form-label">Gender</label>
                                    <select
                                        className="admin-input admin-select"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="unisex">Unisex</option>
                                        <option value="men">Men</option>
                                        <option value="women">Women</option>
                                    </select>
                                </div>

                                {/* Variants (Sizes) */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '24px 0 12px', color: 'var(--admin-text-secondary)' }}>
                                    SIZES & COLOR VARIANTS
                                </h4>
                                <p className="admin-form-hint" style={{ marginBottom: '12px' }}>
                                    Add color variants with shoe size stock. Each variant gets its own size inventory.
                                </p>

                                {formData.variants.map((variant, vIndex) => (
                                    <div key={vIndex} style={{
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        marginBottom: '12px',
                                        background: 'var(--admin-bg-primary)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    background: variant.colorCode || '#000',
                                                    border: '2px solid var(--admin-border)'
                                                }} />
                                                <span style={{ fontWeight: 500 }}>
                                                    {variant.color || `Variant ${vIndex + 1}`}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                                onClick={() => handleRemoveVariant(vIndex)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <div className="admin-grid-2" style={{ marginBottom: '12px' }}>
                                            <div className="admin-form-group">
                                                <label className="admin-form-label">Color Name</label>
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    value={variant.color}
                                                    onChange={(e) => handleVariantChange(vIndex, 'color', e.target.value)}
                                                    placeholder="e.g., Black, Red, Blue"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label className="admin-form-label">Color Code</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="color"
                                                        value={variant.colorCode}
                                                        onChange={(e) => handleVariantChange(vIndex, 'colorCode', e.target.value)}
                                                        style={{ width: '40px', height: '36px', padding: '2px', border: '1px solid var(--admin-border)', borderRadius: '6px' }}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="admin-input"
                                                        value={variant.colorCode}
                                                        onChange={(e) => handleVariantChange(vIndex, 'colorCode', e.target.value)}
                                                        placeholder="#000000"
                                                        style={{ flex: 1 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <label className="admin-form-label">Stock by Size</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                            {variant.sizes.map((size, sIndex) => (
                                                <div key={sIndex} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    background: 'var(--admin-bg-secondary)',
                                                    padding: '6px 8px',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--admin-border)'
                                                }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 500, minWidth: '45px' }}>{size.size}</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={size.countInStock}
                                                        onChange={(e) => handleSizeStockChange(vIndex, sIndex, e.target.value)}
                                                        style={{
                                                            width: '50px',
                                                            padding: '4px 6px',
                                                            fontSize: '12px',
                                                            border: '1px solid var(--admin-border)',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            background: 'var(--admin-bg-primary)'
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={handleAddVariant}
                                    style={{ marginTop: '8px' }}
                                >
                                    <Palette size={14} /> Add Color Variant
                                </button>

                                {/* Options */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '24px 0 12px', color: 'var(--admin-text-secondary)' }}>
                                    OPTIONS
                                </h4>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Tags</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="running, shoes, sport (comma separated)"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <span style={{ fontSize: '13px' }}>Active</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isFeatured}
                                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <span style={{ fontSize: '13px' }}>Featured Product</span>
                                    </label>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    {editingProduct ? 'Save Changes' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Delete Product</h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setShowDeleteConfirm(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>
                                Are you sure you want to delete this product? This action cannot be undone.
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagementMinimal;
