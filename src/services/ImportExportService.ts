/**
 * ImportExportService - Handles JSON import/export functionality
 * 
 * Responsibilities:
 * - Export application state to JSON with proper filename generation
 * - Import and validate JSON files (Test Prioritisation State or State Diagram)
 * - Copy formatted data to clipboard
 * - Handle file reading and download operations
 */

import type { AppState } from '../types/models';

// ============================================================================
// Constants
// ============================================================================

/** Current version of the application state format */
const APP_STATE_VERSION = '1.0';

/** Filename prefix for exports */
const EXPORT_FILENAME_PREFIX = 'test-prioritization';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of JSON import validation
 */
export interface ImportResult {
    /** Whether the import was successful */
    success: boolean;

    /** The imported data (if successful) */
    data?: AppState;

    /** Error message (if failed) */
    error?: string;

    /** List of validation warnings */
    warnings?: string[];
}

// ============================================================================
// ImportExportService Class
// ============================================================================

export class ImportExportService {
    /**
     * Export application state to JSON file with automatic download
     * Generates filename in format: test-prioritization-{projectName}-{date}.json
     * 
     * @param state - The application state to export
     * @returns The generated filename
     */
    static exportToJSON(state: AppState): string {
        try {
            // Generate filename
            const filename = this.generateFilename(state.projectName);

            // Serialize state to JSON with pretty formatting
            const json = JSON.stringify(state, null, 2);

            // Create blob and download
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return filename;

        } catch (error) {
            throw new Error(`Failed to export JSON: ${error}`);
        }
    }

    /**
     * Import and validate JSON from a file
     * Supports both Test Prioritisation State and State Diagram formats
     * 
     * @param file - The file to import
     * @returns Promise resolving to import result with validation
     */
    static async importFromJSON(file: File): Promise<ImportResult> {
        try {
            // Read file content
            const content = await this.readFileAsText(file);

            // Parse JSON
            let data: any;
            try {
                data = JSON.parse(content);
            } catch (parseError) {
                return {
                    success: false,
                    error: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Parse error'}`
                };
            }

            // Validate the imported data
            const validationResult = this.validateImportedData(data);

            if (!validationResult.success) {
                return validationResult;
            }

            // Return successful import
            return {
                success: true,
                data: validationResult.data,
                warnings: validationResult.warnings
            };

        } catch (error) {
            return {
                success: false,
                error: `Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Copy application state to clipboard as formatted JSON
     * 
     * @param state - The application state to copy
     * @returns Promise resolving to true if successful
     */
    static async copyToClipboard(state: AppState): Promise<boolean> {
        try {
            // Serialize state to JSON with pretty formatting
            const json = JSON.stringify(state, null, 2);

            // Use Clipboard API
            await navigator.clipboard.writeText(json);

            return true;

        } catch (error) {
            // Fallback for browsers without Clipboard API
            try {
                return this.fallbackCopyToClipboard(JSON.stringify(state, null, 2));
            } catch (fallbackError) {
                throw new Error(`Failed to copy to clipboard: ${error}`);
            }
        }
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    /**
     * Generate export filename with timestamp
     * Format: test-prioritization-{projectName}-{YYYY-MM-DD}.json
     * 
     * @param projectName - Name of the project
     * @returns Generated filename
     */
    private static generateFilename(projectName: string): string {
        // Sanitize project name (remove special characters, replace spaces with hyphens)
        const sanitizedName = projectName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

        // Generate date string (YYYY-MM-DD)
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];

        // Construct filename
        return `${EXPORT_FILENAME_PREFIX}-${sanitizedName}-${dateStr}.json`;
    }

    /**
     * Read file content as text
     * 
     * @param file - The file to read
     * @returns Promise resolving to file content as string
     */
    private static readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target?.result) {
                    resolve(event.target.result as string);
                } else {
                    reject(new Error('Failed to read file content'));
                }
            };

            reader.onerror = () => {
                reject(new Error('File reading failed'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Validate imported JSON data
     * Checks for required fields and proper structure
     * 
     * @param data - The parsed JSON data
     * @returns Import result with validation details
     */
    private static validateImportedData(data: any): ImportResult {
        const warnings: string[] = [];

        // Check if it's an AppState object
        if (!data || typeof data !== 'object') {
            return {
                success: false,
                error: 'Invalid data structure: expected an object'
            };
        }

        // Check for required fields
        const requiredFields = ['version', 'projectName', 'created', 'lastModified', 'testCases', 'existingFunctionality'];
        const missingFields = requiredFields.filter(field => !(field in data));

        if (missingFields.length > 0) {
            return {
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            };
        }

        // Validate field types
        if (typeof data.version !== 'string') {
            return {
                success: false,
                error: 'Invalid version field: expected string'
            };
        }

        if (typeof data.projectName !== 'string') {
            return {
                success: false,
                error: 'Invalid projectName field: expected string'
            };
        }

        if (!Array.isArray(data.testCases)) {
            return {
                success: false,
                error: 'Invalid testCases field: expected array'
            };
        }

        if (!Array.isArray(data.existingFunctionality)) {
            return {
                success: false,
                error: 'Invalid existingFunctionality field: expected array'
            };
        }

        // Validate metadata (optional but should be object if present)
        if (data.metadata && typeof data.metadata !== 'object') {
            warnings.push('Invalid metadata field: expected object, using default');
            data.metadata = {};
        }

        // Ensure metadata exists
        if (!data.metadata) {
            data.metadata = {};
        }

        // Validate test cases structure
        for (let i = 0; i < data.testCases.length; i++) {
            const testCase = data.testCases[i];

            if (!testCase.id || typeof testCase.id !== 'string') {
                warnings.push(`Test case at index ${i} has invalid or missing id`);
            }

            if (!testCase.testName || typeof testCase.testName !== 'string') {
                warnings.push(`Test case at index ${i} has invalid or missing testName`);
            }

            if (!testCase.scores || typeof testCase.scores !== 'object') {
                warnings.push(`Test case at index ${i} has invalid or missing scores`);
            }
        }

        // Version compatibility check
        if (data.version !== APP_STATE_VERSION) {
            warnings.push(
                `Version mismatch: imported version ${data.version}, current version ${APP_STATE_VERSION}. ` +
                'Some features may not work as expected.'
            );
        }

        // Update lastModified to current time
        data.lastModified = new Date().toISOString();

        return {
            success: true,
            data: data as AppState,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    /**
     * Fallback method for copying to clipboard (for older browsers)
     * Uses the deprecated execCommand method
     * 
     * @param text - Text to copy
     * @returns true if successful
     */
    private static fallbackCopyToClipboard(text: string): boolean {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (error) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}
