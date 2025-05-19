import { useState } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, Plus, Edit2, Trash2 } from 'lucide-react';
import { Group, Task } from '../../types';
import { format } from 'date-fns';

interface TaskGroupProps {
  group: Group;
  tasks: Task[];
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (groupId: string) => void;
  onTaskDrop: (taskId: string, groupId: string) => void;
  onToggleExpand: (groupId: string) => void;
  renderTask: (task: Task) => React.ReactNode;
}

export function TaskGroup({
  group,
  tasks,
  onEditGroup,
  onDeleteGroup,
  onTaskDrop,
  onToggleExpand,
  renderTask
}: TaskGroupProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(group.title);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-gray-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-50');
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskDrop(taskId, group.id);
    }
  };

  const handleEditSubmit = () => {
    if (editedTitle.trim()) {
      onEditGroup({
        ...group,
        title: editedTitle.trim(),
        updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
      });
      setIsEditing(false);
    }
  };

  return (
    <div
      className="mb-4 rounded-lg border border-gray-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleExpand(group.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            {group.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSubmit();
              }}
              className="flex items-center"
            >
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="input !py-1 !text-sm"
                autoFocus
                onBlur={handleEditSubmit}
              />
            </form>
          ) : (
            <h3 className="text-sm font-medium text-gray-900">{group.title}</h3>
          )}
          
          <span className="text-xs text-gray-500">({tasks.length})</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <MoreHorizontal size={16} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 size={14} className="mr-2" />
                Rename Group
              </button>
              <button
                onClick={() => {
                  onDeleteGroup(group.id);
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-error-600 hover:bg-error-50"
              >
                <Trash2 size={14} className="mr-2" />
                Delete Group
              </button>
            </div>
          )}
        </div>
      </div>

      {group.isExpanded && (
        <div className="divide-y divide-gray-100 p-3">
          {tasks.map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', task.id);
                e.currentTarget.classList.add('opacity-50');
              }}
              onDragEnd={(e) => {
                e.currentTarget.classList.remove('opacity-50');
              }}
              className="py-2 first:pt-0 last:pb-0"
            >
              {renderTask(task)}
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              Drag and drop tasks here
            </div>
          )}
        </div>
      )}
    </div>
  );
} 