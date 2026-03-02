import React, { useState } from 'react';
import { Product, updateProductStock } from '../services/api';

interface ProductCardProps {
  product: Product;
  onStockUpdate: (updatedProduct: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onStockUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newStock, setNewStock] = useState(product.stock);
  const [isUpdating, setIsUpdating] = useState(false);

  const isLowStock = product.stock < 5;

  const handleUpdateStock = async () => {
    if (newStock === product.stock || newStock < 0) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedProduct = await updateProductStock(product.id, newStock);
      onStockUpdate(updatedProduct);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Failed to update stock. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all ${
      isLowStock ? 'border-red-500' : 'border-transparent hover:border-blue-500'
    }`}>
      <img 
        src={product.image_url} 
        alt={product.name}
        loading="lazy"
        className="w-full h-48 object-cover"
      />
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <span className="text-sm bg-gray-200 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
        
        <p className="text-2xl font-bold text-gray-800 mb-3">
          ${product.price.toFixed(2)}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">Stock:</span>
            {isEditing ? (
              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                className="ml-2 w-20 px-2 py-1 border rounded"
                autoFocus
              />
            ) : (
              <span className={`ml-2 font-semibold ${
                isLowStock ? 'text-red-600' : 'text-green-600'
              }`}>
                {product.stock}
              </span>
            )}
          </div>
          
          <div className="space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdateStock}
                  disabled={isUpdating}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  {isUpdating ? '...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewStock(product.stock);
                  }}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;