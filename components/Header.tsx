import React from 'react';

interface HeaderProps {
    totalCategories: number;
    totalMarketCap: number;
}

const Header: React.FC<HeaderProps> = ({ totalCategories, totalMarketCap }) => {
    return (
        <header className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 text-shadow-lg">
                Today's Indices Heatmap
            </h1>
            <p className="text-base md:text-lg opacity-90 text-gray-600 dark:text-gray-400">
                <strong>Total Categories: {totalCategories}</strong> | <strong>Total Market Cap: ${totalMarketCap.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong>
            </p>
        </header>
    );
};

export default Header;