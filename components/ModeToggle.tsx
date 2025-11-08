
import React from 'react';

interface ModeToggleProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ isDarkMode, setIsDarkMode }) => {
    return (
        <div className="flex items-center justify-center gap-4 mb-5">
            <span className="text-xl" role="img" aria-label="sun">☀️</span>
            <label htmlFor="mode-toggle" className="text-gray-800 dark:text-white font-bold text-sm select-none">Light Mode</label>
            <button
                id="mode-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary ${isDarkMode ? 'bg-primary' : 'bg-gray-400'}`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}
                />
            </button>
            <label htmlFor="mode-toggle" className="text-gray-800 dark:text-white font-bold text-sm select-none">Dark Mode</label>
            <span className="text-xl" role="img" aria-label="moon">🌙</span>
        </div>
    );
};

export default ModeToggle;