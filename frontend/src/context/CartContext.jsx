import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
            setCart(response.data);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        }
    };

    const addToCart = async (foodItemId, quantity = 1, swiggyFood = null) => {
        if(!user) return alert("Please login to add to cart");
        
        // Prepare the body for the backend sync
        const body = swiggyFood ? {
            ...swiggyFood,
            id: isNaN(foodItemId) ? null : foodItemId, // Send null if it's a Swiggy string ID
            externalId: swiggyFood.id
        } : { id: foodItemId };

        try {
            await api.post(`/cart/add?quantity=${quantity}`, body);
            fetchCart();
        } catch (error) {
            console.error("Error adding to cart", error);
            alert("Could not add item to cart. Please try again.");
        }
    };

    const removeFromCart = async (cartItemId) => {
        await api.delete(`/cart/remove?cartItemId=${cartItemId}`);
        fetchCart();
    };

    const updateCartItemQuantity = async (cartItemId, quantity) => {
        if (quantity <= 0) {
            await removeFromCart(cartItemId);
            return;
        }
        try {
            await api.put(`/cart/update?cartItemId=${cartItemId}&quantity=${quantity}`);
            fetchCart();
        } catch (error) {
            console.error("Error updating cart quantity", error);
        }
    };

    return (
        <CartContext.Provider value={{ cart, fetchCart, addToCart, removeFromCart, updateCartItemQuantity }}>
            {children}
        </CartContext.Provider>
    );
};
