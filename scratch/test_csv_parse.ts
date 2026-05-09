import fs from 'fs';
import Papa from 'papaparse';

const filePath = 'd:\\MY FREELANCING\\nagar-nigam-dashboard\\mathura_2026-05-07.csv';

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const results = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true
    });

    console.log('Headers found:', results.meta.fields);
    console.log('Number of rows:', results.data.length);
    if (results.data.length > 0) {
        console.log('First row sample:');
        const firstRow = results.data[0] as any;
        console.log('Ward Area:', firstRow['Ward Area']);
        console.log('Route ID:', firstRow['Route ID']);
        console.log('KML Content length:', firstRow['KML Content']?.length);
        console.log('KML Content start:', firstRow['KML Content']?.substring(0, 100));
    }
} catch (error) {
    console.error('Error reading CSV:', error);
}
