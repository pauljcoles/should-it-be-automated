/**
 * Unit tests for ImportExportService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportExportService } from './ImportExportService';
import type { AppState } from '../types/models';

// ============================================================================
// Test Data
// ============================================================================

const createMockAppState = (): AppState => ({
    version: '1.0',
    projectName: 'Test Project',
    created: '2024-01-01T00:00:00.000Z',
    lastModified: '2024-01-01T00:00:00.000Z',
    existingFunctionality: [],
    testCases: [
        {
            id: '123e4567-e89b-12d3-a456-426614174000',
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

// ============================================================================
// Tests
// ============================================================================

describe('ImportExportService', () => {
    describe('generateFilename', () => {
        it('should generate filename with correct format', () => {
            const state = createMockAppState();
            const filename = (ImportExportService as any).generateFilename(state.projectName);

            // Should match pattern: test-prioritization-{projectName}-{YYYY-MM-DD}.json
            expect(filename).toMatch(/^test-prioritization-test-project-\d{4}-\d{2}-\d{2}\.json$/);
        });

        it('should sanitize project name with special characters', () => {
            const filename = (ImportExportService as any).generateFilename('My Project! @#$%');

            // Special characters should be replaced with hyphens
            expect(filename).toMatch(/^test-prioritization-my-project-\d{4}-\d{2}-\d{2}\.json$/);
        });

        it('should handle project name with spaces', () => {
            const filename = (ImportExportService as any).generateFilename('Test Project Name');

            // Spaces should be replaced with hyphens
            expect(filename).toMatch(/^test-prioritization-test-project-name-\d{4}-\d{2}-\d{2}\.json$/);
        });
    });

    describe('validateImportedData', () => {
        it('should validate correct AppState structure', () => {
            const state = createMockAppState();
            const result = (ImportExportService as any).validateImportedData(state);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.error).toBeUndefined();
        });

        it('should reject non-object data', () => {
            const result = (ImportExportService as any).validateImportedData('invalid');

            expect(result.success).toBe(false);
            expect(result.error).toContain('expected an object');
        });

        it('should reject data missing required fields', () => {
            const invalidData = {
                version: '1.0',
                projectName: 'Test'
                // Missing other required fields
            };

            const result = (ImportExportService as any).validateImportedData(invalidData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Missing required fields');
        });

        it('should reject data with invalid testCases type', () => {
            const invalidData = {
                version: '1.0',
                projectName: 'Test',
                created: '2024-01-01T00:00:00.000Z',
                lastModified: '2024-01-01T00:00:00.000Z',
                testCases: 'not an array',
                existingFunctionality: []
            };

            const result = (ImportExportService as any).validateImportedData(invalidData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('testCases');
        });

        it('should warn about version mismatch', () => {
            const state = createMockAppState();
            state.version = '0.9';

            const result = (ImportExportService as any).validateImportedData(state);

            expect(result.success).toBe(true);
            expect(result.warnings).toBeDefined();
            expect(result.warnings?.[0]).toContain('Version mismatch');
        });

        it('should warn about invalid test case structure', () => {
            const state = createMockAppState();
            state.testCases.push({
                // Missing required fields
            } as any);

            const result = (ImportExportService as any).validateImportedData(state);

            expect(result.success).toBe(true);
            expect(result.warnings).toBeDefined();
            expect(result.warnings?.some((w: string) => w.includes('invalid or missing'))).toBe(true);
        });

        it('should update lastModified timestamp', () => {
            const state = createMockAppState();
            const originalLastModified = state.lastModified;

            const result = (ImportExportService as any).validateImportedData(state);

            expect(result.success).toBe(true);
            expect(result.data?.lastModified).not.toBe(originalLastModified);
        });
    });

    describe('importFromJSON', () => {
        it('should successfully import valid JSON file', async () => {
            const state = createMockAppState();
            const jsonContent = JSON.stringify(state);
            const file = new File([jsonContent], 'test.json', { type: 'application/json' });

            const result = await ImportExportService.importFromJSON(file);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.projectName).toBe('Test Project');
        });

        it('should reject invalid JSON', async () => {
            const file = new File(['{ invalid json }'], 'test.json', { type: 'application/json' });

            const result = await ImportExportService.importFromJSON(file);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid JSON format');
        });

        it('should reject JSON with missing required fields', async () => {
            const invalidData = { version: '1.0' };
            const jsonContent = JSON.stringify(invalidData);
            const file = new File([jsonContent], 'test.json', { type: 'application/json' });

            const result = await ImportExportService.importFromJSON(file);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Missing required fields');
        });
    });

    describe('copyToClipboard', () => {
        beforeEach(() => {
            // Mock clipboard API
            Object.assign(navigator, {
                clipboard: {
                    writeText: vi.fn().mockResolvedValue(undefined)
                }
            });
        });

        it('should copy state to clipboard as JSON', async () => {
            const state = createMockAppState();

            const result = await ImportExportService.copyToClipboard(state);

            expect(result).toBe(true);
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('"projectName": "Test Project"')
            );
        });

        it('should format JSON with indentation', async () => {
            const state = createMockAppState();

            await ImportExportService.copyToClipboard(state);

            const calledWith = (navigator.clipboard.writeText as any).mock.calls[0][0];
            expect(calledWith).toContain('\n');
            expect(calledWith).toContain('  ');
        });
    });
});
