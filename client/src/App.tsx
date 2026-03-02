import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from './components/ProductCard';
import SearchBar from './components/SearchBar';
import { getProducts, getCategories, Product } from './services/api';
import { useDebounce } from './hooks/useDebounce';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

// Add this near the top of your App component, right after the useState lines
useEffect(() => {
  console.log('🔍 Checking environment variables:');
  // @ts-ignore
  console.log('REACT_APP_API_URL from build:', window._env_ || process.env.REACT_APP_API_URL);
  console.log('Full config:', { 
    hasReactAppApiUrl: !!process.env.REACT_APP_API_URL,
    nodeEnv: process.env.NODE_ENV 
  });
}, []);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts(debouncedSearchTerm, selectedCategory);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStockUpdate = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const lowStockCount = products.filter(p => p.stock < 5).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Inventory Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-gray-600">Total Products: </span>
              <span className="font-bold text-gray-800">{products.length}</span>
            </div>
            {lowStockCount > 0 && (
              <div className="bg-red-100 px-4 py-2 rounded-lg shadow">
                <span className="text-red-700">Low Stock Alert: </span>
                <span className="font-bold text-red-700">{lowStockCount}</span>
              </div>
            )}
          </div>
        </div>

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onStockUpdate={handleStockUpdate}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;