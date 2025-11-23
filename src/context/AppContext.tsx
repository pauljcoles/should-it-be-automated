/**
 * AppContext - Global state management for the Test Prioritisation Tool
 * Provides state and actions for managing test cases, existing functionality,
 * filters, and sorting.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
    AppState,
    TestCase,
    ExistingFunctionality,
    FilterState,
    SortConfig,
    StateDiagram
} from '../types/models';
import {
    CodeChange,
    ImplementationType,
    Recommendation,
    AppMode
} from '../types/models';
import { AngieScoreCalculator } from '../services/AngieScoreCalculator';
import { TeachingScoreCalculator } from '../services/TeachingScoreCalculator';
import { StorageService } from '../services/StorageService';

// ============================================================================
// Context Types
// ============================================================================

/**
 * User preferences persisted to localStorage
 */
interface UserPreferences {
    /** Whether to show the initial judgment (gut feel) column */
    showInitialJudgment: boolean;
    /** Application mode: normal (calculator) or teaching (with guidance) */
    appMode: import('../types/models').AppMode;
}

/**
 * UI-specific state not persisted to localStorage
 */
interface UIState {
    /** Whether help modal is open */
    isHelpModalOpen: boolean;
    /** Whether state diagram diff modal is open */
    isStateDiagramDiffModalOpen: boolean;
    /** Whether state diagram history modal is open */
    isStateDiagramHistoryModalOpen: boolean;
    /** Whether storage error modal is open */
    isStorageErrorModalOpen: boolean;
    /** Current notification message */
    notification?: {
        message: string;
        type: 'success' | 'error' | 'info';
    };
}

/**
 * Complete context state including persisted and UI state
 */
interface AppContextState {
    /** Persisted application state */
    appState: AppState;
    /** Current filter settings */
    filters: FilterState;
    /** Current sort configuration */
    sortConfig: SortConfig | null;
    /** UI-specific state */
    uiState: UIState;
    /** State diagram version history */
    stateDiagramHistory: StateDiagram[];
    /** User preferences */
    userPreferences: UserPreferences;
}

/**
 * Context actions for state updates
 */
interface AppContextActions {
    // Test Case Actions
    addTestCase: (testCase: Omit<TestCase, 'id' | 'scores' | 'recommendation'>) => void;
    updateTestCase: (id: string, updates: Partial<TestCase>) => void;
    deleteTestCase: (id: string) => void;
    duplicateTestCase: (id: string) => void;
    
    // Existing Functionality Actions
    addExistingFunctionality: (functionality: Omit<ExistingFunctionality, 'id'>) => void;
    updateExistingFunctionality: (id: string, updates: Partial<ExistingFunctionality>) => void;
    deleteExistingFunctionality: (id: string) => void;
    
    // Filter Actions
    setRecommendationFilter: (recommendation?: Recommendation) => void;
    setSearchTerm: (searchTerm: string) => void;
    setCodeChangeFilter: (codeChange?: CodeChange) => void;
    setImplementationTypeFilter: (implementationType?: ImplementationType) => void;
    setLegalFilter: (isLegal?: boolean) => void;
    clearFilters: () => void;
    
    // Sort Actions
    setSortConfig: (config: SortConfig | null) => void;
    toggleSort: (column: SortConfig['column']) => void;
    
    // State Management Actions
    importAppState: (state: AppState) => void;
    exportAppState: () => AppState;
    clearAllData: () => void;
    updateMetadata: (metadata: Partial<AppState['metadata']>) => void;
    
    // State Diagram Actions
    addStateDiagram: (diagram: StateDiagram) => void;
    
    // UI Actions
    setHelpModalOpen: (isOpen: boolean) => void;
    setStateDiagramDiffModalOpen: (isOpen: boolean) => void;
    setStateDiagramHistoryModalOpen: (isOpen: boolean) => void;
    setStorageErrorModalOpen: (isOpen: boolean) => void;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    clearNotification: () => void;
    
    // Preferences Actions
    setShowInitialJudgment: (show: boolean) => void;
    setAppMode: (mode: import('../types/models').AppMode) => void;
}

type AppContextValue = AppContextState & AppContextActions;

// ============================================================================
// Context Creation
// ============================================================================

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Create initial empty app state
 */
function createInitialAppState(): AppState {
    return {
        version: '1.0.0',
        projectName: 'Untitled Project',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        existingFunctionality: [],
        testCases: [],
        metadata: {}
    };
}

/**
 * Calculate scores and recommendation for a test case
 */
function calculateTestCaseScores(
    testCase: Omit<TestCase, 'id' | 'scores' | 'recommendation'> & { id?: string },
    mode: AppMode
): {
    scores: TestCase['scores'];
    recommendation: TestCase['recommendation'];
} {
    if (mode === AppMode.NORMAL) {
        // Use Angie Jones' exact model (0-80 scale)
        const angieResult = AngieScoreCalculator.calculateScores(testCase);
        
        return {
            scores: {
                // Store Angie's scores
                customerRisk: angieResult.scores.customerRisk,
                valueScore: angieResult.scores.valueScore,
                costScore: angieResult.scores.costScore,
                historyScore: angieResult.scores.historyScore,
                // Keep legacy fields for backward compatibility
                risk: 0,
                value: 0,
                history: 0,
                legal: 0,
                total: angieResult.scores.total
            },
            recommendation: angieResult.recommendation
        };
    } else {
        // Teaching mode - use Angie's model + Legal bonus (0-100 scale)
        const teachingResult = TeachingScoreCalculator.calculateScores(testCase);
        
        return {
            scores: {
                // Store Teaching mode scores
                customerRisk: teachingResult.scores.customerRisk,
                valueScore: teachingResult.scores.valueScore,
                costScore: teachingResult.scores.costScore,
                historyScore: teachingResult.scores.historyScore,
                legal: teachingResult.scores.legal,
                // Keep legacy fields for backward compatibility
                risk: 0,
                value: 0,
                history: 0,
                total: teachingResult.scores.total
            },
            recommendation: teachingResult.recommendation
        };
    }
}

// ============================================================================
// Provider Component
// ============================================================================

interface AppProviderProps {
    children: ReactNode;
    initialState?: Partial<AppState>;
}

export function AppProvider({ children, initialState }: AppProviderProps) {
    // Initialize state - load from localStorage if available
    const [appState, setAppState] = useState<AppState>(() => {
        // Try to load from localStorage first
        if (!initialState) {
            try {
                const loaded = StorageService.loadAppState();
                if (loaded) {
                    return loaded;
                }
            } catch (error) {
                console.error('Failed to load state from localStorage:', error);
            }
        }
        
        return {
            ...createInitialAppState(),
            ...initialState
        };
    });
    
    const [filters, setFilters] = useState<FilterState>({});
    const [sortConfig, setSortConfigState] = useState<SortConfig | null>(null);
    const [uiState, setUIState] = useState<UIState>({
        isHelpModalOpen: false,
        isStateDiagramDiffModalOpen: false,
        isStateDiagramHistoryModalOpen: false,
        isStorageErrorModalOpen: false
    });
    const [stateDiagramHistory, setStateDiagramHistory] = useState<StateDiagram[]>([]);
    const [storageAvailable, setStorageAvailable] = useState<boolean>(true);
    
    // Load user preferences from localStorage
    const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
        try {
            const saved = localStorage.getItem('test-prioritizer-preferences');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure appMode is set (for backward compatibility)
                return {
                    showInitialJudgment: parsed.showInitialJudgment ?? true,
                    appMode: parsed.appMode ?? AppMode.NORMAL
                };
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
        return { 
            showInitialJudgment: true,
            appMode: AppMode.NORMAL  // Default to Normal mode
        };
    });
    
    // Save preferences to localStorage when they change
    useEffect(() => {
        try {
            localStorage.setItem('test-prioritizer-preferences', JSON.stringify(userPreferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }, [userPreferences]);

    // ========================================================================
    // Persistence Effect
    // ========================================================================

    // Auto-save to localStorage when state changes
    useEffect(() => {
        if (!storageAvailable) return;

        try {
            StorageService.saveAppState(appState);
        } catch (error) {
            console.error('Failed to save state:', error);
            
            // Check if it's a quota error
            if (error instanceof Error) {
                if (error.message.includes('Storage limit reached')) {
                    setUIState(prev => ({
                        ...prev,
                        isStorageErrorModalOpen: true,
                        notification: {
                            message: 'Storage limit reached. Please export and clear old data.',
                            type: 'error'
                        }
                    }));
                } else if (error.message.includes('Local storage unavailable')) {
                    setStorageAvailable(false);
                    setUIState(prev => ({
                        ...prev,
                        notification: {
                            message: 'Local storage unavailable. Changes will not be saved.',
                            type: 'error'
                        }
                    }));
                }
            }
        }
    }, [appState, storageAvailable]);

    // Check storage availability on mount
    useEffect(() => {
        const available = StorageService.isAvailable();
        setStorageAvailable(available);
        
        if (!available) {
            setUIState(prev => ({
                ...prev,
                notification: {
                    message: 'Local storage is not available. Your changes will not be saved.',
                    type: 'error'
                }
            }));
        }
    }, []);
    
    // ========================================================================
    // Test Case Actions
    // ========================================================================
    
    const addTestCase = useCallback((testCase: Omit<TestCase, 'id' | 'scores' | 'recommendation'>) => {
        const id = generateUUID();
        const { scores, recommendation } = calculateTestCaseScores(testCase, userPreferences.appMode);
        
        const newTestCase: TestCase = {
            ...testCase,
            id,
            scores,
            recommendation
        };
        
        setAppState(prev => ({
            ...prev,
            testCases: [...prev.testCases, newTestCase],
            lastModified: new Date().toISOString()
        }));
    }, [userPreferences.appMode]);
    
    const updateTestCase = useCallback((id: string, updates: Partial<TestCase>) => {
        setAppState(prev => {
            const testCases = prev.testCases.map(tc => {
                if (tc.id !== id) return tc;
                
                // Merge updates
                const updated = { ...tc, ...updates };
                
                // Determine which fields trigger recalculation based on mode
                // Both modes now use Angie's 7-field model
                const angieFields = [
                    'impact', 'probOfUse', 'distinctness', 'fixProbability',
                    'easyToWrite', 'quickToWrite', 'similarity', 'breakFreq',
                    'isLegal', 'organisationalPressure'
                ];
                
                // Both modes use the same fields now
                const shouldRecalculate = angieFields.some(field => updates[field as keyof TestCase] !== undefined);
                
                // Recalculate scores if relevant fields changed
                if (shouldRecalculate) {
                    const { scores, recommendation } = calculateTestCaseScores(updated, userPreferences.appMode);
                    updated.scores = scores;
                    updated.recommendation = recommendation;
                }
                
                return updated;
            });
            
            return {
                ...prev,
                testCases,
                lastModified: new Date().toISOString()
            };
        });
    }, [userPreferences.appMode]);
    
    const deleteTestCase = useCallback((id: string) => {
        setAppState(prev => ({
            ...prev,
            testCases: prev.testCases.filter(tc => tc.id !== id),
            lastModified: new Date().toISOString()
        }));
    }, []);
    
    const duplicateTestCase = useCallback((id: string) => {
        setAppState(prev => {
            const original = prev.testCases.find(tc => tc.id === id);
            if (!original) return prev;
            
            const duplicate: TestCase = {
                ...original,
                id: generateUUID(),
                testName: `${original.testName} (Copy)`
            };
            
            return {
                ...prev,
                testCases: [...prev.testCases, duplicate],
                lastModified: new Date().toISOString()
            };
        });
    }, []);
    
    // ========================================================================
    // Existing Functionality Actions
    // ========================================================================
    
    const addExistingFunctionality = useCallback((functionality: Omit<ExistingFunctionality, 'id'>) => {
        const id = generateUUID();
        const newFunctionality: ExistingFunctionality = {
            ...functionality,
            id
        };
        
        setAppState(prev => ({
            ...prev,
            existingFunctionality: [...prev.existingFunctionality, newFunctionality],
            lastModified: new Date().toISOString()
        }));
    }, []);
    
    const updateExistingFunctionality = useCallback((id: string, updates: Partial<ExistingFunctionality>) => {
        setAppState(prev => ({
            ...prev,
            existingFunctionality: prev.existingFunctionality.map(ef =>
                ef.id === id ? { ...ef, ...updates } : ef
            ),
            lastModified: new Date().toISOString()
        }));
    }, []);
    
    const deleteExistingFunctionality = useCallback((id: string) => {
        setAppState(prev => ({
            ...prev,
            existingFunctionality: prev.existingFunctionality.filter(ef => ef.id !== id),
            lastModified: new Date().toISOString()
        }));
    }, []);
    
    // ========================================================================
    // Filter Actions
    // ========================================================================
    
    const setRecommendationFilter = useCallback((recommendation?: Recommendation) => {
        setFilters(prev => ({ ...prev, recommendation }));
    }, []);
    
    const setSearchTerm = useCallback((searchTerm: string) => {
        setFilters(prev => ({ ...prev, searchTerm: searchTerm || undefined }));
    }, []);
    
    const setCodeChangeFilter = useCallback((codeChange?: CodeChange) => {
        setFilters(prev => ({ ...prev, codeChange }));
    }, []);
    
    const setImplementationTypeFilter = useCallback((implementationType?: ImplementationType) => {
        setFilters(prev => ({ ...prev, implementationType }));
    }, []);
    
    const setLegalFilter = useCallback((isLegal?: boolean) => {
        setFilters(prev => ({ ...prev, isLegal }));
    }, []);
    
    const clearFilters = useCallback(() => {
        setFilters({});
    }, []);
    
    // ========================================================================
    // Sort Actions
    // ========================================================================
    
    const setSortConfig = useCallback((config: SortConfig | null) => {
        setSortConfigState(config);
    }, []);
    
    const toggleSort = useCallback((column: SortConfig['column']) => {
        setSortConfigState(prev => {
            if (!prev || prev.column !== column) {
                return { column, direction: 'asc' };
            }
            if (prev.direction === 'asc') {
                return { column, direction: 'desc' };
            }
            return null; // Clear sort
        });
    }, []);
    
    // ========================================================================
    // State Management Actions
    // ========================================================================
    
    const importAppState = useCallback((state: AppState) => {
        setAppState({
            ...state,
            lastModified: new Date().toISOString()
        });
    }, []);
    
    const exportAppState = useCallback((): AppState => {
        return appState;
    }, [appState]);
    
    const clearAllData = useCallback(() => {
        setAppState(createInitialAppState());
        setFilters({});
        setSortConfigState(null);
        setStateDiagramHistory([]);
    }, []);
    
    const updateMetadata = useCallback((metadata: Partial<AppState['metadata']>) => {
        setAppState(prev => ({
            ...prev,
            metadata: { ...prev.metadata, ...metadata },
            lastModified: new Date().toISOString()
        }));
    }, []);
    
    // ========================================================================
    // State Diagram Actions
    // ========================================================================
    
    const addStateDiagram = useCallback((diagram: StateDiagram) => {
        setStateDiagramHistory(prev => [...prev, diagram]);
    }, []);
    
    // ========================================================================
    // UI Actions
    // ========================================================================
    
    const setHelpModalOpen = useCallback((isOpen: boolean) => {
        setUIState(prev => ({ ...prev, isHelpModalOpen: isOpen }));
    }, []);
    
    const setStateDiagramDiffModalOpen = useCallback((isOpen: boolean) => {
        setUIState(prev => ({ ...prev, isStateDiagramDiffModalOpen: isOpen }));
    }, []);
    
    const setStateDiagramHistoryModalOpen = useCallback((isOpen: boolean) => {
        setUIState(prev => ({ ...prev, isStateDiagramHistoryModalOpen: isOpen }));
    }, []);
    
    const setStorageErrorModalOpen = useCallback((isOpen: boolean) => {
        setUIState(prev => ({ ...prev, isStorageErrorModalOpen: isOpen }));
    }, []);
    
    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        setUIState(prev => ({ ...prev, notification: { message, type } }));
    }, []);
    
    const clearNotification = useCallback(() => {
        setUIState(prev => ({ ...prev, notification: undefined }));
    }, []);
    
    // ========================================================================
    // Preferences Actions
    // ========================================================================
    
    const setShowInitialJudgment = useCallback((show: boolean) => {
        setUserPreferences(prev => ({ ...prev, showInitialJudgment: show }));
    }, []);
    
    const setAppMode = useCallback((mode: AppMode) => {
        setUserPreferences(prev => ({ ...prev, appMode: mode }));
        
        // Recalculate all test case scores with the new mode
        setAppState(prev => ({
            ...prev,
            testCases: prev.testCases.map(tc => {
                const { scores, recommendation } = calculateTestCaseScores(tc, mode);
                return {
                    ...tc,
                    scores,
                    recommendation
                };
            }),
            lastModified: new Date().toISOString()
        }));
    }, []);
    
    // ========================================================================
    // Context Value
    // ========================================================================
    
    const value: AppContextValue = {
        // State
        appState,
        filters,
        sortConfig,
        uiState,
        stateDiagramHistory,
        userPreferences,
        
        // Test Case Actions
        addTestCase,
        updateTestCase,
        deleteTestCase,
        duplicateTestCase,
        
        // Existing Functionality Actions
        addExistingFunctionality,
        updateExistingFunctionality,
        deleteExistingFunctionality,
        
        // Filter Actions
        setRecommendationFilter,
        setSearchTerm,
        setCodeChangeFilter,
        setImplementationTypeFilter,
        setLegalFilter,
        clearFilters,
        
        // Sort Actions
        setSortConfig,
        toggleSort,
        
        // State Management Actions
        importAppState,
        exportAppState,
        clearAllData,
        updateMetadata,
        
        // State Diagram Actions
        addStateDiagram,
        
        // UI Actions
        setHelpModalOpen,
        setStateDiagramDiffModalOpen,
        setStateDiagramHistoryModalOpen,
        setStorageErrorModalOpen,
        showNotification,
        clearNotification,
        
        // Preferences Actions
        setShowInitialJudgment,
        setAppMode
    };
    
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access the AppContext
 * @throws Error if used outside of AppProvider
 */
export function useAppContext(): AppContextValue {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}

// Export context for testing purposes
export { AppContext };
