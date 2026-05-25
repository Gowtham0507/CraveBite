import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const navigate = useNavigate();
    const showDbConsole = import.meta.env.VITE_SHOW_DB_CONSOLE === 'true';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const cartItemsCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg hover:rotate-6 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                            <path d="M12 2v3M9 2v3M15 2v3M4 11h16a1 1 0 0 1 1 1v3.5a5.5 5.5 0 0 1-5.5 5.5h-7A5.5 5.5 0 0 1 3 15.5V12a1 1 0 0 1 1-1z" />
                        </svg>
                    </div>
                    <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-600 tracking-tight">
                        CraveBite
                    </span>
                </div>

                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">Restaurants</Link>
                    {showDbConsole && (
                        <a href={`${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080'}/h2-console`} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">H2 Database</a>
                    )}
                    {user && user.role === 'ADMIN' && (
                        <Link to="/admin" className="text-rose-600 hover:text-rose-800 font-bold transition-colors">Admin Panel</Link>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartItemsCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-500 rounded-full animate-pulse">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </Link>
                            <div className="relative group cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name}</span>
                                </div>
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 p-2 block z-50">
                                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">My Orders</Link>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">Logout</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link to="/login" className="text-gray-700 hover:text-orange-600 font-medium transition-colors px-3 py-2">Log in</Link>
                            <Link to="/register" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">Sign up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
