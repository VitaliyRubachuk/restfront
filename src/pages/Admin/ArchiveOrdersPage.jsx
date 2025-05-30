import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../css/ArchiveOrdersPage.css';

const ArchiveOrdersPage = () => {
    const [archivedOrders, setArchivedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dishDetails, setDishDetails] = useState({});
    const [userNames, setUserNames] = useState({});

    const fetchDishDetails = useCallback(async (dishId) => {
        try {
            const response = await axios.get(`https://restvitaliy-bf18b6f41dd9.herokuapp.com/api/dishes/${dishId}`);
            setDishDetails(prev => ({ ...prev, [dishId]: response.data }));
        } catch (error) {
            console.error(`Помилка отримання деталей страви з ID ${dishId}:`, error);
        }
    }, []);

    const fetchUserName = useCallback(async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://restvitaliy-bf18b6f41dd9.herokuapp.com/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserNames(prev => ({ ...prev, [userId]: response.data.name }));
        } catch (error) {
            console.error(`Помилка отримання імені користувача з ID ${userId}:`, error);
            setUserNames(prev => ({ ...prev, [userId]: 'Невідомий користувач' }));
        }
    }, []);

    const fetchArchivedOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://restvitaliy-bf18b6f41dd9.herokuapp.com/api/orders?statuses=COMPLETED,CANCELED', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const fetchedOrders = response.data.orders;
            setArchivedOrders(fetchedOrders);

            const uniqueUserIds = [...new Set(fetchedOrders.map(order => order.userId))];
            const uniqueDishIds = [...new Set(fetchedOrders.flatMap(order => order.dishIds))];

            await Promise.all([
                ...uniqueUserIds.map(id => fetchUserName(id)),
                ...uniqueDishIds.map(id => fetchDishDetails(id))
            ]);

            setLoading(false);
        } catch (err) {
            setError('Не вдалося завантажити архівні замовлення.');
            console.error('Помилка завантаження архівних замовлень:', err);
            setLoading(false);
        }
    }, [fetchUserName, fetchDishDetails]);

    useEffect(() => {
        fetchArchivedOrders();
    }, [fetchArchivedOrders]);

    const getDishNamesForOrder = (dishIds) => {
        return dishIds.map(id => dishDetails[id]?.name || 'Завантаження...').join(', ');
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (error) {
            console.error("Помилка обробки дати:", dateString, error);
            return 'Недійсна дата';
        }
    };

    if (loading) {
        return <div>Завантаження архівних замовлень...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="archive-orders-page">
            <h2>Архів замовлень</h2>
            <div className="archive-actions">
                <Link to="/admin/orders" className="nav-buttons a">
                    Назад до активних замовлень
                </Link>
            </div>
            {archivedOrders.length === 0 ? (
                <p>Немає завершених або скасованих замовлень в архіві.</p>
            ) : (
                <ul className="archived-orders-list">
                    {archivedOrders.map(order => (
                        <li key={order.id} className="archived-order-item">
                            <p>ID замовлення: {order.id}</p>
                            <p>Користувач: {userNames[order.userId] || "Завантаження..."}</p>
                            <p>Дата створення: {formatDate(order.orderDate)}</p>
                            <p>Дата оновлення: {formatDate(order.updatedAt)}</p>
                            <p>Повна ціна: {order.fullPrice} грн</p>
                            <p>Страви: {getDishNamesForOrder(order.dishIds)}</p>
                            <p>Додаткова інформація: {order.addition || 'Відсутня'}</p>
                            <p>Статус: {order.status}</p>
                            <p>
                                <strong>Тип замовлення:</strong>
                                {order.isDelivery ? 'Доставка' : 'В закладі'}
                            </p>
                            {order.isDelivery ? (
                                <>
                                    <p>
                                        <strong>Адреса доставки:</strong>
                                        {`${order.city ? order.city + ', ' : ''}${order.street ? order.street + ', ' : ''}${order.houseNumber ? 'буд. ' + order.houseNumber : ''}${order.apartmentNumber ? ', кв. ' + order.apartmentNumber : ''}`}
                                    </p>
                                    <p><strong>Номер телефону:</strong> {order.phoneNumber || 'Не вказано'}</p>
                                </>
                            ) : (
                                <p><strong>Номер столу:</strong> {order.tableNumber || 'Не вказано'}</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ArchiveOrdersPage;