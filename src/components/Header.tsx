/**
 * Header Component - Neo-Brutalist Edition
 * Top navigation bar with upload, download, add row, and help buttons
 */

import { useRef, useState } from 'react';
import { useAppContext } from '../context';
import type { AppState, StateDiagram, StateDiff } from '../types/models';
import { Button } from './ui/button';
import { Upload, Download, Plus, HelpCircle, Clipboard, History, Filter, BarChart3, PanelLeftClose, PanelLeftOpen, Menu, X } from 'lucide-react';
import { StateDiagramService } from '../services/StateDiagramService';
import { StorageService } from '../services/StorageService';
import { BERTIntegrationService } from '../services/BERTIntegrationService';
import { StateDiagramDiffModal } from './StateDiagramDiffModal';

export function Header() {
  const {
    addTestCase,
    importAppState,
    exportAppState,
    setHelpModalOpen,
    showNotification,
    appState,
    addStateDiagram,
    setStateDiagramDiffModalOpen,
    setStateDiagramHistoryModalOpen,
    addExistingFunctionality,
    userPreferences,
    uiState,
    setFiltersOpen,
    setSummaryStatsOpen,
    setSidebarOpen
  } = useAppContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingStateDiagram, setPendingStateDiagram] = useState<{
    diagram: StateDiagram;
    diff: StateDiff;
  } | null>(null);

  // ========================================================================
  // Upload Handlers
  // ========================================================================

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);
        
        // Detect format type
        if (isAppState(json)) {
          importAppState(json);
          showNotification('Test cases imported successfully', 'success');
        } else if (isStateDiagram(json)) {
          handleStateDiagramUpload(content);
        } else {
          showNotification('Unknown JSON format', 'error');
        }
      } catch (error) {
        showNotification(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    };
    
    reader.onerror = () => {
      showNotification('Failed to read file', 'error');
    };
    
    reader.readAsText(file);
  };

  // ========================================================================
  // State Diagram Upload Handler
  // ========================================================================

  const handleStateDiagramUpload = (jsonContent: string) => {
    try {
      // Parse the state diagram
      const diagram = StateDiagramService.parseStateDiagram(jsonContent);
      
      // Validate the state diagram
      const validation = StateDiagramService.validateStateDiagram(diagram);
      
      // Show validation errors if any
      const errors = validation.warnings.filter(w => w.level === 'error');
      if (errors.length > 0) {
        showNotification(`Invalid state diagram: ${errors[0].message}`, 'error');
        return;
      }
      
      // Show validation warnings if any
      const warnings = validation.warnings.filter(w => w.level === 'warning');
      if (warnings.length > 0) {
        console.warn('State diagram validation warnings:', warnings);
      }
      
      // Get the latest state diagram for this application (if exists)
      const previousDiagram = StorageService.getLatestStateDiagram(diagram.applicationName);
      
      if (previousDiagram) {
        // Calculate diff
        const diff = StateDiagramService.diffStateDiagrams(previousDiagram, diagram);
        
        // Store pending diagram and diff
        setPendingStateDiagram({ diagram, diff });
        
        // Show diff modal
        setStateDiagramDiffModalOpen(true);
      } else {
        // No previous version, treat all states as new
        const allStateIds = Object.keys(diagram.states);
        const diff: StateDiff = {
          added: allStateIds,
          removed: [],
          modified: [],
          unchanged: []
        };
        
        // Store pending diagram and diff
        setPendingStateDiagram({ diagram, diff });
        
        // Show diff modal
        setStateDiagramDiffModalOpen(true);
      }
    } catch (error) {
      showNotification(`Failed to process state diagram: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // ========================================================================
  // State Diagram Import Confirmation
  // ========================================================================

  const handleStateDiagramImportConfirm = () => {
    if (!pendingStateDiagram) return;
    
    try {
      const { diagram, diff } = pendingStateDiagram;
      
      // Generate test cases from the diff
      const testCases = StateDiagramService.generateTestCases(diff, diagram);
      
      // Add all generated test cases
      testCases.forEach(testCase => {
        addTestCase(testCase);
      });
      
      // Generate and add existing functionality entries
      const existingFunctionality = StateDiagramService.generateExistingFunctionality(diagram);
      existingFunctionality.forEach(entry => {
        addExistingFunctionality(entry);
      });
      
      // Save the state diagram to history
      StorageService.saveStateDiagram(diagram);
      addStateDiagram(diagram);
      
      // Close modal and clear pending state
      setStateDiagramDiffModalOpen(false);
      setPendingStateDiagram(null);
      
      // Show success notification
      showNotification(
        `Imported ${testCases.length} test case${testCases.length !== 1 ? 's' : ''} from state diagram`,
        'success'
      );
    } catch (error) {
      showNotification(`Failed to import state diagram: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleStateDiagramImportCancel = () => {
    setStateDiagramDiffModalOpen(false);
    setPendingStateDiagram(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      handleFileSelect(file);
    } else {
      showNotification('Please drop a JSON file', 'error');
    }
  };

  // ========================================================================
  // Download Handler
  // ========================================================================

  const handleDownload = () => {
    try {
      const state = exportAppState();
      const json = JSON.stringify(state, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Generate filename: test-prioritization-{projectName}-{date}.json
      const date = new Date().toISOString().split('T')[0];
      const projectName = state.projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const filename = `test-prioritization-${projectName}-${date}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showNotification('Test cases exported successfully', 'success');
    } catch (error) {
      showNotification(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // ========================================================================
  // Add Row Handler
  // ========================================================================

  const handleAddRow = () => {
    if (userPreferences.appMode === 'normal') {
      // Normal mode - Angie Jones fields (0-80 scale)
      addTestCase({
        testName: '',
        gutFeel: 3,
        impact: 3,
        probOfUse: 3,
        distinctness: 3,
        fixProbability: 3,
        easyToWrite: 3,
        quickToWrite: 3,
        similarity: 1,
        breakFreq: 1,
        // Still need these for compatibility
        codeChange: 'new',
        organisationalPressure: 1,
        isLegal: false,
        userFrequency: 3,
        businessImpact: 3,
        affectedAreas: 2,
        notes: ''
      });
    } else {
      // Teaching mode - Angie Jones fields + Legal + Org Pressure + Gut Feel (0-100 scale)
      addTestCase({
        testName: '',
        gutFeel: 3,
        impact: 3,
        probOfUse: 3,
        distinctness: 3,
        fixProbability: 3,
        easyToWrite: 3,
        quickToWrite: 3,
        similarity: 1,
        breakFreq: 1,
        isLegal: false,
        organisationalPressure: 1,
        // Still need these for compatibility
        codeChange: 'new',
        userFrequency: 3,
        businessImpact: 3,
        affectedAreas: 2,
        notes: ''
      });
    }
    showNotification('New test case added', 'success');
  };

  // ========================================================================
  // Help Handler
  // ========================================================================

  const handleHelp = () => {
    setHelpModalOpen(true);
  };

  // ========================================================================
  // History Handler
  // ========================================================================

  const handleViewHistory = () => {
    setStateDiagramHistoryModalOpen(true);
  };

  // ========================================================================
  // BERT Integration Handler
  // ========================================================================

  const handlePasteFromBERT = async () => {
    try {
      // Read from clipboard
      const clipboardText = await BERTIntegrationService.readFromClipboard();
      
      // Parse BERT JSON
      const parseResult = BERTIntegrationService.parseBERTJSON(clipboardText);
      
      if (!parseResult.success) {
        showNotification(parseResult.error || 'Failed to parse BERT data', 'error');
        return;
      }
      
      if (!parseResult.data) {
        showNotification('No BERT data found in clipboard', 'error');
        return;
      }
      
      // Map BERT fields to test case
      const testCase = BERTIntegrationService.mapBERTFieldsToTestCase(parseResult.data);
      
      // Add the test case
      addTestCase(testCase);
      
      showNotification('Test case created from BERT scenario', 'success');
    } catch (error) {
      showNotification(
        `Failed to paste scenario: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  };

  // ========================================================================
  // Type Guards
  // ========================================================================

  function isAppState(json: unknown): json is AppState {
    return (
      typeof json === 'object' &&
      json !== null &&
      'version' in json &&
      'testCases' in json &&
      'existingFunctionality' in json
    );
  }

  function isStateDiagram(json: unknown): json is StateDiagram {
    return (
      typeof json === 'object' &&
      json !== null &&
      'states' in json &&
      'applicationName' in json
    );
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <>
      <header
        className={`bg-slate-100 border-b border-slate-300 ${isDragging ? 'bg-slate-200' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Responsive padding: minimal on mobile, larger on desktop */}
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 lg:py-4">
          {/* Responsive flex: column on mobile, row on desktop */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 lg:gap-0">
            {/* Title */}
            <div className="w-full lg:w-auto">
              {/* Responsive text size - smaller on mobile */}
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-800">
                Test Prioritisation Tool
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
                <span className="hidden sm:inline">{appState.projectName} • </span>{appState.testCases.length} test case{appState.testCases.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Action Buttons - Responsive layout */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              {/* Mobile: Essential buttons + hamburger menu */}
              <div className="flex items-center gap-2 lg:hidden">
                {/* Sidebar Toggle Button */}
                <Button
                  onClick={() => setSidebarOpen(!uiState.isSidebarOpen)}
                  variant="outline"
                  size="sm"
                  title="Toggle existing functionality sidebar"
                >
                  {uiState.isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </Button>

                {/* Filter Toggle Button */}
                <Button
                  onClick={() => setFiltersOpen(!uiState.isFiltersOpen)}
                  variant="outline"
                  size="sm"
                  title="Toggle filters"
                >
                  <Filter className="w-4 h-4" />
                </Button>

                {/* Stats Toggle Button */}
                <Button
                  onClick={() => setSummaryStatsOpen(!uiState.isSummaryStatsOpen)}
                  variant="outline"
                  size="sm"
                  title="Toggle summary stats"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>

                {/* Add Row Button */}
                <Button
                  onClick={handleAddRow}
                  size="sm"
                  title="Add new test case"
                >
                  <Plus className="w-4 h-4" />
                </Button>

                {/* Help Button */}
                <Button
                  onClick={handleHelp}
                  variant="secondary"
                  size="sm"
                  title="Help and documentation"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>

                {/* Hamburger Menu */}
                <Button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  variant="outline"
                  size="sm"
                  title="More options"
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              </div>

              {/* Desktop: All buttons visible */}
              <div className="hidden lg:flex items-center gap-2">
                {/* Upload Button */}
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  className="gap-2"
                  size="sm"
                  title="Upload JSON file (or drag and drop)"
                >
                  <Upload className="w-4 h-4" />
                  UPLOAD
                </Button>

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="gap-2"
                  size="sm"
                  title="Download as JSON"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD
                </Button>

                {/* Paste Scenario Button */}
                <Button
                  onClick={handlePasteFromBERT}
                  variant="outline"
                  className="gap-2"
                  size="sm"
                  title="Paste test scenario from external tool"
                >
                  <Clipboard className="w-4 h-4" />
                  PASTE
                </Button>

                {/* View History Button */}
                <Button
                  onClick={handleViewHistory}
                  variant="outline"
                  className="gap-2"
                  size="sm"
                  title="View state diagram version history"
                >
                  <History className="w-4 h-4" />
                  HISTORY
                </Button>

                {/* Add Row Button */}
                <Button
                  onClick={handleAddRow}
                  className="gap-2"
                  size="sm"
                  title="Add new test case"
                >
                  <Plus className="w-4 h-4" />
                  ADD ROW
                </Button>

                {/* Help Button */}
                <Button
                  onClick={handleHelp}
                  variant="secondary"
                  size="sm"
                  title="Help and documentation"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-300 bg-white p-3">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    handleUploadClick();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="gap-2 justify-start w-full"
                  size="sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload JSON
                </Button>

                <Button
                  onClick={() => {
                    handleDownload();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="gap-2 justify-start w-full"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </Button>

                <Button
                  onClick={() => {
                    handlePasteFromBERT();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="gap-2 justify-start w-full"
                  size="sm"
                >
                  <Clipboard className="w-4 h-4" />
                  Paste Scenario
                </Button>

                <Button
                  onClick={() => {
                    handleViewHistory();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="gap-2 justify-start w-full"
                  size="sm"
                >
                  <History className="w-4 h-4" />
                  View History
                </Button>
              </div>
            </div>
          )}

          {/* Drag and drop overlay hint */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-50/95 flex items-center justify-center pointer-events-none border-2 border-blue-400">
              <div className="text-center border-2 border-blue-400 rounded-lg bg-white p-4 sm:p-8 shadow-lg">
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-blue-600 mb-4" />
                <p className="text-xl sm:text-2xl font-bold text-slate-800 uppercase">Drop JSON File</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </header>

      {/* State Diagram Diff Modal */}
      {pendingStateDiagram && (
        <StateDiagramDiffModal
          diff={pendingStateDiagram.diff}
          currentDiagram={pendingStateDiagram.diagram}
          onConfirm={handleStateDiagramImportConfirm}
          onCancel={handleStateDiagramImportCancel}
        />
      )}
    </>
  );
}
