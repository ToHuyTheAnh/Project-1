import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
    const navigate = useNavigate();

    const handleButtonClick = (route) => {
        navigate(route);
    };

    return (
        <div className="home-container">
            <h1>Quản lý các nhà phân phối doanh nghiệp</h1>
            <div className="home-buttons-container">
                <button className="home-btn1" onClick={() => handleButtonClick('/distributor')}>
                    Danh sách nhà phân phối
                </button>
                <button className="home-btn2" onClick={() => handleButtonClick('/report')}>
                    Thống kê doanh số theo đợt
                </button>
            </div>

        </div>
    );
}

export default HomePage;
