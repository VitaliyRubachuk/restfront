import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useMenuUpdate } from '../context/MenuUpdateContext';
import AddDishModal from '../components/AddDishModal';
import '../css/Header.css';
import logoImage from '/image/logo.png';
import adminPanelIcon from '/image/admin-panel.png'; // New import for admin panel icon
import menuIcon from '/image/menu.png'; // New import for menu icon

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [isCreateDishModalOpen, setIsCreateDishModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for main menu
    const adminPanelRef = useRef(null);
    const adminButtonRef = useRef(null);
    const menuRef = useRef(null); // New ref for main menu
    const menuButtonRef = useRef(null); // New ref for main menu button
    const navigate = useNavigate();

    const { triggerMenuUpdate } = useMenuUpdate();

    const closeAllDropdowns = () => {
        setIsAdminPanelOpen(false);
        setIsMenuOpen(false);
        if (adminButtonRef.current && adminButtonRef.current.classList.contains('active')) {
            adminButtonRef.current.classList.remove('active');
        }
    };

    const toggleAdminPanel = () => {
        closeAllDropdowns(); // Close other dropdowns
        setIsAdminPanelOpen(!isAdminPanelOpen);
        if (adminButtonRef.current) {
            adminButtonRef.current.classList.toggle('active');
        }
    };

    const openCreateDishModal = () => {
        setIsCreateDishModalOpen(true);
        closeAllDropdowns(); // Close dropdowns after action
    };

    const closeCreateDishModal = () => {
        setIsCreateDishModalOpen(false);
        console.log('Header: Add dish modal closed.');
    };

    const handleViewOrders = () => {
        navigate('/admin/orders');
        closeAllDropdowns(); // Close dropdowns after action
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        closeAllDropdowns(); // Close dropdowns after action
    };

    const toggleMenu = () => {
        closeAllDropdowns(); // Close other dropdowns
        setIsMenuOpen(!isMenuOpen);
    };

    const handleClickOutside = (event) => {
        if (adminPanelRef.current && !adminPanelRef.current.contains(event.target) && isAdminPanelOpen) {
            setIsAdminPanelOpen(false);
            if (adminButtonRef.current) {
                adminButtonRef.current.classList.remove('active');
            }
        }
        if (menuRef.current && !menuRef.current.contains(event.target) && isMenuOpen && menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [adminPanelRef, isAdminPanelOpen, menuRef, isMenuOpen, menuButtonRef]);

    return (
        <header className="site-header">
            <div className="header-content">
                <div className="logo">
                    <Link to="/">
                        <img src={logoImage} alt="Логотип Il Gambero Rosso" />
                        <span>Il Gambero Rosso</span>
                    </Link>
                </div>
                <nav className="nav-buttons">
                    {user?.role === 'ADMIN' && (
                        <div className="admin-dropdown" ref={adminPanelRef}>
                            <button onClick={toggleAdminPanel} ref={adminButtonRef} className="icon-button">
                                <img src={adminPanelIcon} alt="Admin Panel" />
                            </button>
                            {isAdminPanelOpen && (
                                <ul className="admin-menu">
                                    <li>
                                        <button onClick={openCreateDishModal} className="admin-menu-button">Створити страву</button>
                                    </li>
                                    <li>
                                        <Link to="/admin/tables" className="admin-menu-button">Керування столиками</Link>
                                    </li>
                                    <li>
                                        <button onClick={handleViewOrders} className="admin-menu-button">Переглянути замовлення</button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="menu-dropdown" ref={menuRef}>
                        <button onClick={toggleMenu} ref={menuButtonRef} className="icon-button">
                            <img src={menuIcon} alt="Menu" />
                        </button>
                        {isMenuOpen && (
                            <ul className="main-menu">
                                {user ? (
                                    <>
                                        {/* Group 1: Profile */}
                                        <li><Link to="/profile" onClick={closeAllDropdowns}>Профіль</Link></li>
                                        <li className="menu-separator"></li>
                                        {/* Group 2: Main Navigation */}
                                        <li><Link to="/menu" onClick={closeAllDropdowns}>Меню</Link></li>
                                        <li><Link to="/tables" onClick={closeAllDropdowns}>Столики</Link></li>
                                        <li>
                                            <Link to="/cart" className="cart-link-in-menu" onClick={closeAllDropdowns}>
                                                <span>Кошик</span>
                                                <span>({cart.reduce((total, item) => total + (item.quantity || 0), 0)})</span>
                                            </Link>
                                        </li>
                                        <li className="menu-separator"></li>
                                        {/* Group 3: User Specific */}
                                        <li><Link to="/my-orders" onClick={closeAllDropdowns}>Мої замовлення</Link></li>
                                        <li><Link to="/my-tables" onClick={closeAllDropdowns}>Мої столики</Link></li>
                                        <li className="menu-separator"></li>
                                        {/* Group 4: Authentication */}
                                        <li><button onClick={handleLogout}>Вийти</button></li>
                                    </>
                                ) : (
                                    <>
                                        {/* Group 1: Main Navigation (for non-logged in users) */}
                                        <li><Link to="/menu" onClick={closeAllDropdowns}>Меню</Link></li>
                                        <li><Link to="/tables" onClick={closeAllDropdowns}>Столики</Link></li>
                                        <li>
                                            <Link to="/cart" className="cart-link-in-menu" onClick={closeAllDropdowns}>
                                                <span>Кошик</span>
                                                <span>({cart.reduce((total, item) => total + (item.quantity || 0), 0)})</span>
                                            </Link>
                                        </li>
                                        <li className="menu-separator"></li>
                                        {/* Group 2: Authentication (for non-logged in users) */}
                                        <li><Link to="/login" onClick={closeAllDropdowns}>Вхід</Link></li>
                                        <li><Link to="/register" onClick={closeAllDropdowns}>Реєстрація</Link></li>
                                    </>
                                )}
                            </ul>
                        )}
                    </div>
                </nav>
            </div>

            {isCreateDishModalOpen && (
                <AddDishModal
                    isOpen={isCreateDishModalOpen}
                    onClose={closeCreateDishModal}
                    onDishAdded={triggerMenuUpdate}
                />
            )}
        </header>
    );
}
