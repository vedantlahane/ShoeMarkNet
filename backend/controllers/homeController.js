const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Campaign = require('../models/Campaign');

const numberFormatter = new Intl.NumberFormat('en');

const PROMOTION_ACCENTS = ['blue', 'green', 'purple', 'orange'];
const CATEGORY_ACCENTS = ['primary', 'secondary', 'accent', 'neutral'];

const mapHeroData = ({ product, stats, countdownTarget, brandCount }) => {
  if (!product && !stats) return null;

  const p = product || {};
  const discountFeature = p.discountPercentage > 0 ? `${p.discountPercentage}% off MSRP` : null;
  const reviewsFeature = p.rating > 0 ? `${p.rating.toFixed(1)}★ from ${numberFormatter.format(p.numReviews || 0)} reviews` : null;
  const stockFeature = stats?.pairsInStock ? `${numberFormatter.format(Math.max(stats.pairsInStock, 1))} pairs ready to ship` : null;

  const features = [p.brand ? `${p.brand} exclusive` : null, discountFeature, reviewsFeature, stockFeature].filter(Boolean);

  return {
    headline: p.name ? `Elevate your stride with ${p.name}` : 'Discover premium footwear for every journey',
    subheading: p.brand || 'Featured release',
    description: (p.description || '').substring(0, 220),
    countdownTarget,
    features: features.slice(0, 3),
    stats: [
      { id: 'curated-styles', label: 'Curated styles', value: stats?.featuredCount ? `${numberFormatter.format(stats.featuredCount)}+` : '—' },
      { id: 'average-rating', label: 'Average rating', value: stats?.averageRating ? stats.averageRating.toFixed(1) : '—' },
      { id: 'pairs-in-stock', label: 'Pairs in stock', value: stats?.pairsInStock ? numberFormatter.format(stats.pairsInStock) : '—' },
      { id: 'active-brands', label: 'Active brands', value: brandCount ? `${brandCount}` : '—' },
    ],
    product: p._id ? {
      id: p._id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: p.price,
      originalPrice: p.originalPrice,
      discountPercentage: p.discountPercentage,
      image: Array.isArray(p.images) ? p.images[0] : null,
      rating: p.rating,
      numReviews: p.numReviews,
    } : null,
  };
};

const formatBrandPartner = (partner) => ({
  name: partner._id,
  productCount: partner.productCount || 0,
  averageRating: partner.avgRating ? Number(partner.avgRating.toFixed(1)) : null,
  priceRange: {
    min: typeof partner.minPrice === 'number' ? partner.minPrice : null,
    max: typeof partner.maxPrice === 'number' ? partner.maxPrice : null,
  },
  topCategories: (partner.topCategories || []).map(cat => ({ name: cat.name, slug: cat.slug })),
  highlightProduct: partner.topProduct ? {
    name: partner.topProduct.name,
    slug: partner.topProduct.slug,
    image: Array.isArray(partner.topProduct.images) ? partner.topProduct.images[0] : null,
    price: partner.topProduct.price,
    discountPercentage: partner.topProduct.discountPercentage,
    rating: partner.topProduct.rating,
  } : null,
});

const buildBrandMetrics = (partners) => {
  if (!partners.length) return [];

  const totalProducts = partners.reduce((sum, p) => sum + (p.productCount || 0), 0);
  const avgRating = partners.reduce((sum, p) => sum + (p.avgRating || 0), 0) / partners.length;
  const categories = new Set(partners.flatMap(p => (p.topCategories || []).map(c => c.slug)).filter(Boolean));

  return [
    { label: 'Partner brands', value: `${partners.length}` },
    { label: 'Styles in catalogue', value: totalProducts ? numberFormatter.format(totalProducts) : '0' },
    { label: 'Average brand rating', value: avgRating ? avgRating.toFixed(1) : '—' },
    { label: 'Distinct categories', value: `${categories.size}` },
  ];
};

const formatPromotion = (campaign, index) => {
  const discount = typeof campaign.discount === 'number' ? campaign.discount :
                   typeof campaign.discount === 'string' ? Number(campaign.discount.replace(/[^0-9.]/g, '')) : null;

  return {
    id: campaign._id,
    title: campaign.name,
    description: campaign.description,
    discount,
    image: campaign.bannerImage || campaign.marketing?.bannerImage || null,
    link: campaign.ctaUrl || campaign.marketing?.landingPageUrl || '/products',
    badge: campaign.type || 'Special',
    startsAt: campaign.startDate,
    endsAt: campaign.endDate,
    accent: PROMOTION_ACCENTS[index % PROMOTION_ACCENTS.length],
  };
};

const formatCategory = (category, index) => ({
  id: category._id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  image: category.image,
  productCount: category.productCount,
  level: category.level,
  accent: CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length],
});

const formatProductCard = (product) => {
  const image = Array.isArray(product.images) ? product.images[0] : null;
  const discount = product.discountPercentage > 0 ? Number(product.discountPercentage.toFixed(0)) : null;
  const badges = [
    product.isNewArrival ? 'New arrival' : null,
    discount ? `${discount}% off` : null,
    product.stockStatus === 'low-stock' ? 'Almost gone' : null,
  ].filter(Boolean);

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    price: product.price,
    originalPrice: product.originalPrice,
    discountPercentage: discount,
    rating: product.rating ? Number(product.rating.toFixed(1)) : null,
    numReviews: product.numReviews,
    stockStatus: product.stockStatus || null,
    image,
    badges,
    category: product.category ? {
      id: product.category._id,
      name: product.category.name,
      slug: product.category.slug,
    } : null,
  };
};

const getHomeOverview = asyncHandler(async (req, res) => {
  const now = new Date();

  const [heroProducts, heroStats, brandAggregation, categories, promotions, featuredProducts] = await Promise.all([
    Product.find({ isActive: true })
      .sort({ isFeatured: -1, isNewArrival: -1, rating: -1, numReviews: -1, updatedAt: -1 })
      .limit(1)
      .select('name brand price originalPrice discountPercentage images rating numReviews description slug')
      .lean(),
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          featuredCount: { $sum: { $cond: ['$isFeatured', 1, 0] } },
          averageRating: { $avg: '$rating' },
          pairsInStock: { $sum: '$countInStock' },
        },
      },
    ]),
    Product.aggregate([
      { $match: { isActive: true, brand: { $ne: null } } },
      { $sort: { isFeatured: -1, rating: -1, numReviews: -1 } },
      {
        $group: {
          _id: '$brand',
          productCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          categories: { $addToSet: '$category' },
          topProduct: { $first: '$$ROOT' },
        },
      },
      { $sort: { productCount: -1, avgRating: -1 } },
  { $limit: 8 },
      {
        $lookup: {
          from: 'categories',
          let: { categoryIds: '$categories' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$categoryIds'] } } },
            { $project: { name: 1, slug: 1, productCount: 1 } },
            { $sort: { productCount: -1 } },
            { $limit: 3 },
          ],
          as: 'topCategories',
        },
      },
    ]),
    Category.find({ isActive: true })
      .sort({ isFeatured: -1, productCount: -1, name: 1 })
  .limit(10)
      .select('name slug description image productCount level')
      .lean(),
    Campaign.find({
      isPublic: true,
      isActive: true,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ priority: -1, startDate: 1 })
      .limit(4)
      .lean(),
    Product.find({ isActive: true, isFeatured: true })
      .sort({ updatedAt: -1, rating: -1, numReviews: -1 })
      .limit(12)
      .select('name slug brand price originalPrice discountPercentage images rating numReviews isNewArrival countInStock')
      .populate('category', 'name slug')
      .lean({ virtuals: true }),
  ]);

  const heroData = mapHeroData({
    product: heroProducts?.[0] || null,
    stats: heroStats?.[0] || null,
    countdownTarget: promotions?.[0]?.endDate || new Date(Date.now() + 72 * 60 * 60 * 1000),
    brandCount: brandAggregation.length,
  });

  const partners = brandAggregation.map(formatBrandPartner);

  const payload = {
    hero: heroData,
    brands: {
      partners,
      metrics: buildBrandMetrics(brandAggregation.map(p => ({
        productCount: p.productCount,
        avgRating: p.avgRating,
        topCategories: p.topCategories || [],
      }))),
    },
    categories: categories.map(formatCategory),
    promotions: promotions.map(formatPromotion),
    featuredProducts: featuredProducts.map(formatProductCard),
  };

  res.success('Home overview fetched successfully', payload);
});

module.exports = {
  getHomeOverview,
};
