import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StockData, LayoutItem, TooltipData } from './types';
import { DEFAULT_STOCK_DATA } from './constants';
import Header from './components/Header';
import ModeToggle from './components/ModeToggle';
import DataTable from './components/DataTable';
import ActionButtons from './components/ActionButtons';
import Heatmap from './components/Heatmap';
import Legend from './components/Legend';
import Footer from './components/Footer';
import Tooltip from './components/Tooltip';
import AspectRatioToggle from './components/AspectRatioToggle';
import { downloadSampleCSV, parseCSV } from './services/csvService';
import { downloadPNG, downloadSVG } from './services/imageExportService';

const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
    const [heatmapData, setHeatmapData] = useState<StockData[]>(DEFAULT_STOCK_DATA);
    const [tableData, setTableData] = useState<StockData[]>(DEFAULT_STOCK_DATA);
    const [currentLayout, setCurrentLayout] = useState<LayoutItem[]>([]);
    const [tooltip, setTooltip] = useState<TooltipData>({ visible: false, content: null, x: 0, y: 0 });
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9'>('16:9');
    const [isDataEditorVisible, setDataEditorVisible] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedMode = localStorage.getItem('heatmapMode');
        const darkMode = savedMode !== null ? savedMode === 'dark' : true;
        setIsDarkMode(darkMode);
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('heatmapMode', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const stats = useMemo(() => {
        const totalMarketCap = heatmapData.reduce((sum, item) => sum + item.marketCap, 0);
        return {
            totalCategories: heatmapData.length,
            totalMarketCap,
        };
    }, [heatmapData]);

    const handleUpdateHeatmap = useCallback(() => {
        setHeatmapData([...tableData]);
    }, [tableData]);
    
    const handleAddRow = useCallback(() => {
        const newRow: StockData = { name: 'New Category', marketCap: 1000, price: 100, change: 0 };
        setTableData(prev => [...prev, newRow]);
    }, []);

    const handleClearAll = useCallback(() => {
        // To make this button behave exactly like the immediate row delete buttons as requested,
        // the confirmation dialog has been removed. The action is now instant.
        // A setTimeout is used to ensure any pending onBlur event from the data table
        // is processed first, preventing a race condition and ensuring reliability.
        setTimeout(() => {
            setTableData([]);
            setHeatmapData([]);
        }, 0);
    }, []);

    const handleCsvImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const content = await file.text();
                const parsedData = parseCSV(content);
                // Allow clearing data via empty CSV
                setTableData(parsedData);
                setHeatmapData(parsedData); // Also update heatmap immediately on import
            } catch (error) {
                console.error("Failed to parse CSV file:", error);
                alert("Failed to parse CSV file. Please check the file format and try again.");
            }
        }
        // Reset file input to allow re-uploading the same file
        if(event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className="text-gray-800 dark:text-gray-200 min-h-screen font-sans p-4 sm:p-6 md:p-10">
            <Header totalCategories={stats.totalCategories} totalMarketCap={stats.totalMarketCap} />
            <ModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

            <main className="max-w-7xl mx-auto flex flex-col items-center gap-8">
                <div className="bg-gray-100 dark:bg-gray-900/50 rounded-2xl p-4 md:p-6 shadow-lg w-full max-w-5xl">
                    <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setDataEditorVisible(!isDataEditorVisible)}
                        aria-expanded={isDataEditorVisible}
                        aria-controls="data-editor-content"
                    >
                        <h2 className="text-secondary dark:text-gray-200 text-2xl font-bold">Edit Heatmap Data</h2>
                        <svg 
                            className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${isDataEditorVisible ? 'rotate-180' : ''}`} 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    <ActionButtons
                        onAddRow={handleAddRow}
                        onUpdateHeatmap={handleUpdateHeatmap}
                        onImportCsv={handleCsvImportClick}
                        onDownloadSampleCsv={downloadSampleCSV}
                        onClearAll={handleClearAll}
                    />

                    <div 
                        id="data-editor-content"
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${isDataEditorVisible ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <p className="text-gray-500 dark:text-gray-400 mt-4 mb-4 text-sm">
                            💡 Rectangle size is automatically calculated from Market Capital. Edit values and click "Update Heatmap" to see changes.
                        </p>
                        <DataTable tableData={tableData} setTableData={setTableData} />
                    </div>
                     <input
                        type="file"
                        id="csvFileInput"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {heatmapData.length > 0 ? (
                    <>
                        <div className="w-full max-w-5xl flex flex-col items-center gap-4">
                            <AspectRatioToggle aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />
                            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-2xl p-2 md:p-4 shadow-lg w-full">
                                <Heatmap 
                                    data={heatmapData} 
                                    isDarkMode={isDarkMode} 
                                    onLayoutCalculated={setCurrentLayout} 
                                    setTooltip={setTooltip}
                                    aspectRatio={aspectRatio}
                                />
                            </div>
                        </div>
                        <ActionButtons
                            onDownloadSVG={() => downloadSVG(currentLayout, isDarkMode)}
                            onDownloadPNG={() => downloadPNG(currentLayout, isDarkMode)}
                        />
                    </>
                ) : (
                     <div className="text-center p-8 bg-gray-100 dark:bg-gray-900/50 rounded-2xl w-full max-w-5xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">No Data to Display</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Import a CSV file or add a new category in the editor above to generate a heatmap.
                        </p>
                    </div>
                )}
            </main>
            
            {heatmapData.length > 0 && <Legend />}
            <Footer />
            <Tooltip tooltipData={tooltip} />
        </div>
    );
};

export default App;