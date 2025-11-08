import { LayoutItem } from '../types';

const escapeXml = (unsafe: string): string => {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

/**
 * Determines the performance class based on the percentage change.
 * This logic now mirrors the interactive heatmap's color scale.
 */
export const getColorClass = (change: number): 'positive-dark' | 'positive' | 'negative-dark' | 'negative' | 'neutral' => {
    if (change > 1.5) return 'positive-dark';
    if (change > 0.05) return 'positive';
    if (change < -1.5) return 'negative-dark';
    if (change < -0.05) return 'negative';
    return 'neutral';
};

/**
 * Centralized map for colors to ensure consistency between the UI and exports.
 * These hex codes are taken directly from the tailwind.config in index.html.
 */
export const COLOR_MAP = {
    'positive-dark': { hex: '#22C55E' },
    'positive': { hex: '#15803d' },
    'negative-dark': { hex: '#DC2626' }, // Strong Negative - vibrant red
    'negative': { hex: '#B91C1C' }, // Negative - darker red
    'neutral': { hex: '#334155' } // Corresponds to 'secondary'
};

/**
 * A single, robust function to build the SVG for both direct download and PNG conversion.
 * It uses canvas-compatible <text> with <tspan> elements to achieve text wrapping and ensure text is always rendered.
 */
const buildExportSvg = (layout: LayoutItem[], isDarkMode: boolean, width: number, height: number): string => {
    const bg = isDarkMode ? '#000000' : '#FFFFFF';
    const stroke = 'rgba(255, 255, 255, 0.8)';
    const textColor = '#FFFFFF';
    const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

    const rects = layout.map(item => {
        const colorClass = getColorClass(item.change);
        const fill = COLOR_MAP[colorClass].hex;

        let labelGroup = '';
        const minDimension = Math.min(item.width, item.height);
        
        if (minDimension > 30 && item.width > 40) {
            const baseSize = item.width / 14;
            const nameSize = Math.max(9, Math.min(18, baseSize));
            const changeSize = Math.max(10, Math.min(18, baseSize * 1.05));
            const lineHeight = 1.2;

            // --- Text Wrapping Logic ---
            const words = escapeXml(item.name).split(' ');
            const lines: string[] = [];
            let currentLine = '';
            const availableWidth = item.width * 0.9; // 90% buffer for padding
            const avgCharWidth = nameSize * 0.6; // Approximation

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                if (testLine.length * avgCharWidth > availableWidth) {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);
            // --- End Text Wrapping ---

            // Correctly formatted change text with signs
            let changeText: string;
            if (item.change > 0) {
                changeText = `+${item.change.toFixed(2)}%`;
            } else {
                changeText = `${item.change.toFixed(2)}%`;
            }
            
            const nameBlockHeight = lines.length * nameSize * lineHeight;
            const changeBlockHeight = changeSize * 1.5;
            const gap = nameSize * 0.4;
            const totalContentHeight = nameBlockHeight + gap + changeBlockHeight;

            // Center the entire text/badge block vertically
            const contentStartY = item.y + (item.height / 2) - (totalContentHeight / 2);
            
            const nameStartY = contentStartY + (nameSize * (lineHeight-1));
            
            const tspans = lines.map((line, i) => 
                `<tspan x="${item.x + item.width / 2}" dy="${i === 0 ? 0 : `${lineHeight}em`}">${line}</tspan>`
            ).join('');

            const nameElement = `<text y="${nameStartY}" font-family="${fontFamily}" font-weight="700" font-size="${nameSize}" fill="${textColor}" text-anchor="middle">${tspans}</text>`;
            
            const changeY = contentStartY + nameBlockHeight + gap + changeSize;
            
            const changeElement = `
                <text x="${item.x + item.width / 2}" y="${changeY}" 
                      font-family="${fontFamily}" 
                      font-weight="700" font-size="${changeSize}" fill="${textColor}" text-anchor="middle">
                    ${escapeXml(changeText)}
                </text>
            `;

            labelGroup = `${nameElement}${changeElement}`;
        }
        
        const strokeWidth = 3;
        return `<g><rect x="${item.x + strokeWidth/2}" y="${item.y + strokeWidth/2}" width="${Math.max(0, item.width - strokeWidth)}" height="${Math.max(0, item.height - strokeWidth)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />${labelGroup}</g>`;
    }).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${bg}" />${rects}</svg>`;
};

export const downloadSVG = (layout: LayoutItem[], isDarkMode: boolean): void => {
    if (layout.length === 0) return;
    const width = layout.reduce((max, item) => Math.max(max, item.x + item.width), 0);
    const height = layout.reduce((max, item) => Math.max(max, item.y + item.height), 0);
    const svg = buildExportSvg(layout, isDarkMode, width, height);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock_heatmap.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const downloadPNG = (layout: LayoutItem[], isDarkMode: boolean): void => {
    if (layout.length === 0) return;
    const width = layout.reduce((max, item) => Math.max(max, item.x + item.width), 0);
    const height = layout.reduce((max, item) => Math.max(max, item.y + item.height), 0);
    const svg = buildExportSvg(layout, isDarkMode, width, height); 
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * 2; // Render at 2x for better quality
        canvas.height = height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = 'stock_heatmap.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
    };
    img.onerror = (e) => {
        console.error("Failed to load SVG into image for PNG conversion.", e);
        URL.revokeObjectURL(url);
    };
    img.src = url;
};