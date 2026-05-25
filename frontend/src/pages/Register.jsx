import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, phoneNumber);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        }
    };

    return (
        <div className="w-full flex justify-center items-center py-20 px-4">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 p-10 rounded-3xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-600">Join CraveBite</h2>
                    <p className="text-gray-500 mt-2 font-medium">Create an account to start ordering</p>
                </div>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-semibold border border-red-100">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-gray-50/50" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address (e.g., name@example.com)" className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-gray-50/50" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required pattern="\d{10}" title="Phone number must be 10 digits" className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-gray-50/50" placeholder="9876543210" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-gray-50/50" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold py-3 px-4 mt-2 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                        Create Account
                    </button>
                    <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                        Already have an account? <Link to="/login" className="text-rose-600 font-bold hover:underline">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
