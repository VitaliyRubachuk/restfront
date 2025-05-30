import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../css/AdminOrdersPage.css';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
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

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://restvitaliy-bf18b6f41dd9.herokuapp.com/api/orders', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const filteredOrders = response.data.orders.filter(
                order => order.status === 'PENDING' || order.status === 'IN_PROGRESS'
            );
            setOrders(filteredOrders);

            const uniqueUserIds = [...new Set(filteredOrders.map(order => order.userId))];
            const uniqueDishIds = [...new Set(filteredOrders.flatMap(order => order.dishIds))];

            await Promise.all(uniqueUserIds.map(id => fetchUserName(id)));
            await Promise.all(uniqueDishIds.map(id => fetchDishDetails(id)));

            setLoading(false);
        } catch (err) {
            setError('Не вдалося завантажити замовлення.');
            console.error('Помилка завантаження замовлень:', err);
            setLoading(false);
        }
    }, [fetchUserName, fetchDishDetails]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getDishNamesForOrder = (dishIds) => {
        return dishIds.map(id => dishDetails[id]?.name || 'Завантаження...').join(', ');
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `https://restvitaliy-bf18b6f41dd9.herokuapp.com/api/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                setOrders(prevOrders =>
                    prevOrders.map(order => {
                        if (order.id === orderId) {
                            return { ...order, status: newStatus };
                        }
                        return order;
                    }).filter(order => order.status === 'PENDING' || order.status === 'IN_PROGRESS')
                );
            } else {
                setError(`Не вдалося оновити статус замовлення з ID ${orderId}. Код помилки: ${response.status}`);
                console.error(`Помилка оновлення статусу замовлення ${orderId}:`, response);
            }

        } catch (err) {
            setError(`Не вдалося оновити статус замовлення з ID ${orderId}.`);
            console.error(`Помилка оновлення статусу замовлення ${orderId}:`, err);
        }
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
        return <div>Завантаження замовлень...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="admin-orders-page">
            <h2>Перегляд замовлень</h2>
            <div className="admin-orders-actions">
                <Link to="/admin/archive" className="nav-buttons a">
                    Архів
                </Link>
            </div>
            {orders.length === 0 ? (
                <p>Немає активних замовлень.</p>
            ) : (
                <ul className="orders-list">
                    {orders.map(order => (
                        <li key={order.id} className="order-item">
                            <p>ID замовлення: {order.id}</p>
                            <p>Користувач: {userNames[order.userId] || "Завантаження..."}</p>
                            <p>Дата створення: {formatDate(order.orderDate)}</p>
                            <p>Дата оновлення: {formatDate(order.updatedAt)}</p>
                            <p>Повна ціна: {order.fullPrice} грн</p>
                            <p>Страви: {getDishNamesForOrder(order.dishIds)}</p>
                            <p>Додаткова інформація: {order.addition || 'Відсутня'}</p>
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
                            <div className="status-control">
                                <label>Статус:</label>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELED">CANCELED</option>
                                </select>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminOrdersPage;