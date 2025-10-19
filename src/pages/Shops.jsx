import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopsAPI } from '../services/api';
import { Search, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Store, MapPin, Phone, User, X } from 'lucide-react';

const Shops = ({ isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    verification: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    user_id: '', // Optional - if empty, shop will be created for admin
    verified: true
  });
  const queryClient = useQueryClient();

  const { data: shopsResponse, isLoading, error, refetch } = useQuery(
    ['shops'], 
    () => shopsAPI.getShops()
  );

  const deleteMutation = useMutation(shopsAPI.deleteShop, {
    onSuccess: () => {
      queryClient.invalidateQueries(['shops']);
    },
    onError: (error) => {
      alert(`Error deleting shop: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  });

  const verifyMutation = useMutation(shopsAPI.verifyShop, {
    onSuccess: () => {
      queryClient.invalidateQueries(['shops']);
    },
    onError: (error) => {
      alert(`Error verifying shop: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  });

  const updateShopMutation = useMutation(
    ({ id, data }) => shopsAPI.updateShopAdmin(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shops']);
      },
      onError: (error) => {
        alert(`Error updating shop: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }
  );

  const handleCreateShop = async (e) => {
    e.preventDefault();
    setIsLoadingCreate(true);

    try {
      // Remove empty user_id if provided
      const submitData = { ...formData };
      if (!submitData.user_id.trim()) {
        delete submitData.user_id;
      }

      await shopsAPI.createShopAdmin(submitData);
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        user_id: '',
        verified: true
      });
      setIsCreateModalOpen(false);
      
      // Refresh shops list
      refetch();
      
      alert('Shop created successfully!');
    } catch (error) {
      console.error('Error creating shop:', error);
      alert(`Error creating shop: ${error.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setIsLoadingCreate(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleVerification = (shop) => {
    const newVerifiedStatus = !shop.verified;
    if (window.confirm(`Are you sure you want to ${newVerifiedStatus ? 'verify' : 'unverify'} this shop?`)) {
      updateShopMutation.mutate({
        id: shop.id,
        data: {
          name: shop.name,
          description: shop.description,
          address: shop.address,
          phone: shop.phone
        },
        verified: newVerifiedStatus
      });
    }
  };

  const handleDeleteShop = (shopId, shopName) => {
    if (window.confirm(`Are you sure you want to delete the shop "${shopName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(shopId);
    }
  };

  // Filter shops based on search term and filters
  const filteredShops = React.useMemo(() => {
    if (!shopsResponse) return [];
    
    let shops = Array.isArray(shopsResponse) ? shopsResponse : shopsResponse.data || [];
    
    // Apply search filter
    if (searchTerm) {
      shops = shops.filter(shop => 
        shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.phone?.includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (filters.status) {
      shops = shops.filter(shop => shop.status?.toLowerCase() === filters.status.toLowerCase());
    }
    
    // Apply verification filter
    if (filters.verification) {
      if (filters.verification === 'verified') {
        shops = shops.filter(shop => shop.verified === true);
      } else if (filters.verification === 'pending') {
        shops = shops.filter(shop => shop.verified === false);
      }
    }
    
    return shops;
  }, [shopsResponse, searchTerm, filters]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: "'Poppins', sans-serif",
      color: isDarkMode ? '#ffffff' : '#1f2937',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      margin: 0,
      fontFamily: "'Poppins', sans-serif",
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#004aad',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      fontFamily: "'Poppins', sans-serif",
      transition: 'background-color 0.2s',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '16px',
    },
    statCard: {
      backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textAlign: 'center',
      border: isDarkMode ? '1px solid #404040' : 'none',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#004aad',
      margin: '0 0 4px 0',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
      margin: 0,
    },
    searchContainer: {
      backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: isDarkMode ? '1px solid #404040' : 'none',
    },
    searchRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    searchInputContainer: {
      position: 'relative',
      flex: 1,
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: isDarkMode ? '#a0a0a0' : '#9ca3af',
      width: '16px',
      height: '16px',
    },
    searchInput: {
      width: '100%',
      paddingLeft: '36px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
      border: `1px solid ${isDarkMode ? '#404040' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontFamily: "'Poppins', sans-serif",
      outline: 'none',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
    },
    filtersContainer: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
    },
    select: {
      padding: '8px 12px',
      border: `1px solid ${isDarkMode ? '#404040' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontFamily: "'Poppins', sans-serif",
      outline: 'none',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      minWidth: '150px',
    },
    errorContainer: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '6px',
    },
    tableContainer: {
      backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      border: isDarkMode ? '1px solid #404040' : 'none',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHeader: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb',
    },
    tableHeaderCell: {
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontFamily: "'Poppins', sans-serif",
    },
    tableRow: {
      borderBottom: `1px solid ${isDarkMode ? '#404040' : '#e5e7eb'}`,
      transition: 'background-color 0.2s',
    },
    tableCell: {
      padding: '16px',
      fontSize: '0.875rem',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      fontFamily: "'Poppins', sans-serif",
    },
    loadingCell: {
      padding: '32px 16px',
      textAlign: 'center',
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      border: '2px solid #e5e7eb',
      borderTop: '2px solid #004aad',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      margin: '0 auto',
    },
    emptyCell: {
      padding: '32px 16px',
      textAlign: 'center',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
    },
    badge: {
      padding: '4px 8px',
      fontSize: '0.75rem',
      borderRadius: '9999px',
      fontWeight: '500',
      display: 'inline-block',
    },
    statusBadge: {
      active: { backgroundColor: '#dcfce7', color: '#166534' },
      inactive: { backgroundColor: '#fecaca', color: '#dc2626' },
      pending: { backgroundColor: '#fef3c7', color: '#d97706' },
      suspended: { backgroundColor: '#f3f4f6', color: '#374151' },
    },
    verificationBadge: {
      verified: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
      pending: { backgroundColor: '#fef3c7', color: '#d97706' },
      rejected: { backgroundColor: '#fecaca', color: '#dc2626' },
    },
    actionsContainer: {
      display: 'flex',
      gap: '8px',
    },
    actionButton: {
      padding: '6px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewButton: {
      color: '#2563eb',
    },
    editButton: {
      color: '#059669',
    },
    verifyButton: {
      color: '#16a34a',
    },
    rejectButton: {
      color: '#dc2626',
    },
    deleteButton: {
      color: '#991b1b',
    },
    shopInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    shopImage: {
      width: '40px',
      height: '40px',
      borderRadius: '6px',
      objectFit: 'cover',
      backgroundColor: isDarkMode ? '#404040' : '#f3f4f6',
    },
    shopDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    shopName: {
      fontWeight: '500',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      margin: 0,
    },
    shopLocation: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '0.75rem',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
      margin: 0,
    },
    contactInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '0.75rem',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
    },
    metricsContainer: {
      display: 'flex',
      gap: '12px',
    },
    metric: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      backgroundColor: isDarkMode ? '#404040' : '#f8fafc',
      borderRadius: '4px',
      minWidth: '60px',
    },
    metricValue: {
      fontWeight: '600',
      color: '#004aad',
      fontSize: '0.875rem',
    },
    metricLabel: {
      fontSize: '0.7rem',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
    },
    // Modal Styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
      cursor: 'pointer',
      padding: '4px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    input: {
      padding: '10px 12px',
      border: `1px solid ${isDarkMode ? '#404040' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '0.875rem',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    textarea: {
      padding: '10px 12px',
      border: `1px solid ${isDarkMode ? '#404040' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '0.875rem',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      outline: 'none',
      minHeight: '80px',
      resize: 'vertical',
      fontFamily: "'Poppins', sans-serif",
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    checkbox: {
      width: '16px',
      height: '16px',
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
    },
    submitButton: {
      backgroundColor: '#004aad',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '10px',
    },
    loadingButton: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    helperText: {
      fontSize: '0.75rem',
      color: isDarkMode ? '#a0a0a0' : '#6b7280',
      fontStyle: 'italic',
    },
  };

  const columns = [
    {
      key: 'shop',
      header: 'Shop',
      render: (shop) => (
        <div style={styles.shopInfo}>
          <img 
            src={shop.logo || shop.image || '/api/placeholder/40/40'} 
            alt={shop.name}
            style={styles.shopImage}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODIgMTIgMTIgMTUuNTgyIDEyIDIwQzEyIDI0LjQxOCAxNS41ODIgMjggMjAgMjhDMjQuNDE4IDI4IDI4IDI0LjQxOCAyOCAyMEMyOCAxNS41ODIgMjQuNDE4IDEyIDIwIDEyWk0yMCAyNkMxNy43OTEgMjYgMTYgMjQuMjA5IDE2IDIyQzE2IDE5Ljc5MSAxNy43OTEgMTggMjAgMThDMjIuMjA5IDE4IDI0IDE5Ljc5MSAyNCAyMkMyNCAyNC4yMDkgMjIuMjA5IDI2IDIwIDI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }}
          />
          <div style={styles.shopDetails}>
            <p style={styles.shopName}>{shop.name || 'Unnamed Shop'}</p>
            <p style={styles.shopLocation}>
              <MapPin size={10} />
              {shop.address || 'No address'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (shop) => (
        <div style={styles.contactInfo}>
          <div style={styles.contactItem}>
            <User size={10} />
            {shop.owner_name || shop.user_id || 'Unknown Owner'}
          </div>
          <div style={styles.contactItem}>
            <Phone size={10} />
            {shop.contact_phone || shop.phone || 'No phone'}
          </div>
        </div>
      ),
    },
    {
      key: 'metrics',
      header: 'Metrics',
      render: (shop) => (
        <div style={styles.metricsContainer}>
          <div style={styles.metric}>
            <span style={styles.metricValue}>{shop.products_count || 0}</span>
            <span style={styles.metricLabel}>Products</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricValue}>{shop.orders_count || 0}</span>
            <span style={styles.metricLabel}>Orders</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricValue}>{shop.rating || '0.0'}</span>
            <span style={styles.metricLabel}>Rating</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (shop) => (
        <span style={{ 
          ...styles.badge, 
          ...styles.statusBadge[shop.status?.toLowerCase()] || styles.statusBadge.pending 
        }}>
          {shop.status || 'active'}
        </span>
      ),
    },
    {
      key: 'verification',
      header: 'Verification',
      render: (shop) => (
        <span style={{ 
          ...styles.badge, 
          ...(shop.verified ? styles.verificationBadge.verified : styles.verificationBadge.pending)
        }}>
          {shop.verified ? 'verified' : 'pending'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Registered',
      render: (shop) => shop.created_at ? new Date(shop.created_at).toLocaleDateString() : 'N/A',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (shop) => (
        <div style={styles.actionsContainer}>
          <button
            onClick={() => {
              // View shop details
              console.log('View shop:', shop);
            }}
            style={{ ...styles.actionButton, ...styles.viewButton }}
            title="View shop details"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={() => {
              // Edit shop
              console.log('Edit shop:', shop);
            }}
            style={{ ...styles.actionButton, ...styles.editButton }}
            title="Edit shop"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => handleToggleVerification(shop)}
            style={{ ...styles.actionButton, ...(shop.verified ? styles.rejectButton : styles.verifyButton) }}
            title={shop.verified ? 'Unverify shop' : 'Verify shop'}
            onMouseEnter={(e) => e.target.style.backgroundColor = shop.verified ? '#fecaca' : '#dcfce7'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {shop.verified ? <XCircle size={16} /> : <CheckCircle size={16} />}
          </button>
          
          <button
            onClick={() => handleDeleteShop(shop.id, shop.name)}
            style={{ ...styles.actionButton, ...styles.deleteButton }}
            title="Delete shop"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const shops = filteredShops;
  
  // Calculate stats from filtered shops
  const shopStats = [
    { label: 'Total Shops', value: shops.length },
    { label: 'Verified', value: shops.filter(shop => shop.verified).length },
    { label: 'Pending', value: shops.filter(shop => !shop.verified).length },
    { label: 'Active', value: shops.filter(shop => shop.status === 'active').length },
  ];

  if (isLoading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Shops Management</h1>
        <div style={styles.loadingCell}>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Shops Management</h1>
        <div style={styles.errorContainer}>
          Error loading shops: {error.response?.data?.detail || error.message}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Shops Management</h1>
        <button
          style={styles.addButton}
          onClick={() => setIsCreateModalOpen(true)}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#003366'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#004aad'}
        >
          <Plus size={16} />
          <span>Add Shop</span>
        </button>
      </div>

      {/* Shop Stats */}
      <div style={styles.statsContainer}>
        {shopStats.map((stat, index) => (
          <div key={index} style={styles.statCard}>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={styles.searchContainer}>
        <div style={styles.searchRow}>
          <div style={styles.searchInputContainer}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search shops by name, owner, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#404040' : '#d1d5db'}
            />
          </div>
          
          <div style={styles.filtersContainer}>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#404040' : '#d1d5db'}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              value={filters.verification}
              onChange={(e) => setFilters({ ...filters, verification: e.target.value })}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#004aad'}
              onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#404040' : '#d1d5db'}
            >
              <option value="">All Verification</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shops Table */}
      <div style={styles.tableContainer}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={styles.tableHeaderCell}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shops.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={styles.emptyCell}>
                    {searchTerm || filters.status || filters.verification 
                      ? 'No shops match your search criteria' 
                      : 'No shops found'
                    }
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr 
                    key={shop.id} 
                    style={styles.tableRow}
                    onMouseEnter={(e) => e.target.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = isDarkMode ? '#2d2d2d' : 'white'}
                  >
                    {columns.map((column) => (
                      <td key={column.key} style={styles.tableCell}>
                        {column.render ? column.render(shop) : shop[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div style={{ padding: '16px', borderTop: `1px solid ${isDarkMode ? '#404040' : '#e5e7eb'}`, textAlign: 'center' }}>
          <div style={{ color: isDarkMode ? '#a0a0a0' : '#6b7280', fontSize: '0.875rem' }}>
            Showing {shops.length} shops
          </div>
        </div>
      </div>

      {/* Create Shop Modal */}
      {isCreateModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Shop</h2>
              <button
                style={styles.closeButton}
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateShop} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Store size={14} />
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={styles.input}
                  placeholder="Enter shop name"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Store size={14} />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  style={styles.textarea}
                  placeholder="Enter shop description"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <MapPin size={14} />
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  style={styles.input}
                  placeholder="Enter shop address"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Phone size={14} />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={styles.input}
                  placeholder="Enter phone number"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <User size={14} />
                  User ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.user_id}
                  onChange={(e) => handleInputChange('user_id', e.target.value)}
                  style={styles.input}
                  placeholder="Leave empty to create for yourself"
                />
                <span style={styles.helperText}>
                  Leave empty to create the shop for your admin account
                </span>
              </div>

              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => handleInputChange('verified', e.target.checked)}
                  style={styles.checkbox}
                />
                <label style={styles.checkboxLabel}>
                  Verified Shop
                </label>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(isLoadingCreate && styles.loadingButton)
                }}
                disabled={isLoadingCreate}
                onMouseEnter={(e) => !isLoadingCreate && (e.target.style.backgroundColor = '#003366')}
                onMouseLeave={(e) => !isLoadingCreate && (e.target.style.backgroundColor = '#004aad')}
              >
                {isLoadingCreate ? 'Creating...' : 'Create Shop'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shops;