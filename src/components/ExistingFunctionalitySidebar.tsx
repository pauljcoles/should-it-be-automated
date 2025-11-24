/**
 * ExistingFunctionalitySidebar Component - Neo-Brutalist Edition
 * Collapsible sidebar for managing existing functionality entries
 */

import { useState } from 'react';
import { useAppContext } from '../context';
import { ImplementationType, FunctionalityStatus, DataSource } from '../types/models';
import type { ExistingFunctionality } from '../types/models';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ChevronLeft, Plus, Edit2, Trash2, FileCode, Pencil } from 'lucide-react';

export function ExistingFunctionalitySidebar() {
  const {
    appState,
    addExistingFunctionality,
    updateExistingFunctionality,
    deleteExistingFunctionality,
    showNotification,
    uiState,
    setSidebarOpen
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state for adding/editing
  const [formData, setFormData] = useState<Omit<ExistingFunctionality, 'id'>>({
    name: '',
    implementation: ImplementationType.CUSTOM,
    status: FunctionalityStatus.STABLE,
    source: DataSource.MANUAL
  });

  // Filter Logic
  const filteredFunctionality = appState.existingFunctionality.filter(func =>
    func.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add/Edit Handlers
  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: '',
      implementation: ImplementationType.CUSTOM,
      status: FunctionalityStatus.STABLE,
      source: DataSource.MANUAL
    });
  };

  const handleStartEdit = (func: ExistingFunctionality) => {
    setEditingId(func.id);
    setIsAdding(false);
    setFormData({
      name: func.name,
      implementation: func.implementation,
      status: func.status,
      source: func.source,
      lastTested: func.lastTested,
      stateId: func.stateId
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showNotification('Name is required', 'error');
      return;
    }

    if (isAdding) {
      addExistingFunctionality(formData);
      showNotification('Functionality added', 'success');
    } else if (editingId) {
      updateExistingFunctionality(editingId, formData);
      showNotification('Functionality updated', 'success');
    }

    handleCancel();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      implementation: ImplementationType.CUSTOM,
      status: FunctionalityStatus.STABLE,
      source: DataSource.MANUAL
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      deleteExistingFunctionality(id);
      showNotification('Functionality deleted', 'success');
    }
  };

  // Source Badge
  const getSourceBadge = (source: DataSource) => {
    if (source === DataSource.STATE_DIAGRAM) {
      return (
        <Badge variant="secondary" className="gap-1">
          <FileCode className="w-3 h-3" />
          State Diagram
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Pencil className="w-3 h-3" />
        Manual
      </Badge>
    );
  };

  // Status Badge
  const getStatusBadge = (status: FunctionalityStatus) => {
    const variants = {
      [FunctionalityStatus.STABLE]: 'success' as const,
      [FunctionalityStatus.UNSTABLE]: 'default' as const,
      [FunctionalityStatus.DEPRECATED]: 'destructive' as const
    };

    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  // Implementation Type Label
  const getImplementationLabel = (impl: ImplementationType) => {
    const labels = {
      [ImplementationType.LOOP_SAME]: 'Standard Components',
      [ImplementationType.LOOP_DIFFERENT]: 'New Pattern',
      [ImplementationType.CUSTOM]: 'Custom Implementation',
      [ImplementationType.MIX]: 'Hybrid'
    };
    return labels[impl];
  };

  // On mobile, hide completely when closed
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  if (!uiState.isSidebarOpen && isMobile) {
    return null;
  }

  return (
    <aside
      className={`bg-muted border-r flex flex-col transition-all duration-300 ${
        uiState.isSidebarOpen ? 'w-full lg:w-80' : 'hidden lg:flex lg:w-16'
      }`}
      style={{ minWidth: uiState.isSidebarOpen ? undefined : '64px' }}
    >
      {/* Header - Always visible */}
      <div className={`flex items-center border-b bg-background min-h-[60px] ${uiState.isSidebarOpen ? 'justify-between p-4' : 'justify-center p-2'}`}>
        {uiState.isSidebarOpen && (
          <h2 className="text-xl font-semibold text-foreground uppercase whitespace-nowrap">
            Existing
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!uiState.isSidebarOpen)}
          title={uiState.isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="flex-shrink-0 min-w-[40px] min-h-[40px]"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${uiState.isSidebarOpen ? '' : 'rotate-180'}`} />
        </Button>
      </div>

      {/* Content (hidden when collapsed) */}
      {uiState.isSidebarOpen && (
        <>
          {/* Search Box */}
          <div className="p-4 border-b bg-background">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
            />
      </div>

      {/* Add Button */}
      {!isAdding && !editingId && (
        <div className="p-4 border-b bg-background">
              <Button
                onClick={handleStartAdd}
                className="w-full gap-2"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                ADD FUNCTIONALITY
          </Button>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="p-4 border-b bg-muted">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase">
                {isAdding ? 'Add New' : 'Edit'}
              </h3>
              
              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1 uppercase">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Functionality name"
                  />
                </div>

                {/* Implementation Type */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1 uppercase">
                    Implementation
                  </label>
                  <select
                    value={formData.implementation}
                    onChange={(e) => setFormData({ ...formData, implementation: e.target.value as ImplementationType })}
                    className="w-full h-10 border rounded-md bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value={ImplementationType.LOOP_SAME}>Standard Components</option>
                    <option value={ImplementationType.LOOP_DIFFERENT}>New Pattern</option>
                    <option value={ImplementationType.CUSTOM}>Custom Implementation</option>
                    <option value={ImplementationType.MIX}>Hybrid</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1 uppercase">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FunctionalityStatus })}
                    className="w-full h-10 border rounded-md bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value={FunctionalityStatus.STABLE}>Stable</option>
                    <option value={FunctionalityStatus.UNSTABLE}>Unstable</option>
                    <option value={FunctionalityStatus.DEPRECATED}>Deprecated</option>
                  </select>
                </div>

                {/* Last Tested */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1 uppercase">
                    Last Tested
                  </label>
                  <Input
                    type="date"
                    value={formData.lastTested || ''}
                    onChange={(e) => setFormData({ ...formData, lastTested: e.target.value || undefined })}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSave}
                    className="flex-1"
                  >
                    SAVE
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    CANCEL
                  </Button>
            </div>
          </div>
        </div>
      )}

      {/* Functionality List */}
      <div className="flex-1 overflow-y-auto bg-background">
            {filteredFunctionality.length === 0 ? (
              <div className="p-4 text-center">
                <div className="border rounded-md bg-muted p-6 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground uppercase">
                    {searchTerm ? 'No matches found' : 'No functionality yet'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredFunctionality.map((func) => (
                  <div
                    key={func.id}
                    className="border rounded-md bg-card p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Name and Source Badge */}
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="text-sm font-semibold text-foreground flex-1">
                        {func.name}
                      </h3>
                      {getSourceBadge(func.source)}
                    </div>

                    {/* Implementation and Status */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {getImplementationLabel(func.implementation)}
                      </span>
                      {getStatusBadge(func.status)}
                    </div>

                    {/* Last Tested */}
                    {func.lastTested && (
                      <div className="text-xs font-medium text-muted-foreground mb-3 uppercase">
                        Tested: {new Date(func.lastTested).toLocaleDateString()}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStartEdit(func)}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        disabled={isAdding || editingId !== null}
                      >
                        <Edit2 className="w-3 h-3" />
                        EDIT
                      </Button>
                      <Button
                        onClick={() => handleDelete(func.id, func.name)}
                        variant="destructive"
                        size="sm"
                        className="flex-1 gap-1"
                        disabled={isAdding || editingId !== null}
                      >
                        <Trash2 className="w-3 h-3" />
                        DELETE
                      </Button>
                    </div>
              </div>
            ))}
          </div>
        )}
      </div>

          {/* Footer with count */}
          <div className="p-4 border-t bg-background">
            <p className="text-xs font-semibold text-foreground text-center uppercase">
              {filteredFunctionality.length} of {appState.existingFunctionality.length} items
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
