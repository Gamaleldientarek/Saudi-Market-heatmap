
import React from 'react';
import { TooltipData } from '../types';

interface TooltipProps {
    tooltipData: TooltipData;
}

const Tooltip: React.FC<TooltipProps> = ({ tooltipData }) => {
    if (!tooltipData.visible) return null;

    return (
        <div
            className="fixed bg-black/90 text-white p-4 rounded-lg shadow-2xl text-sm whitespace-nowrap z-50 pointer-events-none border-2 border-white/80 transition-opacity duration-200"
            style={{
                left: `${tooltipData.x + 15}px`,
                top: `${tooltipData.y + 15}px`,
                opacity: tooltipData.visible ? 1 : 0,
            }}
        >
            {tooltipData.content}
        </div>
    );
};

export default Tooltip;
