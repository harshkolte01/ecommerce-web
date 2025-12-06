'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { checkoutAPI } from '@/lib/api';
import { useState } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsCheckingOut(true);
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      // console.log('Sending checkout request with items:', orderItems);
      const response = await checkoutAPI.createOrder(orderItems);
      
      clearCart();
      showToast('Order placed successfully!');
      router.push(`/orders/${response.order.id}`);
    } catch (error: any) {
      showToast(error.message || 'Checkout failed. Please try again.', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some products to your cart to get started.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {items.map((item) => (
              <div key={item.productId} className="p-6 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">₹{item.price} each</p>
                    <p className="text-sm text-gray-500">Stock: {item.stock}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            
            <button
              onClick={() => router.push('/products')}
              className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}