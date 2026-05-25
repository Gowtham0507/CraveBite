import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
        } else {
            fetchAllOrders();
        }
    }, [user, navigate]);

    const fetchAllOrders = async () => {
        try {
            // Reusing get user orders for now, wait we need get all orders for admin.
            // But we don't have a specific /api/orders/all endpoint right now in OrderController.
            // Oh, I should create one or just use /api/orders if it returns all for admin.
            // Wait, OrderController /api/orders gets user orders. Let's assume we need to update the backend for /api/orders/all.
            // Actually, wait, let me just add a quick /all endpoint or just rely on what we have.
            // Wait, I will need to check if /api/orders/all exists. I didn't add it to OrderController. Let me just add it.
            const res = await api.get('/orders/all');
            setOrders(res.data);
        } catch (err) {
            console.error("Failed to fetch all orders", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.put(`/orders/accept/${id}`);
            fetchAllOrders();
        } catch(err) {
            alert('Failed to accept');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/orders/reject/${id}`);
            fetchAllOrders();
        } catch(err) {
            alert('Failed to reject');
        }
    };

    if (loading) return <div>Loading...</div>;

    const waitingOrders = orders.filter(o => o.status === 'WAITING_CONFIRMATION');
    const otherOrders = orders.filter(o => o.status !== 'WAITING_CONFIRMATION');

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-4 border-rose-600 pb-2 inline-block">Admin Dashboard</h1>
            
            <div className="bg-white p-8 rounded-3xl shadow flex gap-6 items-center mb-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                   <h2 className="text-2xl font-bold">Welcome, {user?.name} (Admin)</h2>
                   <p className="text-gray-500">Manage incoming orders here.</p>
                </div>
            </div>

            <div className="mb-10">
                <h3 className="text-xl font-bold mb-4 text-orange-600">Pending Confirmations ({waitingOrders.length})</h3>
                {waitingOrders.length === 0 && <p className="text-gray-500">No pending orders.</p>}
                <div className="grid gap-4">
                    {waitingOrders.map(o => (
                        <div key={o.id} className="border border-orange-200 bg-orange-50 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-bold text-lg text-gray-900">Order #{o.id.substring(o.id.length - 6)}</h4>
                                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600">
                                        {o.paymentMethod === 'ONLINE' ? 'Pay Online' : 'Cash on Delivery'}
                                    </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-orange-100 mb-3 shadow-sm">
                                    <p className="text-sm text-gray-700 font-semibold mb-1 border-b border-gray-100 pb-1">Items Ordered:</p>
                                    <p className="text-sm text-gray-600">
                                        {o.items?.map(i => `${i.quantity}x ${i.foodItem?.name || 'Unknown Item'}`).join(', ')}
                                    </p>
                                </div>
                                {o.deliveryAddress && (
                                    <div className="mb-3 text-sm text-gray-700">
                                        <p><span className="font-semibold text-gray-900">Address:</span> {o.deliveryAddress}</p>
                                        <p><span className="font-semibold text-gray-900">Phone:</span> {o.deliveryPhoneNumber}</p>
                                    </div>
                                )}
                                <p className="text-rose-600 font-bold text-lg">Total: ₹{o.totalAmount.toFixed(2)}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={() => handleAccept(o.id)} className="flex-1 md:flex-none bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 shadow-md transition-all">Accept</button>
                                <button onClick={() => handleReject(o.id)} className="flex-1 md:flex-none bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 shadow-md transition-all">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-700">Other Orders ({otherOrders.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherOrders.map(o => (
                        <div key={o.id} className="border border-gray-200 bg-white rounded-xl p-4">
                            <h4 className="font-bold">Order #{o.id}</h4>
                            <p className="text-sm text-gray-600">Amount: ₹{o.totalAmount.toFixed(2)}</p>
                            <p className="text-xs font-bold text-indigo-600 mt-2">Status: {o.status}</p>
                            {o.paymentMethod && <p className="text-xs text-gray-500 mt-1">Payment: {o.paymentMethod} ({o.paymentStatus})</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
