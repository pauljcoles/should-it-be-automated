/**
 * StorageService - Handles localStorage persistence for the Test Prioritisation Tool
 * 
 * Responsibilities:
 * - Save and load application state with debouncing
 * - Manage state diagram version history (keep last 3 versions)
 * - Handle storage quota errors gracefully
 * - Provide clear data functionality
 */

import type { AppState, StateDiagram } from '../types/models';

// ============================================================================
// Constants
// ============================================================================

/** Key for storing current application state */
const APP_STATE_KEY = 'test-prioritizer-state';

/** Prefix for state diagram version keys */
const STATE_DIAGRAM_PREFIX = 'test-prioritizer-states-';

/** Key for application metadata */
const METADATA_KEY = 'test-prioritizer-metadata';

/** Debounce delay for auto-save (milliseconds) */
const SAVE_DEBOUNCE_DELAY = 500;

/** Maximum number of state diagram versions to keep per application */
const MAX_STATE_DIAGRAM_VERSIONS = 3;

// ============================================================================
// Types
// ============================================================================

interface StorageMetadata {
    lastSaved: string;
    version: string;
}

// ============================================================================
// Debounce Helper
// ============================================================================

let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounce a function call
 */
function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
        if (saveDebounceTimer) {
            clearTimeout(saveDebounceTimer);
        }
        saveDebounceTimer = setTimeout(() => {
            func(...args);
            saveDebounceTimer = null;
        }, delay);
    };
}

// ============================================================================
// StorageService Class
// ============================================================================

export class StorageService {
    /**
     * Save application state to localStorage with debouncing
     * Automatically debounces saves to prevent excessive write operations
     * 
     * @param state - The application state to save
     * @throws Error if storage quota is exceeded or access is denied
     */
    static saveAppState = debounce((state: AppState): void => {
        try {
            const serialized = JSON.stringify(state);
            localStorage.setItem(APP_STATE_KEY, serialized);

            // Update metadata
            const metadata: StorageMetadata = {
                lastSaved: new Date().toISOString(),
                version: state.version
            };
            localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'QuotaExceededError') {
                    throw new Error(
                        'Storage limit reached. Please export and clear old data to continue.'
                    );
                } else if (error.name === 'SecurityError') {
                    throw new Error(
                        'Local storage unavailable. Changes will not be saved. ' +
                        'Please check your browser settings.'
                    );
                }
            }
            throw new Error(`Failed to save application state: ${error}`);
        }
    }, SAVE_DEBOUNCE_DELAY);

    /**
     * Load application state from localStorage
     * 
     * @returns The loaded application state, or null if not found or invalid
     */
    static loadAppState(): AppState | null {
        try {
            const serialized = localStorage.getItem(APP_STATE_KEY);
            if (!serialized) {
                return null;
            }

            const state = JSON.parse(serialized) as AppState;

            // Basic validation
            if (!state.version || !state.testCases || !state.existingFunctionality) {
                console.warn('Invalid application state structure in localStorage');
                return null;
            }

            return state;

        } catch (error) {
            console.error('Failed to load application state:', error);
            return null;
        }
    }

    /**
     * Save a state diagram to localStorage with version management
     * Automatically maintains the last 3 versions per application
     * 
     * @param diagram - The state diagram to save
     * @throws Error if storage quota is exceeded
     */
    static saveStateDiagram(diagram: StateDiagram): void {
        try {
            const timestamp = Date.now();
            const key = `${STATE_DIAGRAM_PREFIX}${diagram.applicationName}-${timestamp}`;

            // Save the new diagram
            const serialized = JSON.stringify(diagram);
            localStorage.setItem(key, serialized);

            // Clean up old versions (keep last 3)
            this.cleanupOldStateDiagrams(diagram.applicationName);

        } catch (error) {
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                // Try to clean up and retry once
                this.cleanupOldStateDiagrams(diagram.applicationName, 1);

                try {
                    const timestamp = Date.now();
                    const key = `${STATE_DIAGRAM_PREFIX}${diagram.applicationName}-${timestamp}`;
                    const serialized = JSON.stringify(diagram);
                    localStorage.setItem(key, serialized);
                } catch (retryError) {
                    throw new Error(
                        'Storage limit reached. Please clear old state diagrams to continue.'
                    );
                }
            } else {
                throw new Error(`Failed to save state diagram: ${error}`);
            }
        }
    }

    /**
     * Load state diagram version history for a specific application
     * 
     * @param applicationName - Name of the application to load history for
     * @returns Array of state diagrams, sorted by timestamp (newest first)
     */
    static loadStateDiagramHistory(applicationName: string): StateDiagram[] {
        try {
            const prefix = `${STATE_DIAGRAM_PREFIX}${applicationName}-`;
            const diagrams: StateDiagram[] = [];

            // Find all keys for this application
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const serialized = localStorage.getItem(key);
                    if (serialized) {
                        try {
                            const diagram = JSON.parse(serialized) as StateDiagram;
                            diagrams.push(diagram);
                        } catch (parseError) {
                            console.warn(`Failed to parse state diagram at key ${key}:`, parseError);
                        }
                    }
                }
            }

            // Sort by timestamp (newest first)
            // Extract timestamp from key: test-prioritizer-states-{appName}-{timestamp}
            diagrams.sort((a, b) => {
                const timestampA = this.extractTimestampFromDiagram(a, applicationName);
                const timestampB = this.extractTimestampFromDiagram(b, applicationName);
                return timestampB - timestampA;
            });

            return diagrams;

        } catch (error) {
            console.error('Failed to load state diagram history:', error);
            return [];
        }
    }

    /**
     * Get the most recent state diagram for an application
     * 
     * @param applicationName - Name of the application
     * @returns The latest state diagram, or null if none exists
     */
    static getLatestStateDiagram(applicationName: string): StateDiagram | null {
        const history = this.loadStateDiagramHistory(applicationName);
        return history.length > 0 ? history[0] : null;
    }

    /**
     * Clear all data from localStorage
     * Removes application state, state diagrams, and metadata
     */
    static clearAllData(): void {
        try {
            // Remove all test-prioritizer-* keys
            const keysToRemove: string[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('test-prioritizer-')) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));

        } catch (error) {
            console.error('Failed to clear all data:', error);
            throw new Error(`Failed to clear data: ${error}`);
        }
    }

    /**
     * Get storage metadata
     * 
     * @returns Storage metadata or null if not found
     */
    static getMetadata(): StorageMetadata | null {
        try {
            const serialized = localStorage.getItem(METADATA_KEY);
            if (!serialized) {
                return null;
            }
            return JSON.parse(serialized) as StorageMetadata;
        } catch (error) {
            console.error('Failed to load metadata:', error);
            return null;
        }
    }

    /**
     * Check if localStorage is available
     * 
     * @returns true if localStorage is available and writable
     */
    static isAvailable(): boolean {
        try {
            const testKey = '__test_storage__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get approximate storage usage information
     * 
     * @returns Object with storage information
     */
    static getStorageInfo(): {
        totalKeys: number;
        appStateSize: number;
        stateDiagramCount: number;
        estimatedTotalSize: number;
    } {
        let totalKeys = 0;
        let appStateSize = 0;
        let stateDiagramCount = 0;
        let estimatedTotalSize = 0;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('test-prioritizer-')) {
                    totalKeys++;
                    const value = localStorage.getItem(key);
                    const size = value ? value.length * 2 : 0; // Rough estimate (UTF-16)
                    estimatedTotalSize += size;

                    if (key === APP_STATE_KEY) {
                        appStateSize = size;
                    } else if (key.startsWith(STATE_DIAGRAM_PREFIX)) {
                        stateDiagramCount++;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to get storage info:', error);
        }

        return {
            totalKeys,
            appStateSize,
            stateDiagramCount,
            estimatedTotalSize
        };
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    /**
     * Clean up old state diagram versions, keeping only the most recent ones
     * 
     * @param applicationName - Name of the application
     * @param keepCount - Number of versions to keep (default: MAX_STATE_DIAGRAM_VERSIONS)
     */
    private static cleanupOldStateDiagrams(
        applicationName: string,
        keepCount: number = MAX_STATE_DIAGRAM_VERSIONS
    ): void {
        try {
            const prefix = `${STATE_DIAGRAM_PREFIX}${applicationName}-`;
            const keys: { key: string; timestamp: number }[] = [];

            // Find all keys for this application
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    // Extract timestamp from key
                    const timestampStr = key.substring(prefix.length);
                    const timestamp = parseInt(timestampStr, 10);
                    if (!isNaN(timestamp)) {
                        keys.push({ key, timestamp });
                    }
                }
            }

            // Sort by timestamp (newest first)
            keys.sort((a, b) => b.timestamp - a.timestamp);

            // Remove old versions beyond the keep count
            if (keys.length > keepCount) {
                const toRemove = keys.slice(keepCount);
                toRemove.forEach(({ key }) => localStorage.removeItem(key));
            }

        } catch (error) {
            console.error('Failed to cleanup old state diagrams:', error);
        }
    }

    /**
     * Extract timestamp from a state diagram by finding its key in localStorage
     * 
     * @param diagram - The state diagram
     * @param applicationName - Name of the application
     * @returns Timestamp in milliseconds, or 0 if not found
     */
    private static extractTimestampFromDiagram(
        diagram: StateDiagram,
        applicationName: string
    ): number {
        try {
            const prefix = `${STATE_DIAGRAM_PREFIX}${applicationName}-`;
            const serialized = JSON.stringify(diagram);

            // Find the key that contains this diagram
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const value = localStorage.getItem(key);
                    if (value === serialized) {
                        const timestampStr = key.substring(prefix.length);
                        const timestamp = parseInt(timestampStr, 10);
                        return isNaN(timestamp) ? 0 : timestamp;
                    }
                }
            }

            // If not found, try to use the generated timestamp from metadata
            return new Date(diagram.metadata.generated).getTime();

        } catch (error) {
            console.error('Failed to extract timestamp:', error);
            return 0;
        }
    }
}
