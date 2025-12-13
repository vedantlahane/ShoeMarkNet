import api from '../utils/api';

const contactService = {
  // Submit contact form
  submitContact: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },

  // Get all contacts (admin)
  getContacts: async (params) => {
    const response = await api.get('/admin/contacts', { params });
    return response.data;
  },

  // Get contact by ID
  getContactById: async (contactId) => {
    const response = await api.get(`/admin/contacts/${contactId}`);
    return response.data;
  },

  // Update contact status
  updateContactStatus: async (contactId, updateData) => {
    const response = await api.patch(`/admin/contacts/${contactId}/status`, updateData);
    return response.data;
  },

  // Delete contact
  deleteContact: async (contactId) => {
    const response = await api.delete(`/admin/contacts/${contactId}`);
    return response.data;
  },

  // Get contact statistics
  getContactStats: async () => {
    const response = await api.get('/admin/contacts/stats');
    return response.data;
  },

  // Send automated response
  sendResponse: async (contactId, responseData) => {
    const response = await api.post(`/admin/contacts/${contactId}/respond`, responseData);
    return response.data;
  }
};

export default contactService;
