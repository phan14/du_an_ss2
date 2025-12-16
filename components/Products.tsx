import React, { useMemo, useState } from 'react';
import { Order, Product } from '../types';

interface ProductsProps {
  orders: Order[];
}

const Products: React.FC<ProductsProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extract unique products from orders
  const products = useMemo(() => {
    const productMap = new Map<string, Product>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const productName = item.productName.trim();

        if (!productMap.has(productName)) {
          productMap.set(productName, {
            name: productName,
            unitPrice: item.unitPrice,
            lastUpdated: order.createdAt,
            imageUrl: item.imageUrl
          });
        } else {
          // Update with the most recent price and date
          const existing = productMap.get(productName)!;
          if (new Date(order.createdAt) > new Date(existing.lastUpdated)) {
            existing.unitPrice = item.unitPrice;
            existing.lastUpdated = order.createdAt;
            if (item.imageUrl) {
              existing.imageUrl = item.imageUrl;
            }
          }
        }
      });
    });

    let sortedProducts = Array.from(productMap.values());

    // Filter by search term
    if (searchTerm.trim()) {
      sortedProducts = sortedProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'name') {
      sortedProducts.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    } else if (sortBy === 'price') {
      sortedProducts.sort((a, b) => {
        const comparison = a.unitPrice - b.unitPrice;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return sortedProducts;
  }, [orders, searchTerm, sortBy, sortOrder]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const handleSortToggle = (column: 'name' | 'price') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">Bảng Giá Sản Phẩm</h1>
        <p className="text-sm md:text-base text-slate-600">Danh sách giá của tất cả các sản phẩm</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 md:p-4 mb-4 md:mb-6 sticky top-0 z-20">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 md:px-4 py-3 md:py-2 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 text-xs md:text-sm">
            <button
              onClick={() => handleSortToggle('name')}
              className={`flex-1 px-3 py-2 rounded-lg border transition-all font-medium ${sortBy === 'name'
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
            >
              {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')} Tên
            </button>
            <button
              onClick={() => handleSortToggle('price')}
              className={`flex-1 px-3 py-2 rounded-lg border transition-all font-medium ${sortBy === 'price'
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
            >
              {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')} Giá
            </button>
          </div>
        </div>
      </div>

      {/* Table or Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 md:h-16 w-12 md:w-16 mx-auto text-slate-300 mb-3 md:mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-slate-500 text-base md:text-lg font-medium">Không có sản phẩm nào</p>
          <p className="text-slate-400 text-xs md:text-sm mt-2">Tạo một đơn hàng để thêm sản phẩm</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSortToggle('name')}
                      className="flex items-center gap-2 font-semibold text-slate-900 hover:text-blue-600 transition"
                    >
                      Sản Phẩm
                      {sortBy === 'name' && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? '' : 'rotate-180'
                            }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSortToggle('price')}
                      className="flex items-center gap-2 font-semibold text-slate-900 hover:text-blue-600 transition"
                    >
                      Giá Bán
                      {sortBy === 'price' && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? '' : 'rotate-180'
                            }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Cập Nhật Lần Cuối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold text-blue-600">
                        {formatPrice(product.unitPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(product.lastUpdated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-200">
            {products.map((product, index) => (
              <div
                key={index}
                className="p-4 space-y-3 active:bg-slate-100 transition-colors"
              >
                {/* Product Name and Image */}
                <div className="flex gap-3">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm break-words">{product.name}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Cập nhật: {formatDate(product.lastUpdated)}
                    </p>
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs font-medium text-blue-600 mb-1">Giá Bán</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-700">
                    {formatPrice(product.unitPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6 mb-20 md:mb-0">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 md:p-4">
            <p className="text-xs md:text-sm font-medium text-blue-600 mb-2">Tổng Sản Phẩm</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-900">{products.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-3 md:p-4">
            <p className="text-xs md:text-sm font-medium text-green-600 mb-2">Giá Cao Nhất</p>
            <p className="text-xl md:text-2xl font-bold text-green-900 break-words">
              {formatPrice(Math.max(...products.map(p => p.unitPrice)))}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-3 md:p-4">
            <p className="text-xs md:text-sm font-medium text-purple-600 mb-2">Giá Thấp Nhất</p>
            <p className="text-xl md:text-2xl font-bold text-purple-900 break-words">
              {formatPrice(Math.min(...products.map(p => p.unitPrice)))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
