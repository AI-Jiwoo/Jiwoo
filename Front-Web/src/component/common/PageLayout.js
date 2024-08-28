import React from 'react';

const PageLayout = ({ children }) => {
    return (
        <div className="page-container">
            <main className="content">
                {children}
            </main>
        </div>
    );
};

export default PageLayout;