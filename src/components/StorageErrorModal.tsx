/**
 * StorageErrorModal Component
 * 
 * Displays a modal when storage quota is exceeded with options to clear data
 */

import { useState } from 'react';
import { useAppContext } from '../context';
import { StorageService } from '../services/StorageService';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';

interface StorageErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StorageErrorModal({ isOpen, onClose }: StorageErrorModalProps) {
  const { exportAppState, clearAllData, showNotification } = useAppContext();
  const [isClearing, setIsClearing] = useState(false);

  if (!isOpen) return null;

  const handleExportBeforeClear = () => {
    try {
      const state = exportAppState();
      const json = JSON.stringify(state, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
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
      
      showNotification('Data exported successfully. You can now clear old data.', 'success');
    } catch (error) {
      showNotification(
        `Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  };

  const handleClearStateDiagrams = () => {
    if (!confirm('This will clear all state diagram history. Are you sure?')) {
      return;
    }

    try {
      setIsClearing(true);
      
      // Get all state diagram keys and remove them
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('test-prioritizer-states-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      showNotification('State diagram history cleared', 'success');
      onClose();
    } catch (error) {
      showNotification(
        `Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAllData = () => {
    if (!confirm('This will clear ALL data including test cases. Make sure you have exported your data first. Are you sure?')) {
      return;
    }

    try {
      setIsClearing(true);
      clearAllData();
      StorageService.clearAllData();
      showNotification('All data cleared', 'success');
      onClose();
    } catch (error) {
      showNotification(
        `Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsClearing(false);
    }
  };

  const storageInfo = StorageService.getStorageInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full bg-card border shadow-lg">
        <CardHeader className="border-b bg-red-100">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <CardTitle className="text-2xl font-semibold">
              Storage Limit Reached
            </CardTitle>
          </div>
        </CardHeader>

        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 border rounded-lg p-4">
            <p className="text-sm font-medium">
              Your browser's local storage is full. To continue saving changes, you need to free up space by clearing old data.
            </p>
          </div>

          <div className="bg-muted border rounded-lg p-4">
            <h3 className="font-medium mb-2">Current Storage Usage:</h3>
            <ul className="text-sm space-y-1">
              <li>• Total keys: {storageInfo.totalKeys}</li>
              <li>• State diagrams: {storageInfo.stateDiagramCount}</li>
              <li>• Estimated size: {Math.round(storageInfo.estimatedTotalSize / 1024)} KB</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-lg">What would you like to do?</h3>

            <Button
              onClick={handleExportBeforeClear}
              className="w-full gap-2"
              disabled={isClearing}
            >
              <Download className="w-4 h-4" />
              Export Current Data First
            </Button>

            <Button
              onClick={handleClearStateDiagrams}
              className="w-full gap-2"
              variant="secondary"
              disabled={isClearing}
            >
              <Trash2 className="w-4 h-4" />
              Clear State Diagram History Only
            </Button>

            <Button
              onClick={handleClearAllData}
              className="w-full gap-2"
              variant="destructive"
              disabled={isClearing}
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data (Export First!)
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              disabled={isClearing}
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>Tip: Export your data regularly to avoid losing work.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
