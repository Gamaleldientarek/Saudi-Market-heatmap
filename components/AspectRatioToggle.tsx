
import React from 'react';

type AspectRatio = '1:1' | '16:9';

interface AspectRatioToggleProps {
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
}

const AspectRatioToggle: React.FC<AspectRatioToggleProps> = ({ aspectRatio, setAspectRatio }) => {
    const baseBtnClass = "px-4 py-2 rounded-md font-bold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 dark:focus:ring-offset-black";
    const activeBtnClass = "bg-primary text-white";
    const inactiveBtnClass = "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";

    return (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-lg" role="radiogroup" aria-label="Heatmap aspect ratio">
            <button
                onClick={() => setAspectRatio('1:1')}
                className={`${baseBtnClass} ${aspectRatio === '1:1' ? activeBtnClass : inactiveBtnClass}`}
                aria-pressed={aspectRatio === '1:1'}
                role="radio"
                aria-checked={aspectRatio === '1:1'}
            >
                Square (1:1)
            </button>
            <button
                onClick={() => setAspectRatio('16:9')}
                className={`${baseBtnClass} ${aspectRatio === '16:9' ? activeBtnClass : inactiveBtnClass}`}
                aria-pressed={aspectRatio === '16:9'}
                role="radio"
                aria-checked={aspectRatio === '16:9'}
            >
                Wide (16:9)
            </button>
        </div>
    );
};

export default AspectRatioToggle;
