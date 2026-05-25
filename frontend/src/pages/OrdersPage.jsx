import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PhonePeModal from '../components/PhonePeModal';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const [isProcessing, setIsProcessing] = useState(false);
    const [showPhonePe, setShowPhonePe] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
            loadRazorpayScript();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadRazorpayScript = () => {
        if (!document.getElementById('razorpay-script')) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.id = 'razorpay-script';
            script.async = true;
            document.body.appendChild(script);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await api.put(`/orders/cancel/${orderId}`);
            fetchOrders(); 
        } catch (err) {
            alert(err.message || 'Failed to cancel order');
        }
    };

    const handleRazorpay = async (orderId) => {
        setIsProcessing(true);
        try {
            // 1. Create Razorpay order
            const res = await api.post(`/payment/create-order/${orderId}`);
            const { razorpayOrderId, key, amount } = res.data;

            // 2. Open Razorpay Checkout
            const options = {
                key: key,
                amount: amount,
                currency: "INR",
                name: "CraveBite",
                description: "Order Payment",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        // 3. Verify payment signature
                        await api.post('/payment/verify', {
                            orderId: orderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        alert("Payment successful! Order is now PREPARING.");
                        fetchOrders();
                    } catch (verifyErr) {
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phoneNumber || "9999999999"
                },
                theme: {
                    color: "#10b981"
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay via UPI",
                                instruments: [
                                    { method: "upi" }
                                ]
                            },
                            other: {
                                name: "Other Payment Modes",
                                instruments: [
                                    { method: "card" },
                                    { method: "netbanking" },
                                    { method: "wallet" }
                                ]
                            }
                        },
                        sequence: ["block.upi", "block.other"],
                        preferences: {
                            show_default_blocks: true,
                        }
                    }
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                alert("Payment Failed. Reason: " + response.error.description);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (err) {
            alert(err.message || 'Failed to initiate payment');
            setIsProcessing(false);
        }
    };

    const handlePhonePeClick = (order) => {
        setCurrentOrder(order);
        setShowPhonePe(true);
    };

    const handlePhonePeSuccess = async (orderId) => {
        try {
            await api.post(`/payment/mock-success/${orderId}`);
            alert("Payment successful! Order is now PREPARING.");
            setShowPhonePe(false);
            fetchOrders();
        } catch (err) {
            alert("Payment verification failed");
            setShowPhonePe(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center w-full h-screen text-emerald-500"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-current"></div></div>;

    if (!user) {
        return <div className="w-full text-center mt-20 text-xl font-bold text-gray-700">Please login to view your orders.</div>;
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-4 border-emerald-500 pb-2 inline-block">Order History</h1>
            
            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="text-6xl mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
                    <p className="text-gray-500 mb-6">You haven't placed any orders. Start exploring!</p>
                    <Link to="/" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-full font-bold shadow hover:shadow-lg transition-transform hover:-translate-y-0.5">Explore Food</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.slice().reverse().map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 gap-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order #{order.id}</span>
                                    <div className="text-sm text-gray-600 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                                    {order.paymentMethod && <div className="text-xs font-bold text-gray-400 mt-1">Payment: {order.paymentMethod} ({order.paymentStatus})</div>}
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="text-lg font-black text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        order.status === 'WAITING_CONFIRMATION' ? 'bg-yellow-100 text-yellow-700' :
                                        order.status === 'ACCEPTED' ? 'bg-indigo-100 text-indigo-700' :
                                        order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'CANCELLED' || order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                    {order.status === 'WAITING_CONFIRMATION' && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    {order.status === 'ACCEPTED' && order.paymentMethod === 'ONLINE' && (
                                        <div className="flex gap-2 flex-col sm:flex-row">
                                            <button
                                                onClick={() => handleRazorpay(order.id)}
                                                disabled={isProcessing}
                                                className="px-6 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transition-all animate-bounce-subtle disabled:opacity-50"
                                            >
                                                {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
                                            </button>
                                            <button
                                                onClick={() => handlePhonePeClick(order)}
                                                disabled={isProcessing}
                                                className="px-6 py-2 rounded-full text-sm font-bold bg-[#5f259f] text-white hover:shadow-lg hover:bg-[#4a1d7c] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                Simulate PhonePe
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {currentOrder && (
                <PhonePeModal 
                    isOpen={showPhonePe}
                    onClose={() => setShowPhonePe(false)}
                    amount={currentOrder.totalAmount}
                    orderId={currentOrder.id}
                    onSuccess={handlePhonePeSuccess}
                />
            )}
        </div>
    );
};

export default OrdersPage;
