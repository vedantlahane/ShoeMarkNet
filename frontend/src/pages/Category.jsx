import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageMeta from "../components/seo/PageMeta";
import PageLayout from "../components/common/layout/PageLayout";
import { fetchCategories } from "../redux/slices/categorySlice";

const normalizeCategory = (category, index) => {
  const slug =
    category?.slug ||
    category?.handle ||
    category?._id ||
    category?.id ||
    category?.name;

  return {
    id: category?._id || category?.id || slug || index,
    name: category?.name || category?.title || "Category",
    slug,
    description:
      category?.description || category?.seoDescription || "",
    image: category?.image || category?.heroImage || null,
    productCount: category?.productCount || 0,
  };
};

const Category = () => {
  const { categoryId, categoryName, slug, id } = useParams();
  const resolvedCategory = categoryId || categoryName || slug || id || "";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories = [], isLoading, error } = useSelector(
    (state) => state.category || {}
  );

  const [searchTerm, setSearchTerm] = useState("");

  // Deep-link support: if the route already includes a category, jump straight to Products
  useEffect(() => {
    if (!resolvedCategory) return;
    navigate(`/products?category=${encodeURIComponent(resolvedCategory)}`, {
      replace: true,
    });
  }, [resolvedCategory, navigate]);

  // Load categories for the gallery
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [categories, dispatch]);

  const normalizedCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []).map(normalizeCategory),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return normalizedCategories;
    const term = searchTerm.toLowerCase();
    return normalizedCategories.filter(
      (cat) =>
        cat.name?.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term)
    );
  }, [normalizedCategories, searchTerm]);

  const handleSelectCategory = (slugValue) => {
    if (!slugValue) return;
    navigate(`/products?category=${encodeURIComponent(slugValue)}`);
  };

  return (
    <>
      <PageMeta
        title="Categories | ShoeMarkNet"
        description="Browse categories to jump into tailored product lists."
        path="/categories"
      />

      <PageLayout
        breadcrumbs={
          <nav className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-300">
              Home
            </Link>
            <span className="mx-1.5 text-slate-400">/</span>
            <span className="text-slate-700 dark:text-slate-300">Categories</span>
          </nav>
        }
        title="Categories"
        description="Browse our collection by category and find the perfect pair."
        actions={
          <Link
            to="/products"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
          >
            <i className="fas fa-th-large" />
            View all products
          </Link>
        }
        background="gradient"
        paddingY="py-6 md:py-8"
      >
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <i className="fas fa-times" />
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-200">
            <i className="fas fa-exclamation-triangle mr-2" />
            {String(error)}
          </div>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading && normalizedCategories.length === 0
            ? Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 h-32 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="mb-2 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            ))
            : filteredCategories.map((cat, idx) => (
              <button
                key={cat.id || idx}
                onClick={() => handleSelectCategory(cat.slug || cat.name)}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
              >
                {/* Image Container */}
                <div className="relative h-36 w-full overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700">
                      <i className="fas fa-shoe-prints text-4xl text-blue-300 dark:text-slate-500" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 dark:text-slate-400">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                    <span className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      Browse collection
                    </span>
                    <i className="fas fa-arrow-right ml-2 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                </div>
              </button>
            ))}
        </div>

        {/* Empty State */}
        {!isLoading && filteredCategories.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <i className="fas fa-search text-2xl text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              No categories found
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No categories match "{searchTerm}". Try a different search term.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <i className="fas fa-times" />
              Clear search
            </button>
          </div>
        )}
      </PageLayout>
    </>
  );
};

export default Category;
