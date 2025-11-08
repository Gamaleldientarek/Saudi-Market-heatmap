import { StockData } from '../types';

export const parseCSV = (csvContent: string): StockData[] => {
    if (!csvContent) return [];
    
    const newData: StockData[] = [];
    const lines = csvContent.split(/\r\n|\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    
    const nameIndex = headers.indexOf('name');
    const marketCapIndex = headers.indexOf('marketCap');
    const priceIndex = headers.indexOf('price');
    const changeIndex = headers.indexOf('change');

    if (nameIndex === -1 || marketCapIndex === -1 || priceIndex === -1 || changeIndex === -1) {
        console.error("CSV headers are incorrect. Must include: name, marketCap, price, change");
        throw new Error("Invalid CSV headers");
    }

    // This regex handles quoted fields, but had a bug causing infinite loops on some inputs.
    const regex = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\",\n\r]*))(?:,|\r?\n|\r|$)/g;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values: string[] = [];
        
        // FIX 1: Reset regex state for each new line to be parsed. Without this,
        // parsing could fail on the second line of a file.
        regex.lastIndex = 0;

        // FIX 2: This loop structure is designed to prevent an infinite loop caused by
        // zero-length matches at the end of a line, which was the root cause of the
        // "Invalid array length" error.
        while (true) {
            const match = regex.exec(line);
            if (!match) {
                break; // No more matches, we're done with the line.
            }
            
            // Extract the matched value, handling quoted vs. unquoted fields.
            const value = match[1] ? match[1].replace(/\"\"/g, '\"') : match[2];
            values.push(value.trim());

            // A zero-length match indicates the regex has parsed to the end of the line.
            // We must break here to prevent the infinite loop.
            if (match[0].length === 0) {
                break;
            }
        }

        if (values.length >= Math.max(nameIndex, marketCapIndex, priceIndex, changeIndex) + 1) {
            const name = values[nameIndex];
            const marketCap = parseFloat(values[marketCapIndex]);
            const price = parseFloat(values[priceIndex]);
            const change = parseFloat(values[changeIndex]);

            if (name && !isNaN(marketCap) && !isNaN(price) && !isNaN(change)) {
                newData.push({ name, marketCap, price, change });
            } else {
                console.warn(`Skipping bad CSV line (validation failed): ${lines[i]}`);
            }
        } else {
            console.warn(`Skipping invalid CSV line (parsing error): ${lines[i]}`);
        }
    }

    return newData;
};

export const downloadSampleCSV = (): void => {
    const csvContent = `name,marketCap,price,change
Commercial & Professional Svc,4284.46,0,1.76
Tadawul All Share Index (TASI),11302.35,0,0.41
Transportation,5593.49,0,0.64
Consumer Durables & Apparel,4152.07,0,-0.4
Consumer Services,4191.26,0,1.54
Media and Entertainment,19626.7,0,0.16
"Real Estate Mgmt & Dev't",3801.76,0,0.63
MSCI Tadawul 30 Index,1468.54,0,0.19
Software & Services,6187.39,0,-0.16`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'indices_sample_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
