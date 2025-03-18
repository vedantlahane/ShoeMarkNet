import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFilters, setOpenFilter } from "../app/FilterSlice";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";//imported AdjustmentsHorizontalIcon from Heroicons
import Filter from "./Filter";//imported Filter component
import ShoeCard from "./ShoeCard";
import Title from './utils/Title';

const Explore = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFilterToggle = () => {
    dispatch(
      setOpenFilter({
        filterState: true,
      })
    );
  };

  useEffect(() => {// useEffect hook is used to fetch data from the backend API
    const fetchShoes = async () => {//fetchShoes function is used to fetch shoes data from the backend API
      try {
        setLoading(true);
        let url = 'http://localhost:5000/api/shoes';
        
        if (Object.values(filters).some(value => value !== "")) {//if statement to check if any filter is applied
          const query = new URLSearchParams(filters).toString();
          url = `http://localhost:5000/api/shoes/filter?${query}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setShoes(data);
        setError("");
      } catch (err) {
        console.error('Fetch error:', err);
        setError("Error fetching shoes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchShoes();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  return (
    <>
      <div className="relative h-auto w-auto flex flex-col">
        <div className="bg-theme clip-path h-[85vh] lg:h-[75vh] md:h-[65vh] sm:h-[55vh] w-auto absolute top-0 left-0 right-0 opacity-100 z-10"></div>
        <div className="relative opacity-100 z-20 grid items-center justify-items-center nike-container mt-24"> {/* Added mt-24 for navbar spacing */}
          <div className="grid items-center justify-items-center">
            {/* Filter Button */}
            <div className="absolute top-0 left-0">
              <button
                type="button"
                onClick={onFilterToggle}
                className="bg-white/90 blur-effect-theme button-theme p-2 shadow-md rounded-full"
              >
                <AdjustmentsHorizontalIcon className="icon-style text-slate-900 w-6 h-6" />
              </button>
            </div>

            <Title title="Explore Shoes" />
            
            {/* Filter Component */}
            <Filter />

            {loading && (
              <div className="text-center text-slate-200 mt-4">
                Loading...
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                {error}
              </div>
            )}

            <div className="nike-container mt-8">
              <div className={`grid items-center justify-items-center gap-7 lg:gap-5 mt-7 grid-cols-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1`}>
                {shoes.map((shoe) => (
                  <ShoeCard key={shoe._id} shoe={shoe} />
                ))}
              </div>

              {!loading && shoes.length === 0 && (
                <div className="text-center text-slate-200 mt-8">
                  No shoes found matching your criteria
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Explore;