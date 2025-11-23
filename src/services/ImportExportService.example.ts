/**
 * Example usage of ImportExportService
 * This file demonstrates how to use the ImportExportService in the application
 */

import { ImportExportService } from './ImportExportService';
import type { AppState } from '../types/models';

// Example: Creating a sample app state
const sampleState: AppState = {
    version: '1.0',
    projectName: 'My Test Project',
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    existingFunctionality: [],
    testCases: [
        {
            id: '123e4567-e89b-12d3-a456-426614174000',
            testName: 'Login functionality test',
            codeChange: 'new',
            organisationalPressure: 1,
            implementationType: 'custom-implementation',
            isLegal: false,
            userFrequency: 5,
            businessImpact: 5,
            affectedAreas: 3,
            notes: 'Critical user authentication flow',
            scores: {
                risk: 25,
                value: 25,
                ease: 5,
                history: 3,
                legal: 0,
                total: 58
            },
            recommendation: 'MAYBE'
        }
    ],
    metadata: {
        team: 'QA Team',
        sprint: 'Sprint 5',
        environment: 'Production'
    }
};

// Example 1: Export to JSON file
export function exportExample() {
    try {
        const filename = ImportExportService.exportToJSON(sampleState);
        console.log(`Exported to: ${filename}`);
        // This will trigger a download in the browser
    } catch (error) {
        console.error('Export failed:', error);
    }
}

// Example 2: Import from JSON file
export async function importExample(file: File) {
    try {
        const result = await ImportExportService.importFromJSON(file);

        if (result.success) {
            console.log('Import successful!');
            console.log('Project:', result.data?.projectName);
            console.log('Test cases:', result.data?.testCases.length);

            if (result.warnings && result.warnings.length > 0) {
                console.warn('Warnings:', result.warnings);
            }

            return result.data;
        } else {
            console.error('Import failed:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Import error:', error);
        return null;
    }
}

// Example 3: Copy to clipboard
export async function copyExample() {
    try {
        const success = await ImportExportService.copyToClipboard(sampleState);

        if (success) {
            console.log('Copied to clipboard!');
        } else {
            console.error('Failed to copy to clipboard');
        }
    } catch (error) {
        console.error('Copy error:', error);
    }
}

// Example 4: Using in a React component
export const ExampleUsageInComponent = `
import { ImportExportService } from './services/ImportExportService';
import { useAppContext } from './context/AppContext';

function ExportButton() {
    const { state } = useAppContext();
    
    const handleExport = () => {
        try {
            const filename = ImportExportService.exportToJSON(state);
            alert(\`Exported to \${filename}\`);
        } catch (error) {
            alert('Export failed: ' + error.message);
        }
    };
    
    return <button onClick={handleExport}>Export JSON</button>;
}

function ImportButton() {
    const { setState } = useAppContext();
    
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const result = await ImportExportService.importFromJSON(file);
        
        if (result.success && result.data) {
            setState(result.data);
            alert('Import successful!');
        } else {
            alert('Import failed: ' + result.error);
        }
    };
    
    return (
        <input 
            type="file" 
            accept=".json" 
            onChange={handleImport}
        />
    );
}

function CopyButton() {
    const { state } = useAppContext();
    
    const handleCopy = async () => {
        try {
            const success = await ImportExportService.copyToClipboard(state);
            if (success) {
                alert('Copied to clipboard!');
            }
        } catch (error) {
            alert('Copy failed: ' + error.message);
        }
    };
    
    return <button onClick={handleCopy}>Copy to Clipboard</button>;
}
`;
