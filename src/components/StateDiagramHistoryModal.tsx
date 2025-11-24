/**
 * StateDiagramHistoryModal Component
 * 
 * Displays a list of previous state diagram versions with timestamps.
 * Allows users to select two versions for comparison and shows the diff between them.
 */

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context';
import type { StateDiagram, StateDiff } from '../types/models';
import { StateDiagramService } from '../services/StateDiagramService';
import { StorageService } from '../services/StorageService';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, Clock, GitCompare, Plus, Minus, Edit, CheckCircle } from 'lucide-react';

interface StateDiagramHistoryModalProps {
  /** Application name to filter history */
  applicationName: string;
}

export function StateDiagramHistoryModal({ applicationName }: StateDiagramHistoryModalProps) {
  const { uiState, setStateDiagramHistoryModalOpen } = useAppContext();
  const [selectedVersion1, setSelectedVersion1] = useState<StateDiagram | null>(null);
  const [selectedVersion2, setSelectedVersion2] = useState<StateDiagram | null>(null);
  const [history, setHistory] = useState<StateDiagram[]>([]);

  // Load history from localStorage when modal opens or applicationName changes
  useEffect(() => {
    if (uiState.isStateDiagramHistoryModalOpen) {
      const loadedHistory = StorageService.loadStateDiagramHistory(applicationName);
      setHistory(loadedHistory);
    }
  }, [uiState.isStateDiagramHistoryModalOpen, applicationName]);

  // Filter history by application name and sort by timestamp
  const filteredHistory = useMemo(() => {
    return history.sort((a, b) => {
      const timeA = new Date(a.metadata.generated).getTime();
      const timeB = new Date(b.metadata.generated).getTime();
      return timeB - timeA; // Newest first
    });
  }, [history]);

  // Calculate diff when two versions are selected
  const diff = useMemo<StateDiff | null>(() => {
    if (!selectedVersion1 || !selectedVersion2) {
      return null;
    }
    
    // Ensure version1 is older than version2 for consistent diff direction
    const time1 = new Date(selectedVersion1.metadata.generated).getTime();
    const time2 = new Date(selectedVersion2.metadata.generated).getTime();
    
    if (time1 < time2) {
      return StateDiagramService.diffStateDiagrams(selectedVersion1, selectedVersion2);
    } else {
      return StateDiagramService.diffStateDiagrams(selectedVersion2, selectedVersion1);
    }
  }, [selectedVersion1, selectedVersion2]);

  if (!uiState.isStateDiagramHistoryModalOpen) {
    return null;
  }

  const handleClose = () => {
    setStateDiagramHistoryModalOpen(false);
    setSelectedVersion1(null);
    setSelectedVersion2(null);
  };

  const handleVersionSelect = (diagram: StateDiagram) => {
    if (!selectedVersion1) {
      setSelectedVersion1(diagram);
    } else if (!selectedVersion2) {
      // Don't allow selecting the same version twice
      if (diagram.metadata.generated !== selectedVersion1.metadata.generated) {
        setSelectedVersion2(diagram);
      }
    } else {
      // Reset and start over
      setSelectedVersion1(diagram);
      setSelectedVersion2(null);
    }
  };

  const handleClearSelection = () => {
    setSelectedVersion1(null);
    setSelectedVersion2(null);
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isVersionSelected = (diagram: StateDiagram) => {
    return (
      selectedVersion1?.metadata.generated === diagram.metadata.generated ||
      selectedVersion2?.metadata.generated === diagram.metadata.generated
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>State Diagram History</CardTitle>
              <p className="text-sm font-medium mt-1">{applicationName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel: Version List */}
          <div className="w-1/3 border-r overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Versions</h3>
              {(selectedVersion1 || selectedVersion2) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>

            {filteredHistory.length === 0 ? (
              <div className="border rounded-lg bg-muted p-6 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium text-muted-foreground">No History</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload state diagrams to see version history
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((diagram, index) => {
                  const isSelected = isVersionSelected(diagram);
                  const isVersion1 = selectedVersion1?.metadata.generated === diagram.metadata.generated;

                  return (
                    <button
                      key={diagram.metadata.generated}
                      onClick={() => handleVersionSelect(diagram)}
                      className={`w-full text-left border rounded-lg p-4 transition-colors ${
                        isSelected
                          ? isVersion1
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-green-100 border-green-500'
                          : 'bg-card hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {formatTimestamp(diagram.metadata.generated)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {Object.keys(diagram.states).length} state{Object.keys(diagram.states).length !== 1 ? 's' : ''}
                          </p>
                          {diagram.metadata.team && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Team: {diagram.metadata.team}
                            </p>
                          )}
                        </div>
                        {index === 0 && (
                          <span className="text-xs font-medium bg-purple-200 px-2 py-1 rounded">
                            Latest
                          </span>
                        )}
                        {isSelected && (
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            isVersion1 ? 'bg-blue-200' : 'bg-green-200'
                          }`}>
                            {isVersion1 ? 'V1' : 'V2'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedVersion1 && !selectedVersion2 && (
              <div className="mt-4 border rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                  <GitCompare className="w-4 h-4 inline mr-2" />
                  Select another version to compare
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: Comparison View */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedVersion1 && !selectedVersion2 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <GitCompare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="font-bold text-gray-600">Select Versions to Compare</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Click on two versions from the list to see their differences
                  </p>
                </div>
              </div>
            ) : !diff ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="font-bold text-gray-600">Select Second Version</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Choose another version to compare with the selected one
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {/* Comparison Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Comparison</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg bg-blue-50 p-4">
                      <p className="text-xs font-medium text-blue-900 mb-1">Version 1 (Older)</p>
                      <p className="text-sm font-medium">
                        {formatTimestamp(
                          new Date(selectedVersion1!.metadata.generated).getTime() <
                          new Date(selectedVersion2!.metadata.generated).getTime()
                            ? selectedVersion1!.metadata.generated
                            : selectedVersion2!.metadata.generated
                        )}
                      </p>
                    </div>
                    <div className="border rounded-lg bg-green-50 p-4">
                      <p className="text-xs font-medium text-green-900 mb-1">Version 2 (Newer)</p>
                      <p className="text-sm font-medium">
                        {formatTimestamp(
                          new Date(selectedVersion1!.metadata.generated).getTime() >
                          new Date(selectedVersion2!.metadata.generated).getTime()
                            ? selectedVersion1!.metadata.generated
                            : selectedVersion2!.metadata.generated
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diff Summary */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3">Summary</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="border rounded-lg bg-green-100 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Plus className="w-4 h-4 text-green-700" />
                        <span className="font-semibold text-xl text-green-700">
                          {diff.added.length}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-green-900">Added</p>
                    </div>

                    <div className="border rounded-lg bg-yellow-100 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Edit className="w-4 h-4 text-yellow-700" />
                        <span className="font-semibold text-xl text-yellow-700">
                          {diff.modified.length}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-yellow-900">Modified</p>
                    </div>

                    <div className="border rounded-lg bg-red-100 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Minus className="w-4 h-4 text-red-700" />
                        <span className="font-semibold text-xl text-red-700">
                          {diff.removed.length}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-red-900">Removed</p>
                    </div>

                    <div className="border rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-xl text-muted-foreground">
                          {diff.unchanged.length}
                        </span>
                      </div>
                      <p className="text-xs font-medium">Unchanged</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Changes */}
                <div>
                  <h4 className="text-md font-semibold mb-3">Detailed Changes</h4>

                  {diff.added.length === 0 && diff.modified.length === 0 && diff.removed.length === 0 ? (
                    <div className="border rounded-lg bg-muted p-8 text-center">
                      <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium text-muted-foreground">No changes detected</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        These versions are identical
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Added States */}
                      {diff.added.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-green-700 mb-2 flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" />
                            Added States ({diff.added.length})
                          </h5>
                          <div className="space-y-2">
                            {diff.added.map(stateId => {
                              // Get state from the newer version
                              const newerDiagram = new Date(selectedVersion1!.metadata.generated).getTime() >
                                new Date(selectedVersion2!.metadata.generated).getTime()
                                ? selectedVersion1!
                                : selectedVersion2!;
                              const state = newerDiagram.states[stateId];
                              
                              return (
                                <div
                                  key={stateId}
                                  className="border rounded-lg bg-green-50 p-3 border-l-4 border-l-green-500"
                                >
                                  <p className="font-medium text-green-900 text-sm">{stateId}</p>
                                  {state?.description && (
                                    <p className="text-xs text-green-800 mt-1">{state.description}</p>
                                  )}
                                  {state && (
                                    <div className="flex gap-3 mt-2 text-xs text-green-700">
                                      <span>Actions: {state.actions?.length || 0}</span>
                                      <span>Transitions: {Object.keys(state.transitions || {}).length}</span>
                                      {state.implementation && (
                                        <span className="font-bold uppercase">{state.implementation}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Modified States */}
                      {diff.modified.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2 text-sm">
                            <Edit className="w-4 h-4" />
                            Modified States ({diff.modified.length})
                          </h5>
                          <div className="space-y-2">
                            {diff.modified.map(modification => {
                              const newerDiagram = new Date(selectedVersion1!.metadata.generated).getTime() >
                                new Date(selectedVersion2!.metadata.generated).getTime()
                                ? selectedVersion1!
                                : selectedVersion2!;
                              const state = newerDiagram.states[modification.stateId];
                              const changes = modification.changes;
                              
                              return (
                                <div
                                  key={modification.stateId}
                                  className="border rounded-lg bg-yellow-50 p-3 border-l-4 border-l-yellow-500"
                                >
                                  <p className="font-medium text-yellow-900 text-sm">{modification.stateId}</p>
                                  {state?.description && (
                                    <p className="text-xs text-yellow-800 mt-1">{state.description}</p>
                                  )}
                                  <div className="mt-2 space-y-1 text-xs text-yellow-800">
                                    {changes.implementation && (
                                      <p>
                                        • Implementation: <span className="line-through">{changes.implementation.old}</span> → <span className="font-bold">{changes.implementation.new}</span>
                                      </p>
                                    )}
                                    {changes.actionsAdded && changes.actionsAdded.length > 0 && (
                                      <p>• Actions added: {changes.actionsAdded.join(', ')}</p>
                                    )}
                                    {changes.actionsRemoved && changes.actionsRemoved.length > 0 && (
                                      <p>• Actions removed: {changes.actionsRemoved.join(', ')}</p>
                                    )}
                                    {changes.transitionsAdded && Object.keys(changes.transitionsAdded).length > 0 && (
                                      <p>
                                        • Transitions added: {Object.entries(changes.transitionsAdded)
                                          .map(([action, target]) => `${action} → ${target}`)
                                          .join(', ')}
                                      </p>
                                    )}
                                    {changes.transitionsRemoved && Object.keys(changes.transitionsRemoved).length > 0 && (
                                      <p>
                                        • Transitions removed: {Object.entries(changes.transitionsRemoved)
                                          .map(([action, target]) => `${action} → ${target}`)
                                          .join(', ')}
                                      </p>
                                    )}
                                    {changes.lastModified && (
                                      <p className="text-xs">• Last modified: {changes.lastModified.new}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Removed States */}
                      {diff.removed.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-2 text-sm">
                            <Minus className="w-4 h-4" />
                            Removed States ({diff.removed.length})
                          </h5>
                          <div className="space-y-2">
                            {diff.removed.map(stateId => (
                              <div
                                key={stateId}
                                className="border rounded-lg bg-red-50 p-3 border-l-4 border-l-red-500"
                              >
                                <p className="font-medium text-red-900 line-through text-sm">{stateId}</p>
                                <p className="text-xs text-red-700 mt-1">
                                  This state was removed from the diagram
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-muted">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredHistory.length} version{filteredHistory.length !== 1 ? 's' : ''} available
            </p>
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
