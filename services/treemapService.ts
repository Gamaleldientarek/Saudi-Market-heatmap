
import { StockDataWithPercentage, LayoutItem } from '../types';

type ItemWithArea = StockDataWithPercentage & { area: number };

function getWorstAspectRatio(row: ItemWithArea[], fixedDimension: number): number {
    const rowArea = row.reduce((sum, item) => sum + item.area, 0);
    if (rowArea === 0 || fixedDimension === 0) return Infinity;

    const rowLength = rowArea / fixedDimension;
    
    let maxArea = 0;
    let minArea = Infinity;
    for(const item of row) {
        if(item.area > maxArea) maxArea = item.area;
        if(item.area < minArea) minArea = item.area;
    }

    return Math.max(
        (fixedDimension ** 2 * maxArea) / (rowArea ** 2),
        (rowArea ** 2) / (fixedDimension ** 2 * minArea)
    );
}


function layoutRow(items: ItemWithArea[], x: number, y: number, width: number, height: number, layout: LayoutItem[]): void {
    if (items.length === 0) return;

    const isVerticalLayout = width >= height;
    const fixedDimension = isVerticalLayout ? height : width;

    if (items.length === 0) return;

    let rowToLayout = [items[0]];
    let remaining = items.slice(1);
    let bestWorstRatio = getWorstAspectRatio(rowToLayout, fixedDimension);

    while (remaining.length > 0) {
        const newRow = [...rowToLayout, remaining[0]];
        const newWorstRatio = getWorstAspectRatio(newRow, fixedDimension);

        if (newWorstRatio > bestWorstRatio) {
            break;
        }
        
        bestWorstRatio = newWorstRatio;
        rowToLayout = newRow;
        remaining = remaining.slice(1);
    }
    
    const rowArea = rowToLayout.reduce((sum, item) => sum + item.area, 0);
    const rowLength = fixedDimension > 0 ? rowArea / fixedDimension : 0;
    
    let currentPos = 0;
    
    if (isVerticalLayout) {
        for (const item of rowToLayout) {
            const itemHeight = rowLength > 0 ? item.area / rowLength : 0;
            layout.push({ ...item, x, y: y + currentPos, width: rowLength, height: itemHeight });
            currentPos += itemHeight;
        }
        if (width - rowLength > 0) {
             layoutRow(remaining, x + rowLength, y, width - rowLength, height, layout);
        }
    } else {
        for (const item of rowToLayout) {
            const itemWidth = rowLength > 0 ? item.area / rowLength : 0;
            layout.push({ ...item, x: x + currentPos, y, width: itemWidth, height: rowLength });
            currentPos += itemWidth;
        }
        if (height - rowLength > 0) {
            layoutRow(remaining, x, y + rowLength, width, height - rowLength, layout);
        }
    }
}

export function squarify(items: StockDataWithPercentage[], x: number, y: number, width: number, height: number): LayoutItem[] {
    if (width <= 0 || height <= 0 || items.length === 0) return [];
    
    const totalArea = width * height;
    const totalPercentage = items.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPercentage === 0) return [];

    const itemsWithArea: ItemWithArea[] = items.map(item => ({
        ...item,
        area: (item.percentage / totalPercentage) * totalArea
    }));

    itemsWithArea.sort((a, b) => b.area - a.area);
    
    let layout: LayoutItem[] = [];
    layoutRow(itemsWithArea, x, y, width, height, layout);
    return layout;
}
