import { useState } from 'react';
import { X } from 'lucide-react';
import { Status, Priority, User, Group } from '../../types';
import { useStatusConfig } from '../../hooks/useStatusConfig';

interface TaskFormData {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignees: string[];
  dueDate: string;
}

interface TaskCreationFormProps {
  groups: Group[];
  members: User[];
  onSubmit: (data: TaskFormData, groupId: string | null) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const INITIAL_FORM_DATA: TaskFormData = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignees: [],
  dueDate: '',
};

export function TaskCreationForm({
  groups,
  members,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TaskCreationFormProps) {
  const { statusConfigs } = useStatusConfig();
  const [formData, setFormData] = useState<TaskFormData>(INITIAL_FORM_DATA);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (formData.title.trim() && !isSubmitting) {
      onSubmit(formData, selectedGroupId);
    }
  };

  const updateField = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mb-4 space-y-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
        <button
          className="text-gray-400 hover:text-gray-500"
          onClick={onCancel}
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Enter task title..."
            className="input w-full mt-1"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Enter task description..."
            className="input w-full mt-1 h-24 resize-none"
          />
        </div>

        {/* Group Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Group</label>
          <select
            value={selectedGroupId || ''}
            onChange={(e) => setSelectedGroupId(e.target.value || null)}
            className="input w-full mt-1"
          >
            <option value="">No Group (Ungrouped)</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value as Status)}
              className="input w-full mt-1"
            >
              {statusConfigs.map((config) => (
                <option key={config.name} value={config.name}>
                  {config.name.charAt(0).toUpperCase() + config.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => updateField('priority', e.target.value as Priority)}
              className="input w-full mt-1"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
            className="input w-full mt-1"
          />
        </div>

        {/* Assignees */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Assignees</label>
          <select
            multiple
            value={formData.assignees}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
              updateField('assignees', selectedOptions);
            }}
            className="input w-full mt-1 h-24"
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!formData.title.trim() || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </div>
  );
}
