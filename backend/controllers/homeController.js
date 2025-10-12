const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Campaign = require('../models/Campaign');

const numberFormatter = new Intl.NumberFormat('en');

const mapHeroData = ({ product, stats, countdownTarget, brandCount }) => {
  if (!product && !stats) {
    return null;
  }

  const headlineProduct = product || {};
  const description = (headlineProduct.description || '').trim();
  const discountFeature =
    typeof headlineProduct.discountPercentage === 'number' && headlineProduct.discountPercentage > 0
      ? `${headlineProduct.discountPercentage}% off MSRP`
      : null;
  const reviewsFeature =
    typeof headlineProduct.rating === 'number' && headlineProduct.rating > 0
      ? `${headlineProduct.rating.toFixed(1)}★ from ${numberFormatter.format(headlineProduct.numReviews || 0)} reviews`
      : null;
  const stockFeature =
    stats?.pairsInStock
      ? `${numberFormatter.format(Math.max(stats.pairsInStock, 1))} pairs ready to ship`
      : null;

  const featureSet = [
    headlineProduct.brand ? `${headlineProduct.brand} exclusive` : null,
    discountFeature,
    reviewsFeature,
    stockFeature,
  ].filter(Boolean);

  return {
    headline: headlineProduct.name
      ? `Elevate your stride with ${headlineProduct.name}`
      : 'Discover premium footwear for every journey',
    subheading: headlineProduct.brand || 'Featured release',
    description: description.substring(0, 220),
    countdownTarget,
    features: featureSet.slice(0, 3),
    stats: [
      {
        id: 'curated-styles',
        label: 'Curated styles',
        value: stats?.featuredCount ? `${numberFormatter.format(stats.featuredCount)}+` : '—',
      },
      {
        id: 'average-rating',
        label: 'Average rating',
        value: stats?.averageRating ? stats.averageRating.toFixed(1) : '—',
      },
      {
        id: 'pairs-in-stock',
        label: 'Pairs in stock',
        value: stats?.pairsInStock ? numberFormatter.format(stats.pairsInStock) : '—',
      },
      {
        id: 'active-brands',
        label: 'Active brands',
        value: brandCount ? `${brandCount}` : '—',
      },
    ],
    product: headlineProduct
      ? {
          id: headlineProduct._id,
          name: headlineProduct.name,
          slug: headlineProduct.slug,
          brand: headlineProduct.brand,
          price: headlineProduct.price,
          originalPrice: headlineProduct.originalPrice,
          discountPercentage: headlineProduct.discountPercentage,
          image: Array.isArray(headlineProduct.images) ? headlineProduct.images[0] : null,
          rating: headlineProduct.rating,
          numReviews: headlineProduct.numReviews,
        }
      : null,
  };
};

const formatBrandPartner = (partner) => {
  const priceRange = {
    min: typeof partner.minPrice === 'number' ? partner.minPrice : null,
    max: typeof partner.maxPrice === 'number' ? partner.maxPrice : null,
  };

  return {
    name: partner.name,
    productCount: partner.productCount || 0,
    averageRating: partner.avgRating ? Number(partner.avgRating.toFixed(1)) : null,
    priceRange,
    topCategories: (partner.topCategories || []).map((category) => ({
      name: category.name,
      slug: category.slug,
    })),
    highlightProduct: partner.highlightProduct
      ? {
          name: partner.highlightProduct.name,
          slug: partner.highlightProduct.slug,
          image: partner.highlightProduct.image,
          price: partner.highlightProduct.price,
          discountPercentage: partner.highlightProduct.discountPercentage,
          rating: partner.highlightProduct.rating,
        }
      : null,
  };
};

const buildBrandMetrics = (partners) => {
  if (!partners.length) {
    return [];
  }

  const totalProducts = partners.reduce((total, partner) => total + (partner.productCount || 0), 0);
  const avgBrandRating = partners.reduce((total, partner) => total + (partner.avgRating || 0), 0) / partners.length;
  const categorySet = new Set();
  partners.forEach((partner) => {
    (partner.topCategories || []).forEach((category) => {
      if (category && category.slug) {
        categorySet.add(category.slug);
      }
    });
  });

  return [
    {
      label: 'Partner brands',
      value: `${partners.length}`,
    },
    {
      label: 'Styles in catalogue',
      value: totalProducts ? numberFormatter.format(totalProducts) : '0',
    },
    {
      label: 'Average brand rating',
      value: avgBrandRating ? avgBrandRating.toFixed(1) : '—',
    },
    {
      label: 'Distinct categories',
      value: categorySet.size ? `${categorySet.size}` : '0',
    },
  ];
};

const formatPromotion = (campaign) => ({
  id: campaign._id,
  title: campaign.name,
  description: campaign.description,
  discount: campaign.discount,
  image: campaign.bannerImage || campaign.marketing?.bannerImage || null,
  link: campaign.ctaUrl || campaign.marketing?.landingPageUrl || '/products',
  badge: campaign.type || 'Special',
  startDate: campaign.startDate,
  endDate: campaign.endDate,
});

const formatCategory = (category) => ({
  id: category._id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  image: category.image,
  productCount: category.productCount,
  level: category.level,
});

const getHomeOverview = asyncHandler(async (req, res) => {
  const now = new Date();

  const [heroProduct] = await Product.find({ isActive: true })
    .sort({ isFeatured: -1, isNewArrival: -1, rating: -1, numReviews: -1, updatedAt: -1 })
    .limit(1)
    .select('name brand price originalPrice discountPercentage images rating numReviews description slug')
    .lean();

  const heroStats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        featuredCount: { $sum: { $cond: ['$isFeatured', 1, 0] } },
        averageRating: { $avg: '$rating' },
        pairsInStock: { $sum: '$countInStock' },
      },
    },
  ]);

  const brandAggregation = await Product.aggregate([
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
    { $limit: 6 },
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
  ]);

  const categories = await Category.find({ isActive: true })
    .sort({ isFeatured: -1, productCount: -1, name: 1 })
    .limit(6)
    .select('name slug description image productCount level')
    .lean();

  const promotions = await Campaign.find({
    isPublic: true,
    isActive: true,
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ priority: -1, startDate: 1 })
    .limit(4)
    .lean();

  const heroData = mapHeroData({
    product: heroProduct || null,
    stats: heroStats?.[0] || null,
    countdownTarget: promotions?.[0]?.endDate || new Date(Date.now() + 72 * 60 * 60 * 1000),
    brandCount: brandAggregation.length,
  });

  const partners = brandAggregation.map((partner) =>
    formatBrandPartner({
      name: partner._id,
      productCount: partner.productCount,
      avgRating: partner.avgRating,
      minPrice: partner.minPrice,
      maxPrice: partner.maxPrice,
      topCategories: partner.topCategories || [],
      highlightProduct: partner.topProduct
        ? {
            name: partner.topProduct.name,
            slug: partner.topProduct.slug,
            image: Array.isArray(partner.topProduct.images) ? partner.topProduct.images[0] : null,
            price: partner.topProduct.price,
            discountPercentage: partner.topProduct.discountPercentage,
            rating: partner.topProduct.rating,
          }
        : null,
    })
  );

  const payload = {
    hero: heroData,
    brands: {
      partners,
      metrics: buildBrandMetrics(
        brandAggregation.map((partner) => ({
          name: partner._id,
          productCount: partner.productCount,
          avgRating: partner.avgRating,
          topCategories: partner.topCategories || [],
        }))
      ),
    },
    categories: categories.map(formatCategory),
    promotions: promotions.map(formatPromotion),
  };

  res.success('Home overview fetched successfully', payload);
});

module.exports = {
  getHomeOverview,
};
