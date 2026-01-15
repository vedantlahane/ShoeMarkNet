import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Search,
    Plus,
    Megaphone,
    MoreVertical,
    Edit2,
    Trash2,
    X,
    Check,
    Calendar,
    Percent,
    DollarSign,
    Clock
} from 'lucide-react';
import { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../redux/slices/campaignSlice';
import { formatCurrency } from '../utils/helpers';
import './styles/admin.css';

const CampaignManagementMinimal = () => {
    const dispatch = useDispatch();
    const { campaigns, isLoading } = useSelector((state) => state.campaign);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [actionMenu, setActionMenu] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'percentage',
        discount: { percentage: 10, fixed: 0, maxDiscount: 0, minimumPurchase: 0 },
        startDate: '',
        endDate: '',
        status: 'draft',
        isActive: true,
        isPublic: true,
        code: '',
        priority: 1,
        bannerImage: ''
    });

    useEffect(() => {
        dispatch(fetchCampaigns());
    }, [dispatch]);

    // Close action menu when clicking outside
    useEffect(() => {
        const handleClick = () => setActionMenu(null);
        if (actionMenu) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [actionMenu]);

    const campaignList = useMemo(() => {
        let filtered = Array.isArray(campaigns) ? campaigns : [];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.name?.toLowerCase().includes(term) ||
                c.code?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        return filtered;
    }, [campaigns, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: campaigns?.length || 0,
            active: campaigns?.filter(c => c.status === 'active').length || 0,
            scheduled: campaigns?.filter(c => c.status === 'scheduled').length || 0,
            expired: campaigns?.filter(c => new Date(c.endDate) < now).length || 0
        };
    }, [campaigns]);

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleOpenModal = (campaign = null) => {
        if (campaign) {
            setEditingCampaign(campaign);
            setFormData({
                name: campaign.name || '',
                description: campaign.description || '',
                type: campaign.type || 'percentage',
                discount: campaign.discount || { percentage: 10, fixed: 0, maxDiscount: 0, minimumPurchase: 0 },
                startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
                endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
                status: campaign.status || 'draft',
                isActive: campaign.isActive !== false,
                isPublic: campaign.isPublic !== false,
                code: campaign.code || '',
                priority: campaign.priority || 1,
                bannerImage: campaign.marketing?.bannerImage || ''
            });
        } else {
            setEditingCampaign(null);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);

            setFormData({
                name: '',
                description: '',
                type: 'percentage',
                discount: { percentage: 10, fixed: 0, maxDiscount: 0, minimumPurchase: 0 },
                startDate: tomorrow.toISOString().split('T')[0],
                endDate: nextWeek.toISOString().split('T')[0],
                status: 'draft',
                isActive: true,
                isPublic: true,
                code: '',
                priority: 1,
                bannerImage: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCampaign(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.startDate || !formData.endDate) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            const campaignData = {
                name: formData.name,
                description: formData.description,
                type: formData.type,
                discount: formData.discount,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                status: formData.status,
                isActive: formData.isActive,
                isPublic: formData.isPublic,
                code: formData.code,
                priority: parseInt(formData.priority) || 1,
                marketing: { bannerImage: formData.bannerImage }
            };

            if (editingCampaign) {
                await dispatch(updateCampaign({ id: editingCampaign._id, campaignData })).unwrap();
                toast.success('Campaign updated successfully');
            } else {
                await dispatch(createCampaign(campaignData)).unwrap();
                toast.success('Campaign created successfully');
            }

            handleCloseModal();
            dispatch(fetchCampaigns());
        } catch (error) {
            toast.error(error?.message || 'Failed to save campaign');
        }
    };

    const handleDelete = async (campaignId) => {
        try {
            await dispatch(deleteCampaign(campaignId)).unwrap();
            toast.success('Campaign deleted');
            setShowDeleteConfirm(null);
            dispatch(fetchCampaigns());
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active': return 'admin-badge-success';
            case 'scheduled': return 'admin-badge-info';
            case 'paused': return 'admin-badge-warning';
            case 'completed': return 'admin-badge-neutral';
            case 'cancelled': return 'admin-badge-danger';
            default: return 'admin-badge-neutral';
        }
    };

    if (isLoading && !campaigns?.length) {
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
                        <h1 className="admin-page-title">Campaigns</h1>
                        <p className="admin-page-subtitle">Manage promotions and discount campaigns</p>
                    </div>
                    <div className="admin-page-actions">
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => handleOpenModal()}
                        >
                            <Plus size={16} />
                            Create Campaign
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><Megaphone size={14} /> Total Campaigns</div>
                        <div className="admin-stat-value">{stats.total}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><Check size={14} /> Active</div>
                        <div className="admin-stat-value admin-text-success">{stats.active}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><Clock size={14} /> Scheduled</div>
                        <div className="admin-stat-value">{stats.scheduled}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label">Expired</div>
                        <div className="admin-stat-value admin-text-muted">{stats.expired}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="admin-filters">
                    <div className="admin-search" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search />
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="Search campaigns..."
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
                        <option value="scheduled">Scheduled</option>
                        <option value="draft">Draft</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Campaigns Table */}
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Campaign</th>
                                <th>Type</th>
                                <th>Discount</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaignList.length > 0 ? (
                                campaignList.map((campaign) => (
                                    <tr key={campaign._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    background: 'var(--admin-bg-primary)',
                                                    overflow: 'hidden',
                                                    flexShrink: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Megaphone size={16} style={{ color: 'var(--admin-text-tertiary)' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{campaign.name}</div>
                                                    {campaign.code && (
                                                        <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                                                            Code: {campaign.code}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-text-muted" style={{ textTransform: 'capitalize' }}>
                                            {campaign.type || 'percentage'}
                                        </td>
                                        <td>
                                            {campaign.type === 'fixed' ? (
                                                <span style={{ fontWeight: 600 }}>{formatCurrency(campaign.discount?.fixed || 0)}</span>
                                            ) : (
                                                <span style={{ fontWeight: 600 }}>{campaign.discount?.percentage || 0}%</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                                            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${getStatusBadgeClass(campaign.status)}`}>
                                                {campaign.status || 'draft'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-dropdown" style={{ position: 'relative' }}>
                                                <button
                                                    className="admin-btn admin-btn-ghost admin-btn-icon"
                                                    onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === campaign._id ? null : campaign._id); }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {actionMenu === campaign._id && (
                                                    <div className="admin-dropdown-menu" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            className="admin-dropdown-item"
                                                            onClick={() => { handleOpenModal(campaign); setActionMenu(null); }}
                                                        >
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button
                                                            className="admin-dropdown-item danger"
                                                            onClick={() => { setShowDeleteConfirm(campaign._id); setActionMenu(null); }}
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
                                    <td colSpan={6}>
                                        <div className="admin-empty">
                                            <Megaphone size={40} />
                                            <p className="admin-empty-title">No campaigns found</p>
                                            <p className="admin-empty-text">Create your first campaign to boost sales</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={handleCloseModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">
                                {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
                            </h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={handleCloseModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                                {/* Basic Info */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--admin-text-secondary)' }}>
                                    CAMPAIGN DETAILS
                                </h4>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Campaign Name *</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Summer Sale 2024"
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Description</label>
                                    <textarea
                                        className="admin-input"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Campaign description..."
                                        rows={2}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>

                                <div className="admin-grid-2">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Promo Code</label>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="SUMMER20"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Priority</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="admin-input"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Discount */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '24px 0 12px', color: 'var(--admin-text-secondary)' }}>
                                    DISCOUNT SETTINGS
                                </h4>
                                <div className="admin-grid-2">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Discount Type</label>
                                        <select
                                            className="admin-input admin-select"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="percentage">Percentage Off</option>
                                            <option value="fixed">Fixed Amount</option>
                                            <option value="freeShipping">Free Shipping</option>
                                            <option value="buyXGetY">Buy X Get Y</option>
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">
                                            {formData.type === 'fixed' ? 'Discount Amount' : 'Discount Percentage'}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="admin-input"
                                            value={formData.type === 'fixed' ? formData.discount.fixed : formData.discount.percentage}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                discount: {
                                                    ...formData.discount,
                                                    [formData.type === 'fixed' ? 'fixed' : 'percentage']: parseFloat(e.target.value) || 0
                                                }
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="admin-grid-2">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Minimum Purchase</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="admin-input"
                                            value={formData.discount.minimumPurchase}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                discount: { ...formData.discount, minimumPurchase: parseFloat(e.target.value) || 0 }
                                            })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Max Discount Cap</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="admin-input"
                                            value={formData.discount.maxDiscount}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                discount: { ...formData.discount, maxDiscount: parseFloat(e.target.value) || 0 }
                                            })}
                                            placeholder="0.00 (no cap)"
                                        />
                                    </div>
                                </div>

                                {/* Duration */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '24px 0 12px', color: 'var(--admin-text-secondary)' }}>
                                    CAMPAIGN DURATION
                                </h4>
                                <div className="admin-grid-2">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Start Date *</label>
                                        <input
                                            type="date"
                                            className="admin-input"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">End Date *</label>
                                        <input
                                            type="date"
                                            className="admin-input"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Status & Options */}
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '24px 0 12px', color: 'var(--admin-text-secondary)' }}>
                                    STATUS & VISIBILITY
                                </h4>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Status</label>
                                    <select
                                        className="admin-input admin-select"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <span style={{ fontSize: '13px' }}>Enabled</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isPublic}
                                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <span style={{ fontSize: '13px' }}>Public (show on site)</span>
                                    </label>
                                </div>

                                <div className="admin-form-group" style={{ marginTop: '16px' }}>
                                    <label className="admin-form-label">Banner Image URL</label>
                                    <input
                                        type="url"
                                        className="admin-input"
                                        value={formData.bannerImage}
                                        onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                                        placeholder="https://example.com/sale-banner.jpg"
                                    />
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    {editingCampaign ? 'Save Changes' : 'Create Campaign'}
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
                            <h3 className="admin-modal-title">Delete Campaign</h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setShowDeleteConfirm(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>
                                Are you sure you want to delete this campaign? This action cannot be undone.
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

export default CampaignManagementMinimal;
