import toast from 'react-hot-toast';

const baseToastOptions = {
	style: {
		background: 'rgba(17, 24, 39, 0.9)',
		color: '#F9FAFB',
		borderRadius: '18px',
		padding: '14px 18px',
		border: '1px solid rgba(59, 130, 246, 0.35)',
		boxShadow: '0 20px 35px -15px rgba(59, 130, 246, 0.55)'
	}
};

export const showSuccessToast = (message, options = {}) =>
	toast.success(message, {
		...baseToastOptions,
		iconTheme: {
			primary: '#34D399',
			secondary: '#0F172A'
		},
		...options
	});

export const showErrorToast = (message, options = {}) =>
	toast.error(message, {
		...baseToastOptions,
		iconTheme: {
			primary: '#F87171',
			secondary: '#0F172A'
		},
		...options
	});

export const showCartToast = (message, options = {}) =>
	toast(message, {
		...baseToastOptions,
		icon: '🛒',
		duration: 2500,
		...options
	});

export const showWishlistToast = (message, options = {}) =>
	toast(message, {
		...baseToastOptions,
		icon: '💖',
		duration: 2500,
		...options
	});

export default toast;
