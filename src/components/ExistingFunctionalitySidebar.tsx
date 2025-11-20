/**
 * ExistingFunctionalitySidebar Component - Neo-Brutalist Edition
 * Collapsible sidebar for managing existing functionality entries
 */

import { useState, useEffect } from 'react';
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
    showNotification
  } = useAppContext();

  // Auto-collapse on screens < 1024px (lg breakpoint)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
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

  // Handle responsive collapse on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <aside
      className={`bg-yellow-50 border-r-4 border-black flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-12 sm:w-16' : 'w-full lg:w-80'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-4 border-black bg-yellow-400">
        {!isCollapsed && (
          <h2 className="text-xl font-black text-black uppercase">
            Existing
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="border-2"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Content (hidden when collapsed) */}
      {!isCollapsed && (
        <>
          {/* Search Box */}
          <div className="p-4 border-b-4 border-black bg-white">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="font-bold"
            />
          </div>

          {/* Add Button */}
          {!isAdding && !editingId && (
            <div className="p-4 border-b-4 border-black bg-white">
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
            <div className="p-4 border-b-4 border-black bg-purple-100">
              <h3 className="text-sm font-black text-black mb-3 uppercase">
                {isAdding ? 'Add New' : 'Edit'}
              </h3>
              
              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-black text-black mb-1 uppercase">
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
                  <label className="block text-xs font-black text-black mb-1 uppercase">
                    Implementation
                  </label>
                  <select
                    value={formData.implementation}
                    onChange={(e) => setFormData({ ...formData, implementation: e.target.value as ImplementationType })}
                    className="w-full h-10 border-brutal bg-white px-3 py-2 text-sm font-bold shadow-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    <option value={ImplementationType.LOOP_SAME}>Standard Components</option>
                    <option value={ImplementationType.LOOP_DIFFERENT}>New Pattern</option>
                    <option value={ImplementationType.CUSTOM}>Custom Implementation</option>
                    <option value={ImplementationType.MIX}>Hybrid</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-black text-black mb-1 uppercase">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FunctionalityStatus })}
                    className="w-full h-10 border-brutal bg-white px-3 py-2 text-sm font-bold shadow-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    <option value={FunctionalityStatus.STABLE}>Stable</option>
                    <option value={FunctionalityStatus.UNSTABLE}>Unstable</option>
                    <option value={FunctionalityStatus.DEPRECATED}>Deprecated</option>
                  </select>
                </div>

                {/* Last Tested */}
                <div>
                  <label className="block text-xs font-black text-black mb-1 uppercase">
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
          <div className="flex-1 overflow-y-auto bg-white">
            {filteredFunctionality.length === 0 ? (
              <div className="p-4 text-center">
                <div className="border-brutal bg-gray-100 p-6 shadow-brutal">
                  <p className="text-sm font-bold text-gray-600 uppercase">
                    {searchTerm ? 'No matches found' : 'No functionality yet'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredFunctionality.map((func) => (
                  <div
                    key={func.id}
                    className="border-brutal bg-white p-4 shadow-brutal hover-lift transition-all"
                  >
                    {/* Name and Source Badge */}
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="text-sm font-black text-black flex-1">
                        {func.name}
                      </h3>
                      {getSourceBadge(func.source)}
                    </div>

                    {/* Implementation and Status */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-700 uppercase">
                        {getImplementationLabel(func.implementation)}
                      </span>
                      {getStatusBadge(func.status)}
                    </div>

                    {/* Last Tested */}
                    {func.lastTested && (
                      <div className="text-xs font-bold text-gray-600 mb-3 uppercase">
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
          <div className="p-4 border-t-4 border-black bg-yellow-400">
            <p className="text-xs font-black text-black text-center uppercase">
              {filteredFunctionality.length} of {appState.existingFunctionality.length} items
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
