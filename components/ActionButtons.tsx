import React from 'react';

interface ActionButtonsProps {
    onAddRow?: () => void;
    onUpdateHeatmap?: () => void;
    onImportCsv?: () => void;
    onDownloadSampleCsv?: () => void;
    onDownloadSVG?: () => void;
    onDownloadPNG?: () => void;
    onClearAll?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = (props) => {
    
    const baseBtnClass = "px-4 py-2 border-2 rounded-md font-bold cursor-pointer transition-all duration-300 transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";

    if (props.onAddRow) {
        // Table actions
        return (
             <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={props.onImportCsv} className={`${baseBtnClass} bg-transparent border-gray-500 text-gray-500 hover:bg-gray-500/10 hover:border-gray-400 hover:text-gray-400`}>Import from CSV</button>
                <button onClick={props.onDownloadSampleCsv} className={`${baseBtnClass} bg-transparent border-gray-500 text-gray-500 hover:bg-gray-500/10 hover:border-gray-400 hover:text-gray-400`}>Download Sample CSV</button>
                <button onClick={props.onAddRow} className={`${baseBtnClass} bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark`}>+ Add New Category</button>
                <button onClick={props.onUpdateHeatmap} className={`${baseBtnClass} bg-positive border-positive text-white hover:bg-positive-dark hover:border-positive-dark`}>🔄 Update Heatmap</button>
                {props.onClearAll && (
                    <button onClick={props.onClearAll} className={`${baseBtnClass} bg-negative border-negative text-white hover:bg-negative-dark hover:border-negative-dark`}>
                        Clear All Data
                    </button>
                )}
            </div>
        );
    }

    // Export actions
    return (
        <div className="flex justify-center flex-wrap gap-4 -mt-2">
            <button onClick={props.onDownloadSVG} className={`${baseBtnClass} bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark`}>⬇️ Download SVG</button>
            <button onClick={props.onDownloadPNG} className={`${baseBtnClass} bg-positive border-positive text-white hover:bg-positive-dark hover:border-positive-dark`}>⬇️ Download PNG</button>
        </div>
    );
};

export default ActionButtons;