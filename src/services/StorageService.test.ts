/**
 * StorageService Tests
 * Tests for localStorage persistence functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService } from './StorageService';
import type { AppState, StateDiagram } from '../types/models';
import { CodeChange, ImplementationType } from '../types/models';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a minimal valid AppState for testing
 */
function createTestAppState(overrides?: Partial<AppState>): AppState {
    return {
        version: '1.0.0',
        projectName: 'Test Project',
        created: '2024-01-01T00:00:00.000Z',
        lastModified: '2024-01-01T00:00:00.000Z',
        existingFunctionality: [],
        testCases: [],
        metadata: {},
        ...overrides
    };
}

/**
 * Create a minimal valid StateDiagram for testing
 */
function createTestStateDiagram(
    applicationName: string,
    overrides?: Partial<StateDiagram>
): StateDiagram {
    return {
        version: '1.0',
        applicationName,
        states: {
            'state1': {
                description: 'Test State 1',
                actions: ['action1'],
                transitions: { 'action1': 'state2' },
                implementation: ImplementationType.CUSTOM,
                lastModified: '2024-01-01T00:00:00.000Z'
            }
        },
        metadata: {
            team: 'Test Team',
            environment: 'test',
            generated: '2024-01-01T00:00:00.000Z'
        },
        ...overrides
    };
}

// ============================================================================
// Tests
// ============================================================================

describe('StorageService', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.clearAllTimers();
    });

    afterEach(() => {
        // Clean up after each test
        localStorage.clear();
    });

    // ========================================================================
    // isAvailable Tests
    // ========================================================================

    describe('isAvailable', () => {
        it('should return true when localStorage is available', () => {
            expect(StorageService.isAvailable()).toBe(true);
        });
    });

    // ========================================================================
    // saveAppState and loadAppState Tests
    // ========================================================================

    describe('saveAppState and loadAppState', () => {
        it('should save and load application state', async () => {
            const state = createTestAppState({
                projectName: 'My Project',
                testCases: [
                    {
                        id: '123',
                        testName: 'Test Case 1',
                        codeChange: CodeChange.NEW,
                        organisationalPressure: 1,
                        implementationType: ImplementationType.CUSTOM,
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
                ]
            });

            // Save state (with debounce, so we need to wait)
            StorageService.saveAppState(state);

            // Wait for debounce
            await new Promise(resolve => setTimeout(resolve, 600));

            // Load state
            const loaded = StorageService.loadAppState();

            expect(loaded).not.toBeNull();
            expect(loaded?.projectName).toBe('My Project');
            expect(loaded?.testCases).toHaveLength(1);
            expect(loaded?.testCases[0].testName).toBe('Test Case 1');
        });

        it('should return null when no state exists', () => {
            const loaded = StorageService.loadAppState();
            expect(loaded).toBeNull();
        });

        it('should return null when state is invalid JSON', () => {
            localStorage.setItem('test-prioritizer-state', 'invalid json');
            const loaded = StorageService.loadAppState();
            expect(loaded).toBeNull();
        });

        it('should return null when state structure is invalid', () => {
            localStorage.setItem('test-prioritizer-state', JSON.stringify({ invalid: 'structure' }));
            const loaded = StorageService.loadAppState();
            expect(loaded).toBeNull();
        });

        it('should save metadata when saving state', async () => {
            const state = createTestAppState();
            StorageService.saveAppState(state);

            // Wait for debounce
            await new Promise(resolve => setTimeout(resolve, 600));

            const metadata = StorageService.getMetadata();
            expect(metadata).not.toBeNull();
            expect(metadata?.version).toBe('1.0.0');
            expect(metadata?.lastSaved).toBeDefined();
        });
    });

    // ========================================================================
    // saveStateDiagram Tests
    // ========================================================================

    describe('saveStateDiagram', () => {
        it('should save a state diagram with timestamp in key', () => {
            const diagram = createTestStateDiagram('TestApp');
            StorageService.saveStateDiagram(diagram);

            // Check that a key was created with the correct pattern
            let found = false;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('test-prioritizer-states-TestApp-')) {
                    found = true;
                    const value = localStorage.getItem(key);
                    expect(value).toBeDefined();
                    const parsed = JSON.parse(value!);
                    expect(parsed.applicationName).toBe('TestApp');
                }
            }
            expect(found).toBe(true);
        });

        it('should maintain only the last 3 versions', async () => {
            const appName = 'TestApp';

            // Save 5 diagrams with small delays between them to ensure different timestamps
            for (let i = 0; i < 5; i++) {
                const diagram = createTestStateDiagram(appName, {
                    metadata: {
                        team: 'Test Team',
                        environment: 'test',
                        generated: new Date(2024, 0, i + 1).toISOString()
                    }
                });
                StorageService.saveStateDiagram(diagram);
                // Small delay to ensure different timestamps
                if (i < 4) {
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }

            // Count keys for this application
            let count = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`test-prioritizer-states-${appName}-`)) {
                    count++;
                }
            }

            expect(count).toBe(3);
        });

        it('should keep versions for different applications separate', () => {
            const diagram1 = createTestStateDiagram('App1');
            const diagram2 = createTestStateDiagram('App2');

            StorageService.saveStateDiagram(diagram1);
            StorageService.saveStateDiagram(diagram2);

            const history1 = StorageService.loadStateDiagramHistory('App1');
            const history2 = StorageService.loadStateDiagramHistory('App2');

            expect(history1).toHaveLength(1);
            expect(history2).toHaveLength(1);
            expect(history1[0].applicationName).toBe('App1');
            expect(history2[0].applicationName).toBe('App2');
        });
    });

    // ========================================================================
    // loadStateDiagramHistory Tests
    // ========================================================================

    describe('loadStateDiagramHistory', () => {
        it('should return empty array when no diagrams exist', () => {
            const history = StorageService.loadStateDiagramHistory('NonExistent');
            expect(history).toEqual([]);
        });

        it('should return diagrams sorted by timestamp (newest first)', async () => {
            const appName = 'TestApp';

            // Save 3 diagrams with different timestamps
            const diagram1 = createTestStateDiagram(appName, {
                states: { 'state1': { description: 'First', actions: [], transitions: {} } }
            });
            const diagram2 = createTestStateDiagram(appName, {
                states: { 'state2': { description: 'Second', actions: [], transitions: {} } }
            });
            const diagram3 = createTestStateDiagram(appName, {
                states: { 'state3': { description: 'Third', actions: [], transitions: {} } }
            });

            // Save with small delays to ensure different timestamps
            StorageService.saveStateDiagram(diagram1);
            await new Promise(resolve => setTimeout(resolve, 10));
            StorageService.saveStateDiagram(diagram2);
            await new Promise(resolve => setTimeout(resolve, 10));
            StorageService.saveStateDiagram(diagram3);

            const history = StorageService.loadStateDiagramHistory(appName);

            expect(history).toHaveLength(3);
            // Newest should be first
            expect(history[0].states['state3']).toBeDefined();
            expect(history[1].states['state2']).toBeDefined();
            expect(history[2].states['state1']).toBeDefined();
        });

        it('should handle corrupted diagram data gracefully', () => {
            // Manually insert corrupted data
            localStorage.setItem('test-prioritizer-states-TestApp-123456', 'invalid json');

            const history = StorageService.loadStateDiagramHistory('TestApp');
            expect(history).toEqual([]);
        });
    });

    // ========================================================================
    // getLatestStateDiagram Tests
    // ========================================================================

    describe('getLatestStateDiagram', () => {
        it('should return null when no diagrams exist', () => {
            const latest = StorageService.getLatestStateDiagram('NonExistent');
            expect(latest).toBeNull();
        });

        it('should return the most recent diagram', async () => {
            const appName = 'TestApp';

            const diagram1 = createTestStateDiagram(appName, {
                states: { 'old': { description: 'Old', actions: [], transitions: {} } }
            });
            const diagram2 = createTestStateDiagram(appName, {
                states: { 'new': { description: 'New', actions: [], transitions: {} } }
            });

            StorageService.saveStateDiagram(diagram1);
            await new Promise(resolve => setTimeout(resolve, 10));
            StorageService.saveStateDiagram(diagram2);

            const latest = StorageService.getLatestStateDiagram(appName);

            expect(latest).not.toBeNull();
            expect(latest?.states['new']).toBeDefined();
        });
    });

    // ========================================================================
    // clearAllData Tests
    // ========================================================================

    describe('clearAllData', () => {
        it('should remove all test-prioritizer-* keys', async () => {
            // Add various data
            const state = createTestAppState();
            StorageService.saveAppState(state);
            await new Promise(resolve => setTimeout(resolve, 600));

            const diagram = createTestStateDiagram('TestApp');
            StorageService.saveStateDiagram(diagram);

            // Add a non-test-prioritizer key
            localStorage.setItem('other-key', 'should remain');

            // Clear all data
            StorageService.clearAllData();

            // Check that test-prioritizer keys are gone
            let hasPrioritizerKeys = false;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('test-prioritizer-')) {
                    hasPrioritizerKeys = true;
                }
            }

            expect(hasPrioritizerKeys).toBe(false);
            expect(localStorage.getItem('other-key')).toBe('should remain');
        });

        it('should result in null when loading state after clear', async () => {
            const state = createTestAppState();
            StorageService.saveAppState(state);
            await new Promise(resolve => setTimeout(resolve, 600));

            StorageService.clearAllData();

            const loaded = StorageService.loadAppState();
            expect(loaded).toBeNull();
        });
    });

    // ========================================================================
    // getStorageInfo Tests
    // ========================================================================

    describe('getStorageInfo', () => {
        it('should return zero counts when storage is empty', () => {
            const info = StorageService.getStorageInfo();
            expect(info.totalKeys).toBe(0);
            expect(info.appStateSize).toBe(0);
            expect(info.stateDiagramCount).toBe(0);
            expect(info.estimatedTotalSize).toBe(0);
        });

        it('should count keys and estimate sizes', async () => {
            const state = createTestAppState();
            StorageService.saveAppState(state);
            await new Promise(resolve => setTimeout(resolve, 600));

            const diagram = createTestStateDiagram('TestApp');
            StorageService.saveStateDiagram(diagram);

            const info = StorageService.getStorageInfo();
            expect(info.totalKeys).toBeGreaterThan(0);
            expect(info.appStateSize).toBeGreaterThan(0);
            expect(info.stateDiagramCount).toBe(1);
            expect(info.estimatedTotalSize).toBeGreaterThan(0);
        });
    });

    // ========================================================================
    // getMetadata Tests
    // ========================================================================

    describe('getMetadata', () => {
        it('should return null when no metadata exists', () => {
            const metadata = StorageService.getMetadata();
            expect(metadata).toBeNull();
        });

        it('should return metadata after saving state', async () => {
            const state = createTestAppState({ version: '2.0.0' });
            StorageService.saveAppState(state);
            await new Promise(resolve => setTimeout(resolve, 600));

            const metadata = StorageService.getMetadata();
            expect(metadata).not.toBeNull();
            expect(metadata?.version).toBe('2.0.0');
            expect(metadata?.lastSaved).toBeDefined();
        });
    });
});
