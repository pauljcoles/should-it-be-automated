/**
 * StateDiagramDiffModal Component
 * 
 * Displays a visual diff between two state diagram versions before import.
 * Shows summary counts and detailed changes with color coding.
 */

import { useAppContext } from '../context';
import type { StateDiff, StateDiagram } from '../types/models';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, Plus, Minus, Edit, CheckCircle } from 'lucide-react';

interface StateDiagramDiffModalProps {
  /** The diff result to display */
  diff: StateDiff;
  /** The current (new) state diagram */
  currentDiagram: StateDiagram;
  /** Callback when user confirms import */
  onConfirm: () => void;
  /** Callback when user cancels import */
  onCancel: () => void;
}

export function StateDiagramDiffModal({
  diff,
  currentDiagram,
  onConfirm,
  onCancel
}: StateDiagramDiffModalProps) {
  const { uiState } = useAppContext();

  if (!uiState.isStateDiagramDiffModalOpen) {
    return null;
  }

  // Calculate summary counts
  const totalChanges = diff.added.length + diff.removed.length + diff.modified.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>State Diagram Changes</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm font-medium mt-2">
            {currentDiagram.applicationName} • {totalChanges} change{totalChanges !== 1 ? 's' : ''} detected
          </p>
        </CardHeader>

        {/* Diff Summary */}
        <div className="p-6 border-b bg-muted">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            {/* Added States */}
            <div className="border rounded-lg bg-green-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-5 h-5 text-green-700" />
                <span className="font-semibold text-2xl text-green-700">
                  {diff.added.length}
                </span>
              </div>
              <p className="text-sm font-medium text-green-900">Added</p>
            </div>

            {/* Modified States */}
            <div className="border rounded-lg bg-yellow-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Edit className="w-5 h-5 text-yellow-700" />
                <span className="font-semibold text-2xl text-yellow-700">
                  {diff.modified.length}
                </span>
              </div>
              <p className="text-sm font-medium text-yellow-900">Modified</p>
            </div>

            {/* Removed States */}
            <div className="border rounded-lg bg-red-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Minus className="w-5 h-5 text-red-700" />
                <span className="font-semibold text-2xl text-red-700">
                  {diff.removed.length}
                </span>
              </div>
              <p className="text-sm font-medium text-red-900">Removed</p>
            </div>

            {/* Unchanged States */}
            <div className="border rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold text-2xl text-muted-foreground">
                  {diff.unchanged.length}
                </span>
              </div>
              <p className="text-sm font-medium">Unchanged</p>
            </div>
          </div>
        </div>

        {/* Changes List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Changes</h3>

          {totalChanges === 0 ? (
            <div className="border rounded-lg bg-muted p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium text-muted-foreground">No changes detected</p>
              <p className="text-sm text-muted-foreground mt-2">
                This state diagram is identical to the previous version
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Added States */}
              {diff.added.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Added States ({diff.added.length})
                  </h4>
                  <div className="space-y-2">
                    {diff.added.map(stateId => {
                      const state = currentDiagram.states[stateId];
                      return (
                        <div
                          key={stateId}
                          className="border rounded-lg bg-green-50 p-4 border-l-4 border-l-green-500"
                        >
                          <p className="font-medium text-green-900">{stateId}</p>
                          {state.description && (
                            <p className="text-sm text-green-800 mt-1">{state.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-green-700">
                            <span>Actions: {state.actions.length}</span>
                            <span>Transitions: {Object.keys(state.transitions).length}</span>
                            {state.implementation && (
                              <span className="font-medium">{state.implementation}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modified States */}
              {diff.modified.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Modified States ({diff.modified.length})
                  </h4>
                  <div className="space-y-2">
                    {diff.modified.map(modification => {
                      const state = currentDiagram.states[modification.stateId];
                      const changes = modification.changes;
                      return (
                        <div
                          key={modification.stateId}
                          className="border rounded-lg bg-yellow-50 p-4 border-l-4 border-l-yellow-500"
                        >
                          <p className="font-medium text-yellow-900">{modification.stateId}</p>
                          {state.description && (
                            <p className="text-sm text-yellow-800 mt-1">{state.description}</p>
                          )}
                          <div className="mt-2 space-y-1 text-sm text-yellow-800">
                            {changes.implementation && (
                              <p>
                                • Implementation: <span className="line-through">{changes.implementation.old}</span> → <span className="font-medium">{changes.implementation.new}</span>
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
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <Minus className="w-4 h-4" />
                    Removed States ({diff.removed.length})
                  </h4>
                  <div className="space-y-2">
                    {diff.removed.map(stateId => (
                      <div
                        key={stateId}
                        className="border rounded-lg bg-red-50 p-4 border-l-4 border-l-red-500"
                      >
                        <p className="font-medium text-red-900 line-through">{stateId}</p>
                        <p className="text-sm text-red-700 mt-1">
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

        {/* Import Controls */}
        <div className="border-t p-6 bg-muted">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">
                {diff.added.length + diff.modified.length} test case{diff.added.length + diff.modified.length !== 1 ? 's' : ''} will be generated
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Existing functionality list will be updated with all states
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
              >
                Import Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
