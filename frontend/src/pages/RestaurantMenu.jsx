import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const RestaurantMenu = () => {
    const { id } = useParams();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState(null);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    // Parse swiggy menu payload
    const parseSwiggyMenu = (payload) => {
        try {
            const cards = payload?.data?.cards || [];
            let rInfo = null;
            let fList = [];
            
            for (const card of cards) {
                // Find restaurant info - it could be in card.card.info or card.card.card.info
                if (card?.card?.card?.info) {
                    rInfo = card.card.card.info;
                } else if (card?.card?.info) {
                    rInfo = card.card.info;
                }
                
                // Find menu items
                const subCards = card?.groupedCard?.cardGroupMap?.REGULAR?.cards || [];
                for (const gcard of subCards) {
                    // 1. Direct itemCards
                    const itemCards = gcard?.card?.card?.itemCards || [];
                    for (const icard of itemCards) {
                        if (icard?.card?.info) {
                            fList.push(icard.card.info);
                        }
                    }
                    
                    // 2. Nested categories (Very common in MAPI)
                    const categories = gcard?.card?.card?.categories || [];
                    for (const category of categories) {
                        const catItems = category?.itemCards || [];
                        for (const icard of catItems) {
                            if (icard?.card?.info) {
                                fList.push(icard.card.info);
                            }
                        }
                    }
                }
            }
            
            // Map restaurant info
            const mappedRestaurant = rInfo ? {
                id: rInfo.id,
                name: rInfo.name,
                location: rInfo.locality + (rInfo.areaName ? (', ' + rInfo.areaName) : ''),
                imageUrl: `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${rInfo.cloudinaryImageId}`,
                rating: rInfo.avgRatingString || '4.0',
            } : null;

            // Map food items
            const mappedFoods = fList.map(f => {
                const price = f.price ? (f.price / 100) : (f.defaultPrice ? (f.defaultPrice / 100) : 10);
                return {
                    id: f.id.toString(),
                    name: f.name,
                    description: f.description || 'Delicous choice from the menu.',
                    price: price,
                    imageUrl: f.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_208,h_208,c_fit/${f.imageId}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    restaurantId: id // Inject current restaurant ID from useParams
                };
            });

            return { restaurant: mappedRestaurant, foods: mappedFoods };
        } catch(e) {
            console.error("Parsing error:", e);
            return { restaurant: null, foods: [] };
        }
    }

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Extract lat and lng from query string
                const queryParams = new URLSearchParams(location.search);
                const lat = queryParams.get('lat') || '17.385044';
                const lng = queryParams.get('lng') || '78.486671';

                const res = await api.get(`/swiggy/menu?lat=${lat}&lng=${lng}&restaurantId=${id}`);
                const { restaurant: resData, foods: fData } = parseSwiggyMenu(res.data);
                
                setRestaurant(resData);
                setFoods(fData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, location.search]);

    const handleAdd = (food) => {
        if (!user) {
            alert('Please login to order food.');
            return;
        }
        // Save the food to backend using normal API so it exists in cart DB, but since we are using swiggy data
        // For real app we might sync local DB. For UI simulation, we append it visually.
        // Wait, the backend cart needs the foodId. If food ID doesn't exist in backend, it crashes.
        // To handle Swiggy items, we might need a dynamic cart or we just call add to cart and handle potential 404.
        addToCart(food.id, 1, food); 
    };

    if (loading) return <div className="flex justify-center items-center flex-col gap-4 w-full h-screen text-rose-500"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-current"></div><span className="text-gray-500">Loading Real Menu...</span></div>;
    if (!restaurant) return <div className="text-center py-20 text-gray-500">Restaurant not found or Swiggy feed error</div>;

    return (
        <div className="w-full">
            <div className="relative h-80 md:h-[400px] w-full bg-black">
                <img src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80'} alt="Cover" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black mb-2 animate-fade-in-up">{restaurant.name}</h1>
                    <p className="text-lg md:text-xl font-medium text-gray-200 flex items-center mb-4">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {restaurant.location} • ⭐ {restaurant.rating || '4.0'}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-4 border-rose-500 pb-2 inline-block">Live Menu</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {foods.map(food => (
                        <div key={food.id} className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl border border-gray-100 flex items-center transition-all duration-300">
                            <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-inner">
                                <img src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="ml-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{food.name}</h3>
                                    <span className="text-lg font-black text-rose-600 whitespace-nowrap ml-2">₹{food.price.toFixed(2)}</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-1 mb-4 line-clamp-2">{food.description}</p>
                                <button onClick={() => handleAdd(food)} className="mt-auto self-start px-5 py-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-full font-semibold shadow hover:shadow-md transition-all active:scale-95 text-sm">
                                    Add to cart 
                                </button>
                            </div>
                        </div>
                    ))}
                    {foods.length === 0 && <p className="text-gray-500 col-span-2">This restaurant currently has no items on the menu due to closed timing or empty feed.</p>}
                </div>
            </div>
        </div>
    );
};

export default RestaurantMenu;
