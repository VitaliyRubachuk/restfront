import React, { useState, useEffect, useRef } from 'react';
import '../css/Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io'; // Додаємо іконки стрілок

export default function Footer({ isModalOpen }) {
    const [isFooterOpen, setIsFooterOpen] = useState(false);
    const footerRef = useRef(null);

    const toggleFooter = () => {
        setIsFooterOpen(prevState => !prevState);
    };

    const handleClickOutside = (event) => {
        if (footerRef.current && !footerRef.current.contains(event.target) && isFooterOpen) {
            setIsFooterOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFooterOpen]);

    if (isModalOpen) {
        return null;
    }

    return (
        <footer className={`footer-wrapper ${isFooterOpen ? 'open' : ''}`} ref={footerRef}>
            <div className="footer-toggle" onClick={toggleFooter}>
                {isFooterOpen ? <IoIosArrowDown /> : <IoIosArrowUp />}
            </div>
            <div className="footer-content">
                <div className="container">
                    <div className="footer-sections">
                        <div className="footer-section about-us">
                            <h3>Про нас</h3>
                            <p>Il Gambero Rosso - це місце, де традиції зустрічаються з інноваціями. Ми пропонуємо вишукані страви, чудову атмосферу та незабутні враження.</p>
                        </div>
                        <div className="footer-section contact-info">
                            <h3>Контакти</h3>
                            <ul>
                                <li><i className="fas fa-map-marker-alt"></i> вул. Берильна, 10, Тернопіль, Україна</li>
                                <li><i className="fas fa-phone"></i> +380 44 123 4567</li>
                                <li><i className="fas fa-envelope"></i> info@ilgamberorosso.ua</li>
                            </ul>
                        </div>
                        <div className="footer-section social-media">
                            <h3>Ми у соцмережах</h3>
                            <div className="social-icons">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-links-bottom">
                        <a href="/privacy-policy">Політика конфіденційності</a>
                        <a href="/terms-of-service">Умови використання</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
