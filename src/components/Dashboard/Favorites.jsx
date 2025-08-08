import React from 'react';
import { Spin, Typography, Alert } from "antd";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../context/AuthContext";

import HotelCard from '../HotelCard';
import { fetchHotelDetails } from '../../api/jsonServer'; 
import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const FavoritesPage = () => {
    const { user } = useAuth();
    const { favorites, loading, error } = useFavorites(user?.id);
    const [hotels, setHotels] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotels = async () => {
            if (favorites.length > 0) {
                const hotelPromises = favorites.map(fav => fetchHotelDetails(fav.hotelId));
                const hotelData = await Promise.all(hotelPromises);
                setHotels(hotelData);
            }
        };
        fetchHotels();
    }, [favorites]);

    if (loading) return <Spin size="large" />;
    if (error) return <Alert message="خطا" description={error} type="error" showIcon />;

    return (
        <div>
            <Title level={2}>مکان‌های مورد علاقه شما</Title>
            {hotels.length === 0 ? (
                <p>هیچ مکانی به علاقه‌مندی‌ها اضافه نشده است.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {hotels.map(hotel => (
                        <HotelCard 
                            key={hotel.id} 
                            hotel={hotel} 
                            isFavorite={true} 
                            onFavoriteToggle={() => console.log(`Toggle favorite for hotel ID: ${hotel.id}`)}
                            showFavorite={true}
                            onViewDetails={(id) => navigate(`/hotels/${id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
