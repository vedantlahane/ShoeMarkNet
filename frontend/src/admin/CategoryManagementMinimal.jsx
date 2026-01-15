import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Search,
    Plus,
    FolderTree,
    MoreVertical,
    Edit2,
    Trash2,
    X,
    Check,
    Image
} from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../redux/slices/categorySlice';
import './styles/admin.css';

const CategoryManagementMinimal = () => {
    const dispatch = useDispatch();
    const { categories, isLoading } = useSelector((state) => state.category);

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [actionMenu, setActionMenu] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        parent: '',
        isActive: true,
        displayOrder: 0
    });

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Close action menu when clicking outside
    useEffect(() => {
        const handleClick = () => setActionMenu(null);
        if (actionMenu) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [actionMenu]);

    const categoryList = useMemo(() => {
        let filtered = Array.isArray(categories) ? categories : [];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.name?.toLowerCase().includes(term) ||
                c.description?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [categories, searchTerm]);

    const stats = useMemo(() => ({
        total: categories?.length || 0,
        active: categories?.filter(c => c.isActive !== false).length || 0,
        withProducts: categories?.filter(c => (c.productCount || 0) > 0).length || 0
    }), [categories]);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                description: category.description || '',
                image: category.image || '',
                parent: category.parent || '',
                isActive: category.isActive !== false,
                displayOrder: category.displayOrder || 0
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                image: '',
                parent: '',
                isActive: true,
                displayOrder: 0
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Please enter a category name');
            return;
        }

        try {
            const categoryData = {
                name: formData.name,
                description: formData.description,
                image: formData.image,
                parent: formData.parent || null,
                isActive: formData.isActive,
                displayOrder: parseInt(formData.displayOrder) || 0
            };

            if (editingCategory) {
                await dispatch(updateCategory({ id: editingCategory._id, categoryData })).unwrap();
                toast.success('Category updated successfully');
            } else {
                await dispatch(createCategory(categoryData)).unwrap();
                toast.success('Category created successfully');
            }

            handleCloseModal();
            dispatch(fetchCategories());
        } catch (error) {
            toast.error(error?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (categoryId) => {
        try {
            await dispatch(deleteCategory(categoryId)).unwrap();
            toast.success('Category deleted');
            setShowDeleteConfirm(null);
            dispatch(fetchCategories());
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    if (isLoading && !categories?.length) {
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
                        <h1 className="admin-page-title">Categories</h1>
                        <p className="admin-page-subtitle">Organize your products into categories</p>
                    </div>
                    <div className="admin-page-actions">
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => handleOpenModal()}
                        >
                            <Plus size={16} />
                            Add Category
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><FolderTree size={14} /> Total Categories</div>
                        <div className="admin-stat-value">{stats.total}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><Check size={14} /> Active</div>
                        <div className="admin-stat-value">{stats.active}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label">With Products</div>
                        <div className="admin-stat-value">{stats.withProducts}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="admin-filters">
                    <div className="admin-search" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search />
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {categoryList.length > 0 ? (
                        categoryList.map((category) => (
                            <div key={category._id} style={{
                                background: 'var(--admin-bg-secondary)',
                                borderRadius: '12px',
                                border: '1px solid var(--admin-border)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '120px',
                                    background: 'var(--admin-bg-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <FolderTree size={40} style={{ color: 'var(--admin-text-tertiary)' }} />
                                    )}
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{category.name}</h3>
                                            <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginBottom: '8px' }}>
                                                {category.description?.substring(0, 60) || 'No description'}
                                                {category.description?.length > 60 ? '...' : ''}
                                            </p>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <span className={`admin-badge ${category.isActive !== false ? 'admin-badge-success' : 'admin-badge-neutral'}`}>
                                                    {category.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className="admin-badge admin-badge-info">
                                                    {category.productCount || 0} products
                                                </span>
                                            </div>
                                        </div>
                                        <div className="admin-dropdown" style={{ position: 'relative' }}>
                                            <button
                                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                                onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === category._id ? null : category._id); }}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {actionMenu === category._id && (
                                                <div className="admin-dropdown-menu" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        className="admin-dropdown-item"
                                                        onClick={() => { handleOpenModal(category); setActionMenu(null); }}
                                                    >
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className="admin-dropdown-item danger"
                                                        onClick={() => { setShowDeleteConfirm(category._id); setActionMenu(null); }}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div className="admin-empty">
                                <FolderTree size={40} />
                                <p className="admin-empty-title">No categories found</p>
                                <p className="admin-empty-text">Create your first category to organize products</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={handleCloseModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={handleCloseModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Category Name *</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter category name"
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Description</label>
                                    <textarea
                                        className="admin-input"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief category description..."
                                        rows={3}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Image URL</label>
                                    <input
                                        type="url"
                                        className="admin-input"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://example.com/category-image.jpg"
                                    />
                                </div>

                                <div className="admin-grid-2">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Parent Category</label>
                                        <select
                                            className="admin-input admin-select"
                                            value={formData.parent}
                                            onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                        >
                                            <option value="">None (Root)</option>
                                            {categories?.filter(c => c._id !== editingCategory?._id).map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Display Order</label>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={formData.displayOrder}
                                            onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <span style={{ fontSize: '13px' }}>Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    {editingCategory ? 'Save Changes' : 'Add Category'}
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
                            <h3 className="admin-modal-title">Delete Category</h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setShowDeleteConfirm(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>
                                Are you sure you want to delete this category? This action cannot be undone.
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={() => handleDelete(showDeleteConfirm)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagementMinimal;
