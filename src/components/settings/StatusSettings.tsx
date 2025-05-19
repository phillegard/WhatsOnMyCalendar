import { useState } from 'react';
import { Plus, Trash2, GripVertical, Check, X, Palette } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusConfig } from '../../types';

interface StatusItemProps {
  statusConfig: StatusConfig;
  isEditing: boolean;
  editedName: string;
  editedColor: string;
  onEdit: (newName: string, newColor: string) => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

function StatusItem({
  statusConfig,
  isEditing,
  editedName,
  editedColor,
  onEdit,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onDragStart,
  onDragOver,
  onDrop,
}: StatusItemProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200"
      data-status={statusConfig.name}
    >
      <button className="cursor-move text-gray-400 hover:text-gray-600">
        <GripVertical size={16} />
      </button>
      
      {isEditing ? (
        <div className="flex-1 flex items-center space-x-2">
          <input
            type="text"
            value={editedName}
            onChange={(e) => onEdit(e.target.value, editedColor)}
            className="input flex-1"
            autoFocus
          />
          <input
            type="color"
            value={editedColor}
            onChange={(e) => onEdit(editedName, e.target.value)}
            className="h-8 w-8 rounded cursor-pointer"
            title="Choose status color"
          />
          <button
            onClick={() => onEdit(editedName, editedColor)}
            className="p-1 text-success-600 hover:text-success-700"
            disabled={!editedName.trim()}
          >
            <Check size={16} />
          </button>
          <button
            onClick={onCancelEdit}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <div
            className="flex-1 flex items-center space-x-2 cursor-pointer"
            onClick={onStartEdit}
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: statusConfig.color }}
            />
            <span className="text-sm font-medium text-gray-900">
              {statusConfig.name}
            </span>
          </div>
          <button
            onClick={onStartEdit}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Edit status"
          >
            <Palette size={16} />
          </button>
        </>
      )}
      
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-error-600"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export function StatusSettings() {
  const [newStatus, setNewStatus] = useState('');
  const [newColor, setNewColor] = useState('#4F46E5');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [draggedStatus, setDraggedStatus] = useState<string | null>(null);
  
  const statusConfigs = useStore((state) => state.statusConfigs);
  const addStatus = useStore((state) => state.addStatus);
  const updateStatus = useStore((state) => state.updateStatus);
  const deleteStatus = useStore((state) => state.deleteStatus);
  const reorderStatuses = useStore((state) => state.reorderStatuses);

  const handleAddStatus = () => {
    if (newStatus.trim()) {
      addStatus(newStatus.trim(), newColor);
      setNewStatus('');
      setNewColor('#4F46E5');
    }
  };

  const handleUpdateStatus = (oldName: string, newName: string, color: string) => {
    if (newName.trim() && (newName !== oldName || color !== editedColor)) {
      updateStatus(oldName, newName.trim(), color);
    }
    setEditingStatus(null);
    setEditedName('');
    setEditedColor('');
  };

  const handleDeleteStatus = (status: string) => {
    if (window.confirm(`Are you sure you want to delete the "${status}" status? This will affect all tasks using this status.`)) {
      deleteStatus(status);
    }
  };

  const startEditing = (statusConfig: StatusConfig) => {
    setEditingStatus(statusConfig.name);
    setEditedName(statusConfig.name);
    setEditedColor(statusConfig.color);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, status: string) => {
    setDraggedStatus(status);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: string) => {
    e.preventDefault();
    
    if (!draggedStatus || draggedStatus === targetStatus) return;
    
    const updatedStatuses = [...statusConfigs];
    const draggedIndex = updatedStatuses.findIndex(s => s.name === draggedStatus);
    const targetIndex = updatedStatuses.findIndex(s => s.name === targetStatus);
    
    const [removed] = updatedStatuses.splice(draggedIndex, 1);
    updatedStatuses.splice(targetIndex, 0, removed);
    
    reorderStatuses(updatedStatuses);
    setDraggedStatus(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Task Statuses</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize the status options available for tasks. Choose colors and drag to reorder.
        </p>
      </div>

      <div className="space-y-2">
        {statusConfigs.map((statusConfig) => (
          <StatusItem
            key={statusConfig.name}
            statusConfig={statusConfig}
            isEditing={editingStatus === statusConfig.name}
            editedName={editedName}
            editedColor={editedColor}
            onEdit={(newName, newColor) => handleUpdateStatus(statusConfig.name, newName, newColor)}
            onDelete={() => handleDeleteStatus(statusConfig.name)}
            onStartEdit={() => startEditing(statusConfig)}
            onCancelEdit={() => {
              setEditingStatus(null);
              setEditedName('');
              setEditedColor('');
            }}
            onDragStart={(e) => handleDragStart(e, statusConfig.name)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, statusConfig.name)}
          />
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          placeholder="Enter new status..."
          className="input flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddStatus();
            }
          }}
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="h-10 w-10 rounded cursor-pointer"
          title="Choose status color"
        />
        <button
          onClick={handleAddStatus}
          disabled={!newStatus.trim()}
          className="btn btn-primary"
        >
          <Plus size={16} className="mr-1" />
          Add Status
        </button>
      </div>
    </div>
  );
} 