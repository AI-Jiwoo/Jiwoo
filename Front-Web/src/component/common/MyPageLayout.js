import React from 'react';
import MainHeader from "./MainHeader";
import Footer from "./Footer";

const MyPageLayout = ({ children }) => {
    return (
        <div className="page-container">
            <MainHeader/>
            <main className="content">
                {children}
            </main>
            <Footer/>
        </div>
    );
};

export default MyPageLayout;