import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StockData, StockDataWithPercentage, LayoutItem, TooltipData } from '../types';
import { squarify } from '../services/treemapService';

interface HeatmapProps {
    data: StockData[];
    isDarkMode: boolean;
    onLayoutCalculated: (layout: LayoutItem[]) => void;
    setTooltip: React.Dispatch<React.SetStateAction<TooltipData>>;
    aspectRatio: '1:1' | '16:9';
}

const getInteractiveColor = (change: number): string => {
    if (change > 1.5) return 'bg-positive-dark';
    if (change > 0.05) return 'bg-positive';
    if (change < -1.5) return 'bg-negative-dark';
    if (change < -0.05) return 'bg-negative';
    return 'bg-secondary';
};

const HeatmapBox: React.FC<{ item: LayoutItem, setTooltip: HeatmapProps['setTooltip'], isDarkMode: boolean }> = ({ item, setTooltip, isDarkMode }) => {
    const minDimension = Math.min(item.width, item.height);
    const canShowText = minDimension > 30 && item.width > 40;
    
    const bgColorClass = useMemo(() => getInteractiveColor(item.change), [item.change]);
    
    const tooltipColor = useMemo(() => {
        if (item.change > 0.05) return 'text-green-400';
        if (item.change < -0.05) return 'text-red-400';
        return 'text-gray-300';
    }, [item.change]);

    const handleMouseEnter = useCallback(() => {
        const tooltipContent = (
            <div>
                <div className="font-bold">{item.name}</div>
                <div>Market Cap: ${item.marketCap.toLocaleString()}</div>
                <div>Portfolio Share: {item.percentage.toFixed(1)}%</div>
                <div>Price: ${item.price.toLocaleString()}</div>
                <div className={`${tooltipColor} font-bold`}>
                    Change: {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                </div>
            </div>
        );
        setTooltip(prev => ({ ...prev, visible: true, content: tooltipContent }));
    }, [item, tooltipColor, setTooltip]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    }, [setTooltip]);

    const handleMouseLeave = useCallback(() => {
        setTooltip(prev => ({ ...prev, visible: false }));
    }, [setTooltip]);

    let innerContent: React.ReactNode = null;
    if (canShowText) {
        const baseSize = item.width / 12;
        const nameSize = Math.max(9, Math.min(18, baseSize));
        const changeSize = Math.max(10, Math.min(18, baseSize * 1.05));
        
        innerContent = (
            <>
                <div 
                    className="font-bold w-[95%] leading-tight text-center" 
                    style={{ fontSize: `${nameSize}px`, marginBottom: `${nameSize * 0.4}px` }}
                >
                    {item.name}
                </div>
                <div 
                    className="font-bold"
                    style={{ fontSize: `${changeSize}px` }}
                >
                    {item.change > 0 ? `+${item.change.toFixed(2)}%` : `${item.change.toFixed(2)}%`}
                </div>
            </>
        );
    }

    const strokeWidth = 3;
    const itemStyle = {
        left: item.x + strokeWidth / 2,
        top: item.y + strokeWidth / 2,
        width: Math.max(0, item.width - strokeWidth),
        height: Math.max(0, item.height - strokeWidth),
    };
    
    return (
        <div
            className={`absolute flex flex-col justify-center items-center text-center text-white cursor-pointer transition-all duration-300 ease-in-out overflow-hidden ${bgColorClass} hover:z-10 hover:brightness-125 hover:shadow-2xl`}
            style={itemStyle}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {innerContent}
        </div>
    );
};


const Heatmap: React.FC<HeatmapProps> = ({ data, isDarkMode, onLayoutCalculated, setTooltip, aspectRatio }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState(0);
    const [layout, setLayout] = useState<LayoutItem[]>([]);

    useEffect(() => {
        const calculateSize = () => {
            if (containerRef.current) {
                setSize(containerRef.current.clientWidth);
            }
        };

        calculateSize();
        
        const resizeObserver = new ResizeObserver(() => calculateSize());
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (data.length === 0 || size === 0) {
             setLayout([]);
             onLayoutCalculated([]);
             return;
        }

        const totalMarketCap = data.reduce((sum, item) => sum + item.marketCap, 0);
        const dataWithPercentages: StockDataWithPercentage[] = data.map(item => ({
            ...item,
            percentage: totalMarketCap > 0 ? (item.marketCap / totalMarketCap * 100) : 0,
        }));
        
        const width = size;
        const height = aspectRatio === '1:1' ? size : size * (9 / 16);
        const newLayout = squarify(dataWithPercentages, 0, 0, width, height);

        setLayout(newLayout);
        onLayoutCalculated(newLayout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, size, aspectRatio]);

    const aspectRatioClass = aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video';

    return (
        <div ref={containerRef} className={`relative w-full rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-200'} ${aspectRatioClass}`}>
            <div className="absolute inset-0 border-[3px]" style={{borderColor: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)' }}></div>
            {layout.length > 0 ? (
                layout.map(item => <HeatmapBox key={item.name} item={item} setTooltip={setTooltip} isDarkMode={isDarkMode} />)
            ) : (
                <div className={`flex justify-center items-center h-full text-xl text-gray-600 dark:text-gray-500`}>
                    No data to display
                </div>
            )}
        </div>
    );
};

export default Heatmap;