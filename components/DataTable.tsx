import React, { useState } from 'react';
import { StockData } from '../types';

interface DataTableProps {
    tableData: StockData[];
    setTableData: React.Dispatch<React.SetStateAction<StockData[]>>;
}

const DataTable: React.FC<DataTableProps> = ({ tableData, setTableData }) => {
    const totalMarketCap = tableData.reduce((sum, item) => sum + item.marketCap, 0);
    
    const [editingCell, setEditingCell] = useState<{rowIndex: number, key: keyof StockData} | null>(null);
    const [editingValue, setEditingValue] = useState<string>('');

    const handleDataChange = <K extends keyof StockData>(index: number, field: K, value: StockData[K]) => {
        setTableData(prevData => {
            // Defensively check if the array is shorter than the index we're trying to update.
            // This could happen if data is cleared while an input is focused.
            if (index >= prevData.length) {
                return prevData; // Don't change the state
            }
            const newData = [...prevData];
            newData[index] = { ...newData[index], [field]: value };
            return newData;
        });
    };

    const deleteRow = (index: number) => {
        const newData = tableData.filter((_, i) => i !== index);
        setTableData(newData);
    };

    const handleFocus = (rowIndex: number, key: keyof StockData, value: number) => {
        setEditingCell({ rowIndex, key });
        setEditingValue(String(value));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // Allow empty string, a single '-', a valid number, or a number ending in '.'
        if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
            setEditingValue(value);
        }
    };
    
    const handleBlur = () => {
        if (editingCell) {
            const { rowIndex, key } = editingCell;
            let numericValue = parseFloat(editingValue);
            if (isNaN(numericValue)) {
                numericValue = 0;
            }
            // Update the actual data source
            handleDataChange(rowIndex, key as 'marketCap' | 'price' | 'change', numericValue);
        }
        setEditingCell(null);
        setEditingValue('');
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead className="bg-primary text-white">
                    <tr>
                        <th className="p-2 text-left font-bold rounded-tl-lg">Category Name</th>
                        <th className="p-2 text-left font-bold">Market Capital ($)</th>
                        <th className="p-2 text-left font-bold">% of Total</th>
                        <th className="p-2 text-left font-bold">Price ($)</th>
                        <th className="p-2 text-left font-bold">Change %</th>
                        <th className="p-2 text-left font-bold rounded-tr-lg">Action</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                    {tableData.map((item, index) => {
                        const isEditingMarketCap = editingCell?.rowIndex === index && editingCell?.key === 'marketCap';
                        const isEditingPrice = editingCell?.rowIndex === index && editingCell?.key === 'price';
                        const isEditingChange = editingCell?.rowIndex === index && editingCell?.key === 'change';

                        return (
                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800">
                                <td className="p-1.5">
                                    <textarea
                                        value={item.name} 
                                        onChange={(e) => handleDataChange(index, 'name', e.target.value)}
                                        rows={3}
                                        className="w-full p-1.5 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-primary resize-none"
                                    />
                                </td>
                                <td className="p-1.5">
                                    <input 
                                        type="text"
                                        inputMode="decimal"
                                        value={isEditingMarketCap ? editingValue : item.marketCap}
                                        onFocus={() => handleFocus(index, 'marketCap', item.marketCap)}
                                        onChange={handleNumericChange}
                                        onBlur={handleBlur}
                                        className="w-full p-1.5 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-primary" />
                                </td>
                                <td className="p-1.5 font-bold text-primary dark:text-blue-400">{(totalMarketCap > 0 ? (item.marketCap / totalMarketCap * 100) : 0).toFixed(1)}%</td>
                                <td className="p-1.5">
                                    <input 
                                        type="text"
                                        inputMode="decimal"
                                        value={isEditingPrice ? editingValue : item.price}
                                        onFocus={() => handleFocus(index, 'price', item.price)}
                                        onChange={handleNumericChange}
                                        onBlur={handleBlur}
                                        className="w-full p-1.5 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-primary" />
                                </td>
                                <td className="p-1.5">
                                    <input 
                                        type="text"
                                        inputMode="decimal"
                                        value={isEditingChange ? editingValue : item.change}
                                        onFocus={() => handleFocus(index, 'change', item.change)}
                                        onChange={handleNumericChange}
                                        onBlur={handleBlur}
                                        className="w-full p-1.5 bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-primary" />
                                </td>
                                <td className="p-1.5"><button onClick={() => deleteRow(index)} className="btn-delete bg-negative hover:bg-negative-dark text-white font-bold py-1 px-3 rounded transition-colors">Delete</button></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;