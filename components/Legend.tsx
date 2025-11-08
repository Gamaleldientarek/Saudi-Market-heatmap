import React from 'react';

const LegendItem: React.FC<{ colorClass: string; label: React.ReactNode }> = ({ colorClass, label }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-sm ${colorClass}`}></div>
        <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </div>
);

const Legend: React.FC = () => {
    return (
        <div className="flex justify-center gap-x-4 gap-y-2 mt-6 flex-wrap max-w-5xl mx-auto">
            <LegendItem colorClass="bg-negative-dark" label={<strong>Strong Negative (&lt; -1.5%)</strong>} />
            <LegendItem colorClass="bg-negative" label={<strong>Negative</strong>} />
            <LegendItem colorClass="bg-secondary" label={<span><strong>Neutral</strong> (-0.05% to +0.05%)</span>} />
            <LegendItem colorClass="bg-positive" label={<strong>Positive</strong>} />
            <LegendItem colorClass="bg-positive-dark" label={<strong>Strong Positive (&gt; +1.5%)</strong>} />
        </div>
    );
};

export default Legend;