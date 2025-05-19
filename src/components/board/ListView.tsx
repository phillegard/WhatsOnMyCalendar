import { useState } from 'react';
import { MoreHorizontal, Plus, ChevronDown, ChevronUp, FolderPlus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { Board, Task, Status, Priority } from '../../types';
import { TaskModal } from '../task/TaskModal';
import { TaskGroup } from './TaskGroup';

interface ListViewProps {
  board: Board;
}

export function ListView({ board }: ListViewProps) {
  console.log('ListView rendering with board:', board);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    assignees: string[];
    dueDate: string;
  }>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignees: [],
    dueDate: '',
  });
  
  const workspace = useStore((state) => 
    state.workspaces.find(ws => ws.boards.some(b => b.id === board.id))
  );
  const statuses = useStore((state) => state.statuses);
  const statusConfigs = useStore((state) => state.statusConfigs);
  const getStatusColor = useStore((state) => state.getStatusColor);

  const updateTask = useStore((state) => state.updateTask);
  const createTask = useStore((state) => state.createTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const createGroup = useStore((state) => state.createGroup);
  const updateGroup = useStore((state) => state.updateGroup);
  const deleteGroup = useStore((state) => state.deleteGroup);
  const moveTaskToGroup = useStore((state) => state.moveTaskToGroup);
  const toggleGroupExpanded = useStore((state) => state.toggleGroupExpanded);
  
  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    const newTaskId = createTask(board.id, board.columns[0].id, {
      ...newTask,
      title: newTask.title.trim(),
    });

    // Only move task to group if one is selected
    // If no group is selected, it will remain in ungroupedTaskIds
    if (selectedGroupId) {
      moveTaskToGroup(board.id, newTaskId, selectedGroupId);
    }
    
    // Reset state
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignees: [],
      dueDate: '',
    });
    setSelectedGroupId(null);
    setIsCreatingTask(false);
  };

  const resetTaskForm = () => {
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignees: [],
      dueDate: '',
    });
    setSelectedGroupId(null);
    setIsCreatingTask(false);
  };
  
  const handleSaveTask = (task: Task) => {
    updateTask(task.id, task);
    setIsModalOpen(false);
    setSelectedTask(null);
  };
  
  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleCreateGroup = () => {
    if (newGroupTitle.trim()) {
      createGroup(board.id, newGroupTitle.trim());
      setNewGroupTitle('');
      setIsAddingGroup(false);
    }
  };

  const handleTaskDrop = (taskId: string, groupId: string | null) => {
    moveTaskToGroup(board.id, taskId, groupId);
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
          style={getStatusClass(task.status)}
        >
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
        <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${getPriorityClass(task.priority)}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>
      {task.dueDate && (
        <span className="text-sm text-gray-500">
          Due: {format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}
    </div>
  );

  const getStatusClass = (status: Status) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: `${color}20`, // 20% opacity
      color: color,
      borderColor: color,
    };
  };

  const getPriorityClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <div className="flex items-center space-x-2">
          <button
            className="btn btn-secondary"
            onClick={() => setIsAddingGroup(true)}
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
        <div className="mb-4 space-y-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={resetTaskForm}
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
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title..."
                className="input w-full mt-1"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
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
                {board.groups.map(group => (
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
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Status })}
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
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
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
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="input w-full mt-1"
              />
            </div>

            {/* Assignees */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Assignees</label>
              <select
                multiple
                value={newTask.assignees}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setNewTask({ ...newTask, assignees: selectedOptions });
                }}
                className="input w-full mt-1 h-24"
              >
                {workspace?.members.map((member) => (
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
              onClick={resetTaskForm}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateTask}
              disabled={!newTask.title.trim()}
            >
              Create Task
            </button>
          </div>
        </div>
      )}

      {isAddingGroup && (
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            value={newGroupTitle}
            onChange={(e) => setNewGroupTitle(e.target.value)}
            placeholder="Enter group name..."
            className="input flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateGroup();
              } else if (e.key === 'Escape') {
                setIsAddingGroup(false);
                setNewGroupTitle('');
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
            onClick={() => {
              setIsAddingGroup(false);
              setNewGroupTitle('');
            }}
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
          tasks={board.tasks.filter(task => group.taskIds.includes(task.id))}
          onEditGroup={(updatedGroup) => updateGroup(board.id, group.id, updatedGroup)}
          onDeleteGroup={(groupId) => deleteGroup(board.id, groupId)}
          onTaskDrop={handleTaskDrop}
          onToggleExpand={(groupId) => toggleGroupExpanded(board.id, groupId)}
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
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}