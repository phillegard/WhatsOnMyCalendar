import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Calendar, User, Clock, Trash2, Plus, Check, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, Status, Priority, Subtask } from '../../types';
import { useStore } from '../../store/useStore';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskModal({ task, isOpen, onClose, onSave, onDelete }: TaskModalProps) {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [newSubtask, setNewSubtask] = useState('');
  const [expandedSubtaskId, setExpandedSubtaskId] = useState<string | null>(null);
  const statuses = useStore((state) => state.statuses);
  const getStatusColor = useStore((state) => state.getStatusColor);
  const statusConfigs = useStore((state) => state.statusConfigs);
  
  useEffect(() => {
    setEditedTask(task);
  }, [task]);
  
  const handleChange = (key: keyof Task, value: any) => {
    setEditedTask((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handleStatus = (status: Status) => {
    handleChange('status', status);
  };
  
  const handlePriority = (priority: Priority) => {
    handleChange('priority', priority);
  };
  
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
      const newSubtaskItem: Subtask = {
        id: crypto.randomUUID(),
        title: newSubtask.trim(),
        completed: false,
        status: 'todo',
        priority: 'medium',
        assignees: [],
        createdAt: now,
        updatedAt: now,
      };
      
      handleChange('subtasks', [...editedTask.subtasks, newSubtaskItem]);
      setNewSubtask('');
    }
  };
  
  const handleToggleSubtask = (subtaskId: string) => {
    handleChange('subtasks', editedTask.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    handleChange('subtasks', editedTask.subtasks.filter(st => st.id !== subtaskId));
    if (expandedSubtaskId === subtaskId) {
      setExpandedSubtaskId(null);
    }
  };

  const handleSubtaskChange = (subtaskId: string, key: keyof Subtask, value: any) => {
    handleChange('subtasks', editedTask.subtasks.map(st =>
      st.id === subtaskId
        ? { ...st, [key]: value, updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss") }
        : st
    ));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedTask);
  };
  
  if (!isOpen) return null;
  
  const completedSubtasks = editedTask.subtasks.filter(st => st.completed).length;
  const totalSubtasks = editedTask.subtasks.length;

  const getStatusClass = (status: Status) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: `${color}20`, // 20% opacity
      color: color,
      borderColor: color,
    };
  };

  const getPriorityClass = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl animate-fade-in">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white p-4 border-b border-gray-200">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">Task Details</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="input"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={editedTask.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input !h-24 resize-none"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </label>
              <div className="h-1 flex-1 mx-4 rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${totalSubtasks ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {editedTask.subtasks.map((subtask) => (
                <div key={subtask.id} className="rounded-lg border border-gray-200">
                  <div className="flex items-center p-2">
                    <button
                      type="button"
                      className="flex items-center flex-1 rounded-md hover:bg-gray-50"
                      onClick={() => handleToggleSubtask(subtask.id)}
                    >
                      {subtask.completed ? (
                        <Check size={16} className="text-primary-500 mr-2" />
                      ) : (
                        <Square size={16} className="text-gray-400 mr-2" />
                      )}
                      <span className={`text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {subtask.title}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(subtask.status).backgroundColor} ${getStatusClass(subtask.status).borderColor} ${getStatusClass(subtask.status).color}`}>
                        {subtask.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(subtask.priority)}`}>
                        {subtask.priority}
                      </span>
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={() => setExpandedSubtaskId(expandedSubtaskId === subtask.id ? null : subtask.id)}
                      >
                        {expandedSubtaskId === subtask.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-error-500"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {expandedSubtaskId === subtask.id && (
                    <div className="border-t border-gray-200 p-2 space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Status</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {statusConfigs.map((config) => (
                            <button
                              key={config.name}
                              type="button"
                              className={`rounded-full px-2 py-0.5 text-xs font-medium border ${
                                subtask.status === config.name
                                  ? 'ring-2'
                                  : 'hover:bg-opacity-20'
                              }`}
                              style={getStatusClass(config.name)}
                              onClick={() => handleSubtaskChange(subtask.id, 'status', config.name)}
                            >
                              {config.name.charAt(0).toUpperCase() + config.name.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Priority</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
                            <button
                              key={priority}
                              type="button"
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                subtask.priority === priority
                                  ? 'bg-primary-100 text-primary-800 ring-1 ring-primary-500'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                              onClick={() => handleSubtaskChange(subtask.id, 'priority', priority)}
                            >
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Due Date</label>
                        <div className="relative mt-1">
                          <input
                            type="date"
                            value={subtask.dueDate || ''}
                            onChange={(e) => handleSubtaskChange(subtask.id, 'dueDate', e.target.value)}
                            className="w-full rounded-md border-gray-300 text-xs py-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                className="input !py-1.5 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                className="ml-2 btn btn-secondary !py-1.5"
                onClick={handleAddSubtask}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusConfigs.map((config) => (
                <button
                  key={config.name}
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm font-medium border ${
                    editedTask.status === config.name
                      ? 'ring-2'
                      : 'hover:bg-opacity-20'
                  }`}
                  style={getStatusClass(config.name)}
                  onClick={() => handleStatus(config.name)}
                >
                  {config.name.charAt(0).toUpperCase() + config.name.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    editedTask.priority === priority
                      ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => handlePriority(priority)}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={editedTask.dueDate || ''}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="input pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onDelete(editedTask.id)}
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}