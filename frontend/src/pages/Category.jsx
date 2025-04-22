import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';

const Category = () => {
  const { categoryName } = useParams();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchProducts({ category: categoryName }));
  }, [dispatch, categoryName]);

  // Ensure products is always an array
  const productsList = Array.isArray(products) ? products : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{categoryName} Products</h1>
      {loading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
    ))}
  </div>
) :(
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productsList.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              No products found in this category.
            </div>
          ) : (
            productsList.map((product, index) => (
              <ProductCard key={product._id || index} product={product} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Category;
