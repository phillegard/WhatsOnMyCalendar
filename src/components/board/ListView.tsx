import { useState } from 'react';
import { MoreHorizontal, Plus, ChevronDown, ChevronUp, FolderPlus, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Board, Task, Status, Priority } from '../../types';
import { TaskModal } from '../task/TaskModal';
import { TaskGroup } from './TaskGroup';
import { TaskCreationForm } from '../task/TaskCreationForm';
import { getStatusStyle, getPriorityClass } from '../../utils/taskStyles';
import { formatDate } from '../../utils/dateHelpers';
import { useToast } from '../../hooks/useToast';
import { useTaskActions } from '../../hooks/useTaskActions';
import { useGroupActions } from '../../hooks/useGroupActions';
import { useStatusConfig } from '../../hooks/useStatusConfig';

interface ListViewProps {
  board: Board;
}

export function ListView({ board }: ListViewProps) {
  const toast = useToast();
  // Consolidated state: selectedTask doubles as modal open state (null = closed)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // Consolidated state: null = not adding, string = adding with current title
  const [newGroupTitle, setNewGroupTitle] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workspace = useStore((state) =>
    state.workspaces.find((ws) => ws.boards.some((b) => b.id === board.id))
  );

  // Use custom hooks for cleaner store access
  const { statuses, statusConfigs, getStatusColor } = useStatusConfig();
  const { createTask, updateTask, deleteTask, moveTaskToGroup } = useTaskActions(board.id);
  const { createGroup, updateGroup, deleteGroup, toggleGroupExpanded } = useGroupActions(board.id);

  // Derived state
  const isModalOpen = selectedTask !== null;
  const isAddingGroup = newGroupTitle !== null;

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleCreateTask = (
    formData: { title: string; description: string; status: Status; priority: Priority; assignees: string[]; dueDate: string },
    groupId: string | null
  ) => {
    setIsSubmitting(true);
    try {
      const newTaskId = createTask(board.columns[0].id, {
        ...formData,
        title: formData.title.trim(),
      });

      if (groupId) {
        moveTaskToGroup(newTaskId, groupId);
      }

      setIsCreatingTask(false);
      toast.success('Task created successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTask = (task: Task) => {
    updateTask(task.id, task);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setSelectedTask(null);
  };

  const handleCreateGroup = () => {
    if (newGroupTitle?.trim()) {
      createGroup(newGroupTitle.trim());
      setNewGroupTitle(null);
      toast.success('Group created successfully!');
    }
  };

  const handleTaskDrop = (taskId: string, groupId: string | null) => {
    moveTaskToGroup(taskId, groupId);
  };

  const renderTask = (task: Task) => (
    <div 
      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
      onClick={() => handleOpenTask(task)}
    >
      <div className="flex items-center space-x-4">
        <span className="font-medium text-gray-900">{task.title}</span>
        <span
          className="px-2.5 py-0.5 text-xs font-medium rounded-full border"
          style={getStatusStyle(task.status, getStatusColor)}
        >
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
        <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${getPriorityClass(task.priority)}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>
      {task.dueDate && (
        <span className="text-sm text-gray-500">
          Due: {formatDate(task.dueDate)}
        </span>
      )}
    </div>
  );

  
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <div className="flex items-center space-x-2">
          <button
            className="btn btn-secondary"
            onClick={() => setNewGroupTitle('')}
          >
            <FolderPlus size={16} className="mr-1" />
            New Group
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreatingTask(true)}
          >
            <Plus size={16} className="mr-1" />
            New Task
          </button>
        </div>
      </div>

      {/* New Task Creation Dialog */}
      {isCreatingTask && (
        <TaskCreationForm
          groups={board.groups}
          members={workspace?.members || []}
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreatingTask(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {isAddingGroup && (
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            value={newGroupTitle || ''}
            onChange={(e) => setNewGroupTitle(e.target.value)}
            placeholder="Enter group name..."
            className="input flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateGroup();
              } else if (e.key === 'Escape') {
                setNewGroupTitle(null);
              }
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleCreateGroup}
          >
            Create
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setNewGroupTitle(null)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Groups */}
      {board.groups.map(group => (
        <TaskGroup
          key={group.id}
          group={group}
          tasks={board.tasks.filter((task) => group.taskIds.includes(task.id))}
          onEditGroup={(updatedGroup) => updateGroup(group.id, updatedGroup)}
          onDeleteGroup={(groupId) => deleteGroup(groupId)}
          onTaskDrop={handleTaskDrop}
          onToggleExpand={(groupId) => toggleGroupExpanded(groupId)}
          renderTask={renderTask}
        />
      ))}

      {/* Ungrouped Tasks */}
      <div
        className="rounded-lg border border-gray-200"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('bg-gray-50');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('bg-gray-50');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('bg-gray-50');
          const taskId = e.dataTransfer.getData('text/plain');
          if (taskId) {
            handleTaskDrop(taskId, null);
          }
        }}
      >
        <div className="border-b border-gray-200 bg-gray-50 p-3">
          <h3 className="text-sm font-medium text-gray-900">Ungrouped Tasks</h3>
        </div>
        <div className="divide-y divide-gray-100 p-3">
          {board.tasks
            .filter(task => board.ungroupedTaskIds.includes(task.id))
            .map(task => (
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
          {board.ungroupedTaskIds.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              No ungrouped tasks
            </div>
          )}
        </div>
      </div>
      
      {isModalOpen && selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => {
            handleCloseModal();
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}