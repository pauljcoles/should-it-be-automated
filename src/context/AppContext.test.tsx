/**
 * Tests for AppContext
 * Validates state management actions and context functionality
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';
import { CodeChange, ImplementationType, DataSource, FunctionalityStatus, Recommendation } from '../types/models';

describe('AppContext', () => {
    describe('Test Case Management', () => {
        it('should add a test case with calculated scores', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.addTestCase({
                    testName: 'Test Login',
                    codeChange: CodeChange.NEW,
                    organisationalPressure: 1,
                    isLegal: false,
                    // Normal mode uses Angie's fields
                    impact: 5,
                    probOfUse: 5,
                    distinctness: 3,
                    fixProbability: 3,
                    easyToWrite: 3,
                    quickToWrite: 3,
                    similarity: 1,
                    breakFreq: 1,
                    // Legacy fields for compatibility
                    userFrequency: 5,
                    businessImpact: 5,
                    affectedAreas: 3
                });
            });

            expect(result.current.appState.testCases).toHaveLength(1);
            expect(result.current.appState.testCases[0].testName).toBe('Test Login');
            // In Normal mode (default), uses customerRisk instead of risk
            expect(result.current.appState.testCases[0].scores.customerRisk).toBe(25); // 5 * 5
            expect(result.current.appState.testCases[0].id).toBeDefined();
        });

        it('should update a test case and recalculate scores', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.addTestCase({
                    testName: 'Test Login',
                    codeChange: CodeChange.NEW,
                    organisationalPressure: 1,
                    implementationType: ImplementationType.CUSTOM,
                    isLegal: false,
                    // Normal mode uses Angie's fields
                    impact: 3,
                    probOfUse: 3,
                    distinctness: 3,
                    fixProbability: 3,
                    easyToWrite: 3,
                    quickToWrite: 3,
                    similarity: 1,
                    breakFreq: 1,
                    // Legacy fields for compatibility
                    userFrequency: 3,
                    businessImpact: 3,
                    affectedAreas: 2
                });
            });

            const testCaseId = result.current.appState.testCases[0].id;
            const originalScore = result.current.appState.testCases[0].scores.total;

            act(() => {
                result.current.updateTestCase(testCaseId, {
                    impact: 5,
                    probOfUse: 5,
                    userFrequency: 5,
                    businessImpact: 5
                });
            });

            const updatedTestCase = result.current.appState.testCases[0];
            expect(updatedTestCase.userFrequency).toBe(5);
            expect(updatedTestCase.businessImpact).toBe(5);
            // In Normal mode (default), uses customerRisk instead of risk
            expect(updatedTestCase.scores.customerRisk).toBe(25); // 5 * 5
            expect(updatedTestCase.scores.total).toBeGreaterThan(originalScore);
        });

        it('should delete a test case', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.addTestCase({
                    testName: 'Test Login',
                    codeChange: CodeChange.NEW,
                    organisationalPressure: 1,  
                    implementationType: ImplementationType.CUSTOM,
                    isLegal: false,
                    userFrequency: 3,
                    businessImpact: 3,
                    affectedAreas: 2
                });
            });

            expect(result.current.appState.testCases).toHaveLength(1);
            const testCaseId = result.current.appState.testCases[0].id;

            act(() => {
                result.current.deleteTestCase(testCaseId);
            });

            expect(result.current.appState.testCases).toHaveLength(0);
        });

        it('should duplicate a test case with " (Copy)" appended', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.addTestCase({
                    testName: 'Test Login',
                    codeChange: CodeChange.NEW,
                    organisationalPressure: 1,
                    implementationType: ImplementationType.CUSTOM,
                    isLegal: false,
                    userFrequency: 3,
                    businessImpact: 3,
                    affectedAreas: 2
                });
            });

            const testCaseId = result.current.appState.testCases[0].id;

            act(() => {
                result.current.duplicateTestCase(testCaseId);
            });

            expect(result.current.appState.testCases).toHaveLength(2);
            expect(result.current.appState.testCases[1].testName).toBe('Test Login (Copy)');
            expect(result.current.appState.testCases[1].id).not.toBe(testCaseId);
            expect(result.current.appState.testCases[1].userFrequency).toBe(3);
        });
    });

    describe('Existing Functionality Management', () => {
        it('should add existing functionality', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.addExistingFunctionality({
                    name: 'Login Component',
                    implementation: ImplementationType.LOOP_SAME,
                    status: FunctionalityStatus.STABLE,
                    source: DataSource.MANUAL
                });
            });

            expect(result.current.appState.existingFunctionality).toHaveLength(1);
            expect(result.current.appState.existingFunctionality[0].name).toBe('Login Component');
            expect(result.current.appState.existingFunctionality[0].id).toBeDefined();
        });

        it('should update existing functionality', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.addExistingFunctionality({
                    name: 'Login Component',
                    implementation: ImplementationType.LOOP_SAME,
                    status: FunctionalityStatus.STABLE,
                    source: DataSource.MANUAL
                });
            });

            const funcId = result.current.appState.existingFunctionality[0].id;

            act(() => {
                result.current.updateExistingFunctionality(funcId, {
                    status: FunctionalityStatus.UNSTABLE
                });
            });

            expect(result.current.appState.existingFunctionality[0].status).toBe(FunctionalityStatus.UNSTABLE);
        });

        it('should delete existing functionality', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.addExistingFunctionality({
                    name: 'Login Component',
                    implementation: ImplementationType.LOOP_SAME,
                    status: FunctionalityStatus.STABLE,
                    source: DataSource.MANUAL
                });
            });

            expect(result.current.appState.existingFunctionality).toHaveLength(1);
            const funcId = result.current.appState.existingFunctionality[0].id;

            act(() => {
                result.current.deleteExistingFunctionality(funcId);
            });

            expect(result.current.appState.existingFunctionality).toHaveLength(0);
        });
    });

    describe('Filter Management', () => {
        it('should set recommendation filter', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.setRecommendationFilter(Recommendation.AUTOMATE);
            });

            expect(result.current.filters.recommendation).toBe(Recommendation.AUTOMATE);
        });

        it('should set search term', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.setSearchTerm('login');
            });

            expect(result.current.filters.searchTerm).toBe('login');
        });

        it('should clear filters', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.setRecommendationFilter(Recommendation.AUTOMATE);
                result.current.setSearchTerm('login');
                result.current.setCodeChangeFilter(CodeChange.NEW);
            });

            expect(result.current.filters.recommendation).toBe(Recommendation.AUTOMATE);
            expect(result.current.filters.searchTerm).toBe('login');
            expect(result.current.filters.codeChange).toBe(CodeChange.NEW);

            act(() => {
                result.current.clearFilters();
            });

            expect(result.current.filters).toEqual({});
        });
    });

    describe('Sort Management', () => {
        it('should set sort config', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.setSortConfig({
                    column: 'testName',
                    direction: 'asc'
                });
            });

            expect(result.current.sortConfig).toEqual({
                column: 'testName',
                direction: 'asc'
            });
        });

        it('should toggle sort direction', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            // First click: set to ascending
            act(() => {
                result.current.toggleSort('testName');
            });

            expect(result.current.sortConfig).toEqual({
                column: 'testName',
                direction: 'asc'
            });

            // Second click: toggle to descending
            act(() => {
                result.current.toggleSort('testName');
            });

            expect(result.current.sortConfig).toEqual({
                column: 'testName',
                direction: 'desc'
            });

            // Third click: clear sort
            act(() => {
                result.current.toggleSort('testName');
            });

            expect(result.current.sortConfig).toBeNull();
        });
    });

    describe('State Management', () => {
        it('should import app state', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            const importedState = {
                version: '1.0.0',
                projectName: 'Imported Project',
                created: '2024-01-01T00:00:00.000Z',
                lastModified: '2024-01-01T00:00:00.000Z',
                existingFunctionality: [],
                testCases: [],
                metadata: { team: 'QA Team' }
            };

            act(() => {
                result.current.importAppState(importedState);
            });

            expect(result.current.appState.projectName).toBe('Imported Project');
            expect(result.current.appState.metadata.team).toBe('QA Team');
        });

        it('should export app state', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.addTestCase({
                    testName: 'Test Login',
                    codeChange: CodeChange.NEW,
                    organisationalPressure: 1,
                    implementationType: ImplementationType.CUSTOM,
                    isLegal: false,
                    userFrequency: 3,
                    businessImpact: 3,
                    affectedAreas: 2
                });
            });

            const exported = result.current.exportAppState();

            expect(exported.testCases).toHaveLength(1);
            expect(exported.testCases[0].testName).toBe('Test Login');
        });

        it('should clear all data', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.addTestCase({
                    testName: 'Test Login',
                    codeChange: CodeChange.NEW,
                    organisationalPressure: 1,
                    implementationType: ImplementationType.CUSTOM,
                    isLegal: false,
                    userFrequency: 3,
                    businessImpact: 3,
                    affectedAreas: 2
                });
                result.current.setRecommendationFilter(Recommendation.AUTOMATE);
            });

            expect(result.current.appState.testCases).toHaveLength(1);
            expect(result.current.filters.recommendation).toBe(Recommendation.AUTOMATE);

            act(() => {
                result.current.clearAllData();
            });

            expect(result.current.appState.testCases).toHaveLength(0);
            expect(result.current.filters).toEqual({});
        });

        it('should update metadata', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            act(() => {
                result.current.updateMetadata({
                    team: 'QA Team',
                    sprint: 'Sprint 1'
                });
            });

            expect(result.current.appState.metadata.team).toBe('QA Team');
            expect(result.current.appState.metadata.sprint).toBe('Sprint 1');
        });
    });

    describe('UI State Management', () => {
        it('should toggle help modal', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            expect(result.current.uiState.isHelpModalOpen).toBe(false);

            act(() => {
                result.current.setHelpModalOpen(true);
            });

            expect(result.current.uiState.isHelpModalOpen).toBe(true);
        });

        it('should show and clear notifications', () => {
            const { result } = renderHook(() => useAppContext(), {
                wrapper: AppProvider
            });

            expect(result.current.uiState.notification).toBeUndefined();

            act(() => {
                result.current.showNotification('Test saved', 'success');
            });

            expect(result.current.uiState.notification).toEqual({
                message: 'Test saved',
                type: 'success'
            });

            act(() => {
                result.current.clearNotification();
            });

            expect(result.current.uiState.notification).toBeUndefined();
        });
    });
});
