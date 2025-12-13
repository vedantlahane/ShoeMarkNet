import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

// API service (you'll need to implement this)
import contactService from '../../services/contactService';

// Utils
import { trackEvent } from '../../utils/analytics';
import { validateEmail, validatePhone } from '../../utils/validation';

// Initial state
const initialState = {
  // Contact form data
  formData: {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal'
  },
  
  // UI state
  loading: false,
  submitting: false,
  errors: {},
  validationErrors: {},
  
  // Submission status
  submitted: false,
  submissionId: null,
  submissionDate: null,
  
  // Contact list (for admin)
  contacts: [],
  totalContacts: 0,
  currentPage: 1,
  contactsLoading: false,
  contactsError: null,
  
  // Filters and search
  filters: {
    category: 'all',
    status: 'all',
    priority: 'all',
    dateRange: null
  },
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',
  
  // Contact details
  selectedContact: null,
  contactHistory: [],
  
  // Settings
  autoSave: true,
  emailNotifications: true,
  smsNotifications: false,
  
  // Statistics
  stats: {
    totalSubmissions: 0,
    responseRate: 0,
    averageResponseTime: 0,
    satisfactionScore: 0
  }
};

// Async thunks
export const submitContactForm = createAsyncThunk(
  'contact/submitForm',
  async (formData, { rejectWithValue, getState }) => {
    try {
      // Validate form data
      const errors = validateContactForm(formData);
      if (Object.keys(errors).length > 0) {
        return rejectWithValue({ validationErrors: errors });
      }

      // Track submission attempt
      trackEvent('contact_form_submission_started', {
        category: formData.category,
        has_phone: !!formData.phone,
        message_length: formData.message.length
      });

      // Submit to API
      const response = await contactService.submitContact({
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        source: 'contact_page'
      });

      // Track successful submission
      trackEvent('contact_form_submitted', {
        submission_id: response.id,
        category: formData.category,
        response_time: response.responseTime
      });

      toast.success('🎉 Message sent successfully! We\'ll get back to you soon.');

      return {
        submissionId: response.id,
        submissionDate: response.createdAt,
        estimatedResponseTime: response.estimatedResponseTime,
        confirmationNumber: response.confirmationNumber
      };

    } catch (error) {
      // Track submission failure
      trackEvent('contact_form_submission_failed', {
        error: error.message,
        category: formData.category
      });

      toast.error('Failed to send message. Please try again.');
      
      return rejectWithValue({
        message: error.message || 'Failed to submit contact form',
        code: error.code || 'SUBMISSION_ERROR'
      });
    }
  }
);

export const fetchContacts = createAsyncThunk(
  'contact/fetchContacts',
  async ({ page = 1, limit = 20, filters = {}, search = '' }, { rejectWithValue }) => {
    try {
      const response = await contactService.getContacts({
        page,
        limit,
        filters,
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      return {
        contacts: response.data,
        totalContacts: response.total,
        currentPage: page,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage
      };

    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch contacts',
        code: error.code || 'FETCH_ERROR'
      });
    }
  }
);

export const getContactById = createAsyncThunk(
  'contact/getById',
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await contactService.getContactById(contactId);
      
      return {
        contact: response.data,
        history: response.history || []
      };

    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch contact details',
        code: error.code || 'FETCH_CONTACT_ERROR'
      });
    }
  }
);

export const updateContactStatus = createAsyncThunk(
  'contact/updateStatus',
  async ({ contactId, status, response, assignedTo }, { rejectWithValue }) => {
    try {
      const result = await contactService.updateContactStatus(contactId, {
        status,
        response,
        assignedTo,
        updatedAt: new Date().toISOString()
      });

      trackEvent('contact_status_updated', {
        contact_id: contactId,
        old_status: result.oldStatus,
        new_status: status,
        has_response: !!response
      });

      toast.success('Contact status updated successfully');

      return result;

    } catch (error) {
      toast.error('Failed to update contact status');
      
      return rejectWithValue({
        message: error.message || 'Failed to update contact status',
        code: error.code || 'UPDATE_ERROR'
      });
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contact/delete',
  async (contactId, { rejectWithValue }) => {
    try {
      await contactService.deleteContact(contactId);
      
      trackEvent('contact_deleted', {
        contact_id: contactId
      });

      toast.success('Contact deleted successfully');

      return contactId;

    } catch (error) {
      toast.error('Failed to delete contact');
      
      return rejectWithValue({
        message: error.message || 'Failed to delete contact',
        code: error.code || 'DELETE_ERROR'
      });
    }
  }
);

export const fetchContactStats = createAsyncThunk(
  'contact/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactService.getContactStats();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch contact statistics',
        code: error.code || 'STATS_ERROR'
      });
    }
  }
);

// Validation helper
const validateContactForm = (formData) => {
  const errors = {};

  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (!formData.subject || formData.subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters long';
  }

  if (!formData.message || formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long';
  }

  if (formData.message && formData.message.length > 2000) {
    errors.message = 'Message must be less than 2000 characters';
  }

  return errors;
};

// Create slice
const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    // Form data management
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
      
      // Clear related errors when field is updated
      Object.keys(action.payload).forEach(field => {
        if (state.errors[field]) {
          delete state.errors[field];
        }
        if (state.validationErrors[field]) {
          delete state.validationErrors[field];
        }
      });
    },

    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
      
      // Clear field-specific errors
      if (state.errors[field]) {
        delete state.errors[field];
      }
      if (state.validationErrors[field]) {
        delete state.validationErrors[field];
      }
    },

    clearForm: (state) => {
      state.formData = initialState.formData;
      state.errors = {};
      state.validationErrors = {};
      state.submitted = false;
      state.submissionId = null;
      state.submissionDate = null;
    },

    setFormErrors: (state, action) => {
      state.errors = action.payload;
    },

    clearErrors: (state) => {
      state.errors = {};
      state.validationErrors = {};
    },

    // Contact list management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when search changes
    },

    setSortOrder: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },

    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    // Contact selection
    selectContact: (state, action) => {
      state.selectedContact = action.payload;
    },

    clearSelectedContact: (state) => {
      state.selectedContact = null;
      state.contactHistory = [];
    },

    // Settings
    updateSettings: (state, action) => {
      const { autoSave, emailNotifications, smsNotifications } = action.payload;
      if (autoSave !== undefined) state.autoSave = autoSave;
      if (emailNotifications !== undefined) state.emailNotifications = emailNotifications;
      if (smsNotifications !== undefined) state.smsNotifications = smsNotifications;
    },

    // Auto-save draft
    saveDraft: (state) => {
      if (state.autoSave) {
        localStorage.setItem('contactFormDraft', JSON.stringify({
          formData: state.formData,
          timestamp: Date.now()
        }));
      }
    },

    loadDraft: (state) => {
      try {
        const draft = localStorage.getItem('contactFormDraft');
        if (draft) {
          const parsed = JSON.parse(draft);
          // Only load draft if it's less than 24 hours old
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            state.formData = { ...state.formData, ...parsed.formData };
          } else {
            localStorage.removeItem('contactFormDraft');
          }
        }
      } catch (error) {
        console.warn('Failed to load contact form draft:', error);
        localStorage.removeItem('contactFormDraft');
      }
    },

    clearDraft: (state) => {
      localStorage.removeItem('contactFormDraft');
    },

    // Reset state
    resetContactState: (state) => {
      return { ...initialState };
    }
  },

  extraReducers: (builder) => {
    builder
      // Submit contact form
      .addCase(submitContactForm.pending, (state) => {
        state.submitting = true;
        state.loading = true;
        state.errors = {};
        state.validationErrors = {};
      })
      .addCase(submitContactForm.fulfilled, (state, action) => {
        state.submitting = false;
        state.loading = false;
        state.submitted = true;
        state.submissionId = action.payload.submissionId;
        state.submissionDate = action.payload.submissionDate;
        
        // Clear form after successful submission
        state.formData = initialState.formData;
        
        // Clear any saved draft
        localStorage.removeItem('contactFormDraft');
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.submitting = false;
        state.loading = false;
        
        if (action.payload?.validationErrors) {
          state.validationErrors = action.payload.validationErrors;
        } else {
          state.errors = {
            submit: action.payload?.message || 'Failed to submit contact form'
          };
        }
      })

      // Fetch contacts
      .addCase(fetchContacts.pending, (state) => {
        state.contactsLoading = true;
        state.contactsError = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contactsLoading = false;
        state.contacts = action.payload.contacts;
        state.totalContacts = action.payload.totalContacts;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.contactsLoading = false;
        state.contactsError = action.payload?.message || 'Failed to fetch contacts';
      })

      // Get contact by ID
      .addCase(getContactById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getContactById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedContact = action.payload.contact;
        state.contactHistory = action.payload.history;
      })
      .addCase(getContactById.rejected, (state, action) => {
        state.loading = false;
        state.errors = {
          fetch: action.payload?.message || 'Failed to fetch contact details'
        };
      })

      // Update contact status
      .addCase(updateContactStatus.fulfilled, (state, action) => {
        const updatedContact = action.payload;
        
        // Update in contacts list
        const index = state.contacts.findIndex(c => c.id === updatedContact.id);
        if (index !== -1) {
          state.contacts[index] = updatedContact;
        }
        
        // Update selected contact if it's the same one
        if (state.selectedContact?.id === updatedContact.id) {
          state.selectedContact = updatedContact;
        }
      })

      // Delete contact
      .addCase(deleteContact.fulfilled, (state, action) => {
        const deletedId = action.payload;
        
        // Remove from contacts list
        state.contacts = state.contacts.filter(c => c.id !== deletedId);
        state.totalContacts -= 1;
        
        // Clear selected contact if it was deleted
        if (state.selectedContact?.id === deletedId) {
          state.selectedContact = null;
          state.contactHistory = [];
        }
      })

      // Fetch contact stats
      .addCase(fetchContactStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

// Export actions
export const {
  updateFormData,
  updateFormField,
  clearForm,
  setFormErrors,
  clearErrors,
  setFilters,
  setSearchQuery,
  setSortOrder,
  setCurrentPage,
  selectContact,
  clearSelectedContact,
  updateSettings,
  saveDraft,
  loadDraft,
  clearDraft,
  resetContactState
} = contactSlice.actions;

// Selectors
export const selectContactFormData = (state) => state.contact.formData;
export const selectContactLoading = (state) => state.contact.loading;
export const selectContactSubmitting = (state) => state.contact.submitting;
export const selectContactErrors = (state) => state.contact.errors;
export const selectValidationErrors = (state) => state.contact.validationErrors;
export const selectContactSubmitted = (state) => state.contact.submitted;
export const selectContacts = (state) => state.contact.contacts;
export const selectContactsLoading = (state) => state.contact.contactsLoading;
export const selectSelectedContact = (state) => state.contact.selectedContact;
export const selectContactFilters = (state) => state.contact.filters;
export const selectContactSearchQuery = (state) => state.contact.searchQuery;
export const selectContactStats = (state) => state.contact.stats;

// Memoized selectors
export const selectFilteredContacts = (state) => {
  const { contacts, filters, searchQuery } = state.contact;
  
  return contacts.filter(contact => {
    // Apply category filter
    if (filters.category !== 'all' && contact.category !== filters.category) {
      return false;
    }
    
    // Apply status filter
    if (filters.status !== 'all' && contact.status !== filters.status) {
      return false;
    }
    
    // Apply priority filter
    if (filters.priority !== 'all' && contact.priority !== filters.priority) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        contact.name,
        contact.email,
        contact.subject,
        contact.message
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }
    
    return true;
  });
};

export const selectFormValidation = (state) => {
  const { formData } = state.contact;
  const errors = validateContactForm(formData);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    hasRequiredFields: formData.name && formData.email && formData.subject && formData.message
  };
};

// Export reducer
export default contactSlice.reducer;
