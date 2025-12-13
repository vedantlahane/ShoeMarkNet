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
            <span className="mx-1 text-slate-400">/</span>
            <span className="text-slate-700 dark:text-slate-300">Categories</span>
          </nav>
        }
        title="Categories"
        description="Choose a category to open products with filters applied."
        actions={
          <Link
            to="/products"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <i className="fas fa-compass" />
            View all products
          </Link>
        }
        background="gradient"
        paddingY="py-4 md:py-6"
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <label className="relative block">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <i className="fas fa-search" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/50"
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 shadow-sm dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-200">
            <i className="fas fa-exclamation-triangle mr-2" />
            {String(error)}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {isLoading && normalizedCategories.length === 0
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-3 h-28 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
                  <div className="mb-2 h-3.5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              ))
            : filteredCategories.map((cat, idx) => (
                <button
                  key={cat.id || idx}
                  onClick={() => handleSelectCategory(cat.slug || cat.name)}
                  className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  {cat.image && (
                    <div className="relative mb-3 overflow-hidden rounded-lg border border-slate-200/80 shadow-sm transition group-hover:shadow-md dark:border-slate-800/80">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-28 w-full object-cover transition duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 dark:text-slate-400">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
        </div>

        {!isLoading && filteredCategories.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <i className="fas fa-search mr-2 text-slate-400" />
            No categories match "{searchTerm}". Try a different search or reset the filter.
          </div>
        )}
      </PageLayout>
    </>
  );
};

export default Category;
