import React from 'react';
import MainHeader from './MainHeader';
import Footer from './Footer';

const PageLayout = ({ children }) => {
    return (
        <div className="page-container">
            <main className="content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PageLayout;