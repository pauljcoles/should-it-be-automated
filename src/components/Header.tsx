/**
 * Header Component - Neo-Brutalist Edition
 * Top navigation bar with upload, download, add row, and help buttons
 */

import { useRef, useState } from 'react';
import { useAppContext } from '../context';
import type { AppState, StateDiagram, StateDiff } from '../types/models';
import { Button } from './ui/button';
import { Upload, Download, Plus, HelpCircle, Clipboard, History, Eye, EyeOff } from 'lucide-react';
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
    setShowInitialJudgment
  } = useAppContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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
    addTestCase({
      testName: '',
      changeType: 'new',
      easyToAutomate: 3,
      quickToAutomate: 3,
      isLegal: false,
      userFrequency: 3,
      businessImpact: 3,
      affectedAreas: 2,
      notes: ''
    });
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
        className={`bg-yellow-400 border-b-4 border-black ${isDragging ? 'bg-yellow-300' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Responsive padding: smaller on mobile, larger on desktop */}
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 lg:py-4">
          {/* Responsive flex: column on mobile, row on desktop */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0">
            {/* Title */}
            <div className="w-full lg:w-auto">
              {/* Responsive text size */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-black">
                Test Prioritisation Tool
              </h1>
              <p className="text-xs sm:text-sm font-bold text-black mt-1">
                {appState.projectName} • {appState.testCases.length} test case{appState.testCases.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Action Buttons - Responsive layout */}
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
              {/* Upload Button - Icon only on mobile */}
              <Button
                onClick={handleUploadClick}
                variant="outline"
                className="gap-2"
                size="sm"
                title="Upload JSON file (or drag and drop)"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">UPLOAD</span>
              </Button>

              {/* Download Button - Icon only on mobile */}
              <Button
                onClick={handleDownload}
                variant="outline"
                className="gap-2"
                size="sm"
                title="Download as JSON"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">DOWNLOAD</span>
              </Button>

              {/* Paste Scenario Button - Hidden on mobile */}
              <Button
                onClick={handlePasteFromBERT}
                variant="outline"
                className="gap-2 bg-blue-400 hover:bg-blue-300 hidden md:flex"
                size="sm"
                title="Paste test scenario from external tool"
              >
                <Clipboard className="w-4 h-4" />
                <span className="hidden lg:inline">PASTE SCENARIO</span>
                <span className="lg:hidden">PASTE</span>
              </Button>

              {/* View History Button - Hidden on mobile */}
              <Button
                onClick={handleViewHistory}
                variant="outline"
                className="gap-2 bg-purple-400 hover:bg-purple-300 hidden md:flex"
                size="sm"
                title="View state diagram version history"
              >
                <History className="w-4 h-4" />
                <span className="hidden lg:inline">HISTORY</span>
              </Button>

              {/* Add Row Button */}
              <Button
                onClick={handleAddRow}
                className="gap-2 bg-green-400 hover:bg-green-300"
                size="sm"
                title="Add new test case"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">ADD ROW</span>
              </Button>

              {/* Toggle Gut Feel Column Button - Hidden on mobile */}
              <Button
                onClick={() => setShowInitialJudgment(!userPreferences.showInitialJudgment)}
                variant="outline"
                className="gap-2 hidden md:flex"
                size="sm"
                title={userPreferences.showInitialJudgment ? "Hide Gut Feel column" : "Show Gut Feel column"}
              >
                {userPreferences.showInitialJudgment ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span className="hidden lg:inline">
                  {userPreferences.showInitialJudgment ? 'HIDE' : 'SHOW'} GUT FEEL
                </span>
              </Button>

              {/* Help Button */}
              <Button
                onClick={handleHelp}
                variant="secondary"
                size="icon"
                title="Help and documentation"
              >
                <HelpCircle className="w-4 sm:w-5 sm:h-5 h-4" />
              </Button>
            </div>
          </div>

          {/* Drag and drop overlay hint */}
          {isDragging && (
            <div className="absolute inset-0 bg-yellow-300 bg-opacity-95 flex items-center justify-center pointer-events-none border-4 border-black">
              <div className="text-center border-brutal-thick bg-white p-4 sm:p-8 shadow-brutal-xl">
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-black mb-4" />
                <p className="text-xl sm:text-2xl font-black text-black uppercase">Drop JSON File</p>
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
