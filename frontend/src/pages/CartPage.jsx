import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const CartPage = () => {
    const { cart, removeFromCart, fetchCart, updateCartItemQuantity } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryPhoneNumber, setDeliveryPhoneNumber] = useState('');

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        setIsFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        setDeliveryAddress(data.display_name);
                    } else {
                        alert('Could not fetch address details');
                    }
                } catch (error) {
                    alert('Error fetching address: ' + error.message);
                } finally {
                    setIsFetchingLocation(false);
                }
            },
            (error) => {
                alert('Error getting location: ' + error.message);
                setIsFetchingLocation(false);
            }
        );
    };

    const handlePlaceOrder = async (paymentMethod) => {
        if (!deliveryAddress || !deliveryPhoneNumber) {
            alert('Please enter delivery address and phone number');
            return;
        }
        setShowPaymentModal(false);
        setIsProcessing(true);
        try {
            await api.post('/orders', { paymentMethod, deliveryAddress, deliveryPhoneNumber });
            await fetchCart();
            navigate('/orders'); // Redirect to orders page to wait for confirmation
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Failed to place order.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className="w-full flex justify-center py-20 px-4">
                <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-orange-100 max-w-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">You need to log in to view your cart</h2>
                    <Link to="/login" className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full font-semibold mt-4">Login Now</Link>
                </div>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="w-full flex justify-center py-20 px-4">
                <div className="text-center max-w-lg">
                    <div className="text-6xl mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                    <Link to="/" className="inline-block bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-0.5">Explore Restaurants</Link>
                </div>
            </div>
        );
    }

    const total = cart.items.reduce((acc, item) => acc + (item.foodItem.price * item.quantity), 0);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b border-gray-200 pb-4">Checkout Cart</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {cart.items.map((item) => (
                        <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50 transition-colors">
                            <img src={item.foodItem.imageUrl || 'https://via.placeholder.com/150'} alt={item.foodItem.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
                            <div className="flex-grow text-center sm:text-left">
                                <h3 className="text-lg font-bold text-gray-800">{item.foodItem.name}</h3>
                                <p className="text-rose-600 font-semibold mt-1">₹{item.foodItem.price.toFixed(2)}</p>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-100 rounded-full overflow-hidden shadow-sm border border-gray-200">
                                    <button 
                                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                        className="px-4 py-2 text-gray-600 hover:bg-white hover:text-rose-500 font-bold transition-colors"
                                    >-</button>
                                    <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                        className="px-4 py-2 text-gray-600 hover:bg-white hover:text-green-500 font-bold transition-colors"
                                    >+</button>
                                </div>
                                <span className="font-bold text-xl text-gray-900 w-24 text-right">₹{(item.foodItem.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="bg-gray-50 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200">
                    <div className="mb-4 sm:mb-0 text-center sm:text-left">
                        <span className="text-gray-500 font-medium block">Total Amount</span>
                        <span className="text-3xl font-black text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={() => setShowPaymentModal(true)} 
                        disabled={isProcessing}
                        className={`w-full sm:w-auto text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${
                            isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600'
                        }`}
                    >
                        {isProcessing ? 'Processing...' : 'Proceed to Checkout '}
                    </button>
                </div>
            </div>

            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Checkout Details</h2>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-semibold text-gray-700">Delivery Address</label>
                                    <button 
                                        type="button" 
                                        onClick={handleUseCurrentLocation}
                                        disabled={isFetchingLocation}
                                        className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded transition-colors"
                                    >
                                        {isFetchingLocation ? 'Fetching...' : ' Use Current Location'}
                                    </button>
                                </div>
                                <textarea 
                                    value={deliveryAddress} 
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    placeholder="Enter full delivery address or use location above"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-gray-50"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                <input 
                                    type="tel"
                                    value={deliveryPhoneNumber} 
                                    onChange={(e) => setDeliveryPhoneNumber(e.target.value)}
                                    placeholder="Enter your phone number"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-gray-50"
                                    required
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Select Payment Method</h3>
                        <div className="space-y-4">
                            <button 
                                onClick={() => handlePlaceOrder('ONLINE')}
                                className="w-full flex items-center justify-between p-4 border-2 border-orange-100 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900">Pay Online</div>
                                        <div className="text-sm text-gray-500">Credit, Debit, UPI</div>
                                    </div>
                                </div>
                            </button>
                            <button 
                                onClick={() => handlePlaceOrder('COD')}
                                className="w-full flex items-center justify-between p-4 border-2 border-emerald-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900">Cash on Delivery</div>
                                        <div className="text-sm text-gray-500">Pay when it arrives</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <button 
                            onClick={() => setShowPaymentModal(false)}
                            className="mt-6 w-full text-center text-gray-500 hover:text-gray-800 font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
