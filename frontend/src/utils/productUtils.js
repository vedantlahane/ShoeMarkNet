export const generateSKU = (name = '', brand = '') => {
  const normalize = (value) => value
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const normalizedName = normalize(name);
  const normalizedBrand = normalize(brand || 'SMN');

  const nameSegment = normalizedName.slice(0, 6) || 'PRODUCT';
  const brandSegment = normalizedBrand.slice(0, 4) || 'SMN';
  const timestampSegment = Date.now().toString().slice(-5);

  return `${brandSegment}-${nameSegment}-${timestampSegment}`;
};

export const validateProduct = (product) => {
  const errors = {};
  if (!product?.name || !product.name.trim()) {
    errors.name = 'Product name is required';
  }

  if (!product?.price && product?.price !== 0) {
    errors.price = 'Price is required';
  } else if (Number(product.price) < 0) {
    errors.price = 'Price must be a positive number';
  }

  if (product?.originalPrice && Number(product.originalPrice) < Number(product.price)) {
    errors.originalPrice = 'Original price must be greater than or equal to price';
  }

  if (product?.countInStock === undefined || product?.countInStock === null) {
    errors.countInStock = 'Stock quantity is required';
  } else if (Number(product.countInStock) < 0) {
    errors.countInStock = 'Stock quantity cannot be negative';
  }

  if (!product?.category || product.category === 'all') {
    errors.category = 'Please select a category';
  }

  if (Array.isArray(product?.images) && product.images.some((img) => !img)) {
    errors.images = 'Remove empty image entries or provide a valid URL';
  }

  return errors;
};

export const sanitizeProduct = (product = {}) => {
  const cleaned = { ...product };
  if (Array.isArray(cleaned.images)) {
    cleaned.images = cleaned.images.filter(Boolean);
  }

  if (Array.isArray(cleaned.metaKeywords)) {
    cleaned.metaKeywords = cleaned.metaKeywords.filter(Boolean);
  }

  if (typeof cleaned.price === 'string') {
    cleaned.price = Number(cleaned.price) || 0;
  }

  if (typeof cleaned.countInStock === 'string') {
    cleaned.countInStock = Number(cleaned.countInStock) || 0;
  }

  return cleaned;
};

export default {
  generateSKU,
  validateProduct,
  sanitizeProduct
};
