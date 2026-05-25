import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationInput, setLocationInput] = useState('');
    // Default location (e.g. Hyderabad)
    const [coordinates, setCoordinates] = useState({ lat: 17.385044, lng: 78.486671 });
    const [detectingLocation, setDetectingLocation] = useState(false);

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            setDetectingLocation(true);
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    setCoordinates({ lat: latitude, lng: longitude });
                    
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    const city = data.address.city || data.address.town || data.address.village || data.address.state || "Current Location";
                    setLocationInput(city);
                } catch (error) {
                    console.error("Error detecting location", error);
                } finally {
                    setDetectingLocation(false);
                }
            }, (error) => {
                console.error("Geolocation error", error);
                setDetectingLocation(false);
            });
        }
    };

    const handleManualSearch = async (e) => {
        if (e.key === 'Enter') {
            if (!locationInput.trim()) {
                return;
            }
            setDetectingLocation(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInput)}&format=json&limit=1`);
                const data = await response.json();
                if (data && data.length > 0) {
                    setCoordinates({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                } else {
                    setRestaurants([]); // Location not found
                }
            } catch (error) {
                console.error("Error geocoding", error);
            } finally {
                setDetectingLocation(false);
            }
        }
    };

    // Auto-detect on mount
    useEffect(() => {
        detectLocation();
        // eslint-disable-next-line
    }, []);

    // Parse swiggy api payload
    const parseSwiggyRestaurants = (payload) => {
        try {
            const cards = payload?.data?.cards || [];
            let rList = [];
            for (const card of cards) {
                const elements = card?.card?.card?.gridElements?.infoWithStyle?.restaurants;
                if (elements && Array.isArray(elements)) {
                    rList = [...rList, ...elements];
                }
            }
            
            // map swiggy format to our db format
            const unique = [];
            const seen = new Set();
            for (const r of rList) {
                if(!seen.has(r.info.id)) {
                    seen.add(r.info.id);
                    unique.push({
                        id: r.info.id.toString(),
                        name: r.info.name,
                        description: r.info.cuisines ? r.info.cuisines.join(", ") : "",
                        location: r.info.locality + ', ' + r.info.areaName,
                        imageUrl: `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${r.info.cloudinaryImageId}`,
                        rating: r.info.avgRatingString || '4.0',
                        deliveryTime: r.info?.sla?.slaString || '30 mins'
                    });
                }
            }
            return unique;
        } catch(e) {
            console.error("Parsing error:", e);
            return [];
        }
    }

    // Fetch restaurants based on coordinates
    useEffect(() => {
        const fetchRestaurants = async () => {
            setLoading(true);
            try {
                let parsed = [];
                try {
                    const res = await api.get(`/swiggy/restaurants?lat=${coordinates.lat}&lng=${coordinates.lng}`);
                    if (res.data) {
                        parsed = parseSwiggyRestaurants(res.data);
                    }
                } catch (err) {
                    console.error("Error fetching from Swiggy proxy", err);
                }

                if (parsed.length > 0) {
                    setRestaurants(parsed);
                } else {
                    // Fallback to local DB restaurants
                    const dbRes = await api.get('/restaurants');
                    const mapped = dbRes.data.map(r => ({
                        id: r.id,
                        name: r.name,
                        description: "Local Favorite",
                        location: r.location,
                        imageUrl: r.imageUrl,
                        rating: r.rating || '4.0',
                        deliveryTime: '30 mins'
                    }));
                    setRestaurants(mapped);
                }
            } catch (err) {
                console.error("Error fetching local restaurants", err);
                setRestaurants([]);
            } finally {
                setLoading(false);
            }
        };

        if (coordinates) {
            fetchRestaurants();
        }
    }, [coordinates]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Craving something? </h1>
                    <p className="mt-2 text-lg text-gray-500">Discover live restaurants near you right now.</p>
                </div>
                <div className="mt-4 md:mt-0 relative w-full md:w-[500px]">
                    <input 
                        type="text" 
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyDown={handleManualSearch}
                        placeholder="Search city/area and press Enter..." 
                        className="w-full pl-10 pr-28 py-3 rounded-2xl border-none ring-1 ring-gray-200 shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow bg-white text-gray-800" 
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <button 
                        onClick={detectLocation}
                        disabled={detectingLocation}
                        className="absolute right-2 top-2 bg-orange-100 text-orange-600 hover:bg-orange-200 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        {detectingLocation ? 'Locating...' : 'Locate Me'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center flex-col items-center w-full h-64 text-orange-500 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    <span className="text-gray-500 font-medium">Finding the best spots near you...</span>
                </div>
            ) : restaurants.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 mt-10">
                    <div className="text-6xl mb-4">️</div>
                    <h3 className="text-xl font-semibold text-gray-700">No live restaurants available here just yet!</h3>
                    <p className="text-gray-500 mt-2">Try searching a major Indian city like 'Hyderabad' or 'Bangalore'.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">
                    {restaurants.map((restaurant) => (
                        <Link to={`/restaurant/${restaurant.id}?lat=${coordinates.lat}&lng=${coordinates.lng}`} key={restaurant.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100/50">
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                                    <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        ⭐ {restaurant.rating}
                                    </span>
                                    <span className="bg-orange-500/80 backdrop-blur-md text-white border border-orange-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        ️ {restaurant.deliveryTime}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{restaurant.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{restaurant.description}</p>
                                <div className="flex items-center text-gray-400 text-xs mt-3 mt-auto pt-2 border-t border-gray-50">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    <span className="line-clamp-1">{restaurant.location}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;

