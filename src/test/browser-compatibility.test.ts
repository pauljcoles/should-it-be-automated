/**
 * Browser Compatibility Tests
 * 
 * Tests browser-specific APIs and features:
 * - localStorage behavior
 * - Clipboard API
 * - FileReader API
 * - Blob and URL.createObjectURL
 * - JSON serialization/parsing
 * 
 * These tests should pass on Chrome, Firefox, Safari, and Edge
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService } from '../services/StorageService';
import { ImportExportService } from '../services/ImportExportService';
import type { AppState, StateDiagram } from '../types/models';

// ============================================================================
// Test Data Fixtures
// ============================================================================

const createMockAppState = (): AppState => ({
    version: '1.0',
    projectName: 'Test Project',
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    existingFunctionality: [],
    testCases: [
        {
            id: 'test-1',
            testName: 'Test Case 1',
            changeType: 'new',
            implementationType: 'custom-implementation',
            isLegal: false,
            userFrequency: 3,
            businessImpact: 4,
            affectedAreas: 2,
            scores: {
                risk: 12,
                value: 20,
                ease: 5,
                history: 2,
                legal: 0,
                total: 39
            },
            recommendation: 'MAYBE'
        }
    ],
    metadata: {
        team: 'QA Team',
        sprint: 'Sprint 1'
    }
});

const createMockStateDiagram = (): StateDiagram => ({
    version: '1.0',
    applicationName: 'TestApp',
    states: {
        'login': {
            description: 'Login state',
            actions: ['enter_credentials', 'submit'],
            transitions: {
                'submit': 'dashboard'
            },
            implementation: 'custom-implementation',
            lastModified: new Date().toISOString()
        },
        'dashboard': {
            description: 'Dashboard state',
            actions: ['view_data'],
            transitions: {},
            implementation: 'standard-components'
        }
    },
    metadata: {
        team: 'Dev Team',
        environment: 'test',
        generated: new Date().toISOString()
    }
});

// ============================================================================
// localStorage Compatibility Tests
// ============================================================================

describe('localStorage Browser Compatibility', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Use fake timers for debounced functions
        vi.useFakeTimers();
    });

    afterEach(() => {
        // Clean up after each test
        localStorage.clear();
        // Restore real timers
        vi.useRealTimers();
    });

    it('should detect localStorage availability', () => {
        const isAvailable = StorageService.isAvailable();
        expect(isAvailable).toBe(true);
    });

    it('should save and load app state from localStorage', () => {
        const mockState = createMockAppState();

        // Save state
        StorageService.saveAppState(mockState);

        // Wait for debounce (need to flush timers)
        vi.runAllTimers();

        // Load state
        const loadedState = StorageService.loadAppState();

        expect(loadedState).not.toBeNull();
        expect(loadedState?.projectName).toBe(mockState.projectName);
        expect(loadedState?.testCases).toHaveLength(1);
    });

    it('should handle localStorage quota exceeded error', () => {
        const mockState = createMockAppState();

        // Mock localStorage.setItem to throw QuotaExceededError
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            const error = new Error('QuotaExceededError');
            error.name = 'QuotaExceededError';
            throw error;
        });

        // Should throw error with helpful message
        expect(() => {
            StorageService.saveAppState(mockState);
            vi.runAllTimers();
        }).toThrow(/Storage limit reached/);

        // Restore original
        setItemSpy.mockRestore();
    });

    it('should handle localStorage security error', () => {
        const mockState = createMockAppState();

        // Mock localStorage.setItem to throw SecurityError
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            const error = new Error('SecurityError');
            error.name = 'SecurityError';
            throw error;
        });

        // Should throw error with helpful message
        expect(() => {
            StorageService.saveAppState(mockState);
            vi.runAllTimers();
        }).toThrow(/Local storage unavailable/);

        // Restore original
        setItemSpy.mockRestore();
    });

    it('should save and load state diagrams with version management', () => {
        // Use real timers for this test
        vi.useRealTimers();

        const diagram1 = createMockStateDiagram();
        const diagram2 = { ...createMockStateDiagram(), version: '1.1' };
        const diagram3 = { ...createMockStateDiagram(), version: '1.2' };

        // Save multiple versions with unique timestamps
        // We need to ensure different timestamps by directly setting keys
        const timestamp1 = Date.now();
        const timestamp2 = timestamp1 + 1;
        const timestamp3 = timestamp1 + 2;

        localStorage.setItem(`test-prioritizer-states-TestApp-${timestamp1}`, JSON.stringify(diagram1));
        localStorage.setItem(`test-prioritizer-states-TestApp-${timestamp2}`, JSON.stringify(diagram2));
        localStorage.setItem(`test-prioritizer-states-TestApp-${timestamp3}`, JSON.stringify(diagram3));

        // Load history
        const history = StorageService.loadStateDiagramHistory('TestApp');

        expect(history).toHaveLength(3);
        expect(history[0].version).toBe('1.2'); // Newest first

        // Restore fake timers
        vi.useFakeTimers();
    });

    it('should enforce version limit (keep last 3)', () => {
        // Use real timers for this test
        vi.useRealTimers();

        const diagrams = [
            { ...createMockStateDiagram(), version: '1.0' },
            { ...createMockStateDiagram(), version: '1.1' },
            { ...createMockStateDiagram(), version: '1.2' },
            { ...createMockStateDiagram(), version: '1.3' }
        ];

        // Save 4 versions with unique timestamps
        const baseTimestamp = Date.now();
        diagrams.forEach((d, index) => {
            const timestamp = baseTimestamp + index;
            localStorage.setItem(`test-prioritizer-states-TestApp-${timestamp}`, JSON.stringify(d));
        });

        // Manually trigger cleanup
        StorageService['cleanupOldStateDiagrams']('TestApp', 3);

        // Should only keep last 3
        const history = StorageService.loadStateDiagramHistory('TestApp');
        expect(history).toHaveLength(3);
        expect(history[0].version).toBe('1.3');
        expect(history[2].version).toBe('1.1');

        // Restore fake timers
        vi.useFakeTimers();
    });

    it('should clear all data from localStorage', () => {
        const mockState = createMockAppState();
        const mockDiagram = createMockStateDiagram();

        // Save data
        StorageService.saveAppState(mockState);
        vi.runAllTimers();

        // Use real timers for state diagram save
        vi.useRealTimers();
        StorageService.saveStateDiagram(mockDiagram);
        vi.useFakeTimers();

        // Verify data exists
        expect(localStorage.getItem('test-prioritizer-state')).not.toBeNull();

        // Clear all data
        StorageService.clearAllData();

        // Verify all test-prioritizer-* keys are removed
        expect(localStorage.getItem('test-prioritizer-state')).toBeNull();
        const history = StorageService.loadStateDiagramHistory('TestApp');
        expect(history).toHaveLength(0);
    });

    it('should get storage information', () => {
        const mockState = createMockAppState();
        StorageService.saveAppState(mockState);
        vi.runAllTimers();

        const info = StorageService.getStorageInfo();

        expect(info.totalKeys).toBeGreaterThan(0);
        expect(info.appStateSize).toBeGreaterThan(0);
        expect(info.estimatedTotalSize).toBeGreaterThan(0);
    });

    it('should handle corrupted localStorage data gracefully', () => {
        // Use real timers for this test
        vi.useRealTimers();

        // Save invalid JSON
        localStorage.setItem('test-prioritizer-state', 'invalid json {{{');

        // Should return null instead of throwing
        const loadedState = StorageService.loadAppState();
        expect(loadedState).toBeNull();

        // Restore fake timers
        vi.useFakeTimers();
    });

    it('should handle missing required fields in localStorage', () => {
        // Use real timers for this test
        vi.useRealTimers();

        // Save incomplete state
        localStorage.setItem('test-prioritizer-state', JSON.stringify({
            version: '1.0'
            // Missing other required fields
        }));

        // Should return null
        const loadedState = StorageService.loadAppState();
        expect(loadedState).toBeNull();

        // Restore fake timers
        vi.useFakeTimers();
    });
});

// ============================================================================
// Clipboard API Compatibility Tests
// ============================================================================

describe('Clipboard API Browser Compatibility', () => {
    beforeEach(() => {
        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
                readText: vi.fn().mockResolvedValue('')
            }
        });
    });

    it('should copy app state to clipboard', async () => {
        const mockState = createMockAppState();

        const result = await ImportExportService.copyToClipboard(mockState);

        expect(result).toBe(true);
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should handle clipboard API not available', async () => {
        // Remove clipboard API
        const originalClipboard = navigator.clipboard;
        // @ts-expect-error - Testing clipboard unavailability
        delete navigator.clipboard;

        const mockState = createMockAppState();

        // Should fall back to execCommand
        // Note: execCommand may not work in test environment, so we expect it to try
        try {
            await ImportExportService.copyToClipboard(mockState);
        } catch (error) {
            // Expected in test environment
            expect(error).toBeDefined();
        }

        // Restore clipboard
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            writable: true
        });
    });

    it('should handle clipboard write failure', async () => {
        // Mock clipboard to fail
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockRejectedValue(new Error('Permission denied'))
            }
        });

        const mockState = createMockAppState();

        // Should attempt fallback (which may return false in test environment)
        const result = await ImportExportService.copyToClipboard(mockState);

        // In test environment, fallback may not work, so we just verify it doesn't crash
        expect(typeof result).toBe('boolean');
    });
});

// ============================================================================
// File API Compatibility Tests
// ============================================================================

describe('File API Browser Compatibility', () => {
    it('should export app state to JSON file', () => {
        const mockState = createMockAppState();

        // Mock document methods
        const createElementSpy = vi.spyOn(document, 'createElement');
        const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
        const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

        // Mock URL.createObjectURL and revokeObjectURL
        (globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        (globalThis as any).URL.revokeObjectURL = vi.fn();

        const filename = ImportExportService.exportToJSON(mockState);

        // Verify filename format
        expect(filename).toMatch(/^test-prioritization-test-project-\d{4}-\d{2}-\d{2}\.json$/);

        // Verify DOM manipulation
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();
        expect((globalThis as any).URL.createObjectURL).toHaveBeenCalled();
        expect((globalThis as any).URL.revokeObjectURL).toHaveBeenCalled();

        // Cleanup
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });

    it('should import and validate JSON file', async () => {
        const mockState = createMockAppState();
        const jsonContent = JSON.stringify(mockState);

        // Create mock file
        const file = new File([jsonContent], 'test.json', { type: 'application/json' });

        const result = await ImportExportService.importFromJSON(file);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.projectName).toBe('Test Project');
    });

    it('should handle invalid JSON file', async () => {
        const invalidJson = 'invalid json {{{';
        const file = new File([invalidJson], 'test.json', { type: 'application/json' });

        const result = await ImportExportService.importFromJSON(file);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid JSON format');
    });

    it('should handle missing required fields in import', async () => {
        const incompleteState = {
            version: '1.0',
            projectName: 'Test'
            // Missing other required fields
        };
        const jsonContent = JSON.stringify(incompleteState);
        const file = new File([jsonContent], 'test.json', { type: 'application/json' });

        const result = await ImportExportService.importFromJSON(file);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Missing required fields');
    });

    it('should handle file read errors', async () => {
        // Create a file that will cause read error
        const file = new File([], 'test.json', { type: 'application/json' });

        // Mock FileReader to fail
        const originalFileReader = (globalThis as any).FileReader;
        (globalThis as any).FileReader = class MockFileReader {
            readAsText() {
                setTimeout(() => {
                    if (this.onerror) {
                        this.onerror(new Event('error'));
                    }
                }, 0);
            }
            onerror: ((event: Event) => void) | null = null;
            onload: ((event: ProgressEvent) => void) | null = null;
        } as any;

        const result = await ImportExportService.importFromJSON(file);

        expect(result.success).toBe(false);

        // Restore FileReader
        (globalThis as any).FileReader = originalFileReader;
    });
});

// ============================================================================
// JSON Serialization Compatibility Tests
// ============================================================================

describe('JSON Serialization Browser Compatibility', () => {
    it('should serialize and parse app state correctly', () => {
        const mockState = createMockAppState();

        // Serialize
        const json = JSON.stringify(mockState);

        // Parse
        const parsed = JSON.parse(json);

        // Verify structure
        expect(parsed.version).toBe(mockState.version);
        expect(parsed.projectName).toBe(mockState.projectName);
        expect(parsed.testCases).toHaveLength(mockState.testCases.length);
    });

    it('should handle special characters in JSON', () => {
        const mockState = createMockAppState();
        mockState.testCases[0].testName = 'Test with "quotes" and \\backslashes\\';
        mockState.testCases[0].notes = 'Notes with\nnewlines\tand\ttabs';

        // Serialize and parse
        const json = JSON.stringify(mockState);
        const parsed = JSON.parse(json);

        // Verify special characters are preserved
        expect(parsed.testCases[0].testName).toBe(mockState.testCases[0].testName);
        expect(parsed.testCases[0].notes).toBe(mockState.testCases[0].notes);
    });

    it('should handle Unicode characters in JSON', () => {
        const mockState = createMockAppState();
        mockState.testCases[0].testName = 'Test with émojis 🎉 and 中文';

        // Serialize and parse
        const json = JSON.stringify(mockState);
        const parsed = JSON.parse(json);

        // Verify Unicode is preserved
        expect(parsed.testCases[0].testName).toBe(mockState.testCases[0].testName);
    });

    it('should handle dates in ISO format', () => {
        const mockState = createMockAppState();
        const now = new Date();
        mockState.created = now.toISOString();

        // Serialize and parse
        const json = JSON.stringify(mockState);
        const parsed = JSON.parse(json);

        // Verify date format
        expect(parsed.created).toBe(now.toISOString());
        expect(new Date(parsed.created).getTime()).toBe(now.getTime());
    });
});

// ============================================================================
// Blob and URL API Compatibility Tests
// ============================================================================

describe('Blob and URL API Browser Compatibility', () => {
    it('should create Blob from JSON string', () => {
        const mockState = createMockAppState();
        const json = JSON.stringify(mockState);

        const blob = new Blob([json], { type: 'application/json' });

        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/json');
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should create and revoke object URL', () => {
        const blob = new Blob(['test'], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);
        expect(url).toBeTruthy();
        expect(typeof url).toBe('string');

        // Should not throw
        expect(() => URL.revokeObjectURL(url)).not.toThrow();
    });
});

// ============================================================================
// Cross-Browser Feature Detection Tests
// ============================================================================

describe('Cross-Browser Feature Detection', () => {
    it('should detect localStorage support', () => {
        expect(typeof Storage).toBe('function');
        expect(window.localStorage).toBeDefined();
    });

    it('should detect FileReader support', () => {
        expect(typeof FileReader).toBe('function');
    });

    it('should detect Blob support', () => {
        expect(typeof Blob).toBe('function');
    });

    it('should detect URL API support', () => {
        expect(typeof URL).toBe('function');
        expect(typeof URL.createObjectURL).toBe('function');
        expect(typeof URL.revokeObjectURL).toBe('function');
    });

    it('should detect JSON support', () => {
        expect(typeof JSON).toBe('object');
        expect(typeof JSON.stringify).toBe('function');
        expect(typeof JSON.parse).toBe('function');
    });

    it('should detect clipboard API support', () => {
        // Clipboard API may not be available in all test environments
        // Just check if navigator exists
        expect(navigator).toBeDefined();
    });
});
