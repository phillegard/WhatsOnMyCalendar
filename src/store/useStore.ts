import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Board, Column, Task, User, Workspace, ViewType, Group, Status, StatusConfig } from '../types';
import { getCurrentTimestamp } from '../utils/dateHelpers';
import { updateBoardInWorkspaces, updateAllBoards, findBoardWithWorkspace, findTaskWithBoard } from './storeHelpers';
import { createDemoState, createDefaultColumns, demoUser, DEFAULT_STATUS_CONFIGS } from './demoData';

interface State {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentBoardId: string | null;
  currentUser: User | null;
  boardViewType: ViewType;
  statuses: Status[];
  statusConfigs: StatusConfig[];
}

interface Actions {
  // Workspaces
  createWorkspace: (name: string) => void;
  updateWorkspace: (id: string, data: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setCurrentWorkspace: (id: string) => void;
  
  // Boards
  createBoard: (workspaceId: string, title: string, description?: string) => string;
  updateBoard: (id: string, data: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  setCurrentBoard: (id: string) => void;
  setBoardViewType: (boardId: string, viewType: ViewType) => void;
  
  // Columns
  addColumn: (boardId: string, title: string, type: Column['type']) => void;
  updateColumn: (id: string, data: Partial<Column>) => void;
  deleteColumn: (id: string) => void;
  
  // Tasks
  createTask: (boardId: string, columnId: string, task: Partial<Task>) => string;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void;
  
  // Users
  setCurrentUser: (user: User) => void;
  addUserToWorkspace: (workspaceId: string, user: User) => void;
  removeUserFromWorkspace: (workspaceId: string, userId: string) => void;

  // Group actions
  createGroup: (boardId: string, title: string) => string;
  updateGroup: (boardId: string, groupId: string, data: Partial<Group>) => void;
  deleteGroup: (boardId: string, groupId: string) => void;
  moveTaskToGroup: (boardId: string, taskId: string, groupId: string | null) => void;
  toggleGroupExpanded: (boardId: string, groupId: string) => void;

  // Status management actions
  addStatus: (name: string, color: string) => void;
  updateStatus: (oldName: string, newName: string, color: string) => void;
  deleteStatus: (status: string) => void;
  reorderStatuses: (statusConfigs: StatusConfig[]) => void;
  getStatusColor: (status: string) => string;
}

// Safe localStorage wrapper for Zustand persist
const storage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.warn('localStorage getItem failed:', error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
    }
  },
};

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => {
      // Create initial state
      const initialState = createDemoState();
      
      return {
        ...initialState,
        
        // Workspace actions
        createWorkspace: (name) => {
          const now = getCurrentTimestamp();
          const newWorkspace: Workspace = {
            id: uuidv4(),
            name,
            createdAt: now,
            members: [get().currentUser!],
            boards: [],
          };
          
          set((state) => ({
            workspaces: [...state.workspaces, newWorkspace],
            currentWorkspaceId: newWorkspace.id,
          }));
        },
        
        updateWorkspace: (id, data) => {
          set((state) => ({
            workspaces: state.workspaces.map((workspace) => 
              workspace.id === id ? { ...workspace, ...data } : workspace
            ),
          }));
        },
        
        deleteWorkspace: (id) => {
          set((state) => ({
            workspaces: state.workspaces.filter((workspace) => workspace.id !== id),
            currentWorkspaceId: state.currentWorkspaceId === id ? null : state.currentWorkspaceId,
          }));
        },
        
        setCurrentWorkspace: (id) => {
          set({ currentWorkspaceId: id });
        },
        
        // Board actions
        createBoard: (workspaceId, title, description) => {
          const now = getCurrentTimestamp();
          const newBoardId = uuidv4();
          const columns = createDefaultColumns(newBoardId);
          
          const newBoard: Board = {
            id: newBoardId,
            title,
            description,
            createdAt: now,
            updatedAt: now,
            columns,
            tasks: [],
            groups: [],
            ungroupedTaskIds: [],
            viewType: 'list',
          };
          
          set((state) => ({
            workspaces: state.workspaces.map((workspace) => 
              workspace.id === workspaceId 
                ? { ...workspace, boards: [...workspace.boards, newBoard] } 
                : workspace
            ),
            currentBoardId: newBoardId,
          }));
          
          return newBoardId;
        },
        
        updateBoard: (id, data) => {
          set((state) => ({
            workspaces: updateBoardInWorkspaces(state.workspaces, id, (board) => ({
              ...board,
              ...data,
              updatedAt: getCurrentTimestamp(),
            })),
          }));
        },
        
        deleteBoard: (id) => {
          set((state) => ({
            workspaces: state.workspaces.map((workspace) => ({
              ...workspace,
              boards: workspace.boards.filter((board) => board.id !== id),
            })),
            currentBoardId: state.currentBoardId === id ? null : state.currentBoardId,
          }));
        },
        
        setCurrentBoard: (id) => {
          set({ currentBoardId: id });
        },
        
        setBoardViewType: (boardId, viewType) => {
          set((state) => ({
            workspaces: updateBoardInWorkspaces(state.workspaces, boardId, (board) => ({
              ...board,
              viewType,
            })),
            boardViewType: viewType,
          }));
        },
        
        // Column actions
        addColumn: (boardId, title, type) => {
          const newColumn: Column = {
            id: uuidv4(),
            title,
            type,
            boardId,
            order: 999, // Will be adjusted in the update
          };
          
          set((state) => {
            const workspace = state.workspaces.find((ws) => 
              ws.boards.some((board) => board.id === boardId)
            );
            
            if (!workspace) return state;
            
            const board = workspace.boards.find((b) => b.id === boardId);
            if (!board) return state;
            
            // Calculate the next order value
            const maxOrder = Math.max(...board.columns.map((col) => col.order), -1);
            newColumn.order = maxOrder + 1;
            
            return {
              workspaces: state.workspaces.map((ws) => 
                ws.id === workspace.id
                  ? {
                      ...ws,
                      boards: ws.boards.map((b) => 
                        b.id === boardId
                          ? { ...b, columns: [...b.columns, newColumn], updatedAt: getCurrentTimestamp() }
                          : b
                      ),
                    }
                  : ws
              ),
            };
          });
        },
        
        updateColumn: (id, data) => {
          set((state) => ({
            workspaces: updateAllBoards(state.workspaces, (board) => ({
              ...board,
              columns: board.columns.map((column) =>
                column.id === id ? { ...column, ...data } : column
              ),
              updatedAt: getCurrentTimestamp(),
            })),
          }));
        },

        deleteColumn: (id) => {
          set((state) => ({
            workspaces: updateAllBoards(state.workspaces, (board) => ({
              ...board,
              columns: board.columns.filter((column) => column.id !== id),
              tasks: board.tasks.filter((task) => task.columnId !== id),
              updatedAt: getCurrentTimestamp(),
            })),
          }));
        },
        
        // Task actions
        createTask: (boardId, columnId, taskData) => {
          const now = getCurrentTimestamp();
          const newTaskId = uuidv4();

          const newTask: Task = {
            id: newTaskId,
            title: taskData.title || 'New Task',
            description: taskData.description || '',
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            assignees: taskData.assignees || [],
            dueDate: taskData.dueDate,
            createdAt: now,
            updatedAt: now,
            columnId,
            subtasks: [],
          };

          set((state) => ({
            workspaces: updateBoardInWorkspaces(state.workspaces, boardId, (board) => ({
              ...board,
              tasks: [...board.tasks, newTask],
              ungroupedTaskIds: [...(board.ungroupedTaskIds || []), newTaskId],
              updatedAt: now,
            })),
          }));

          return newTaskId;
        },

        updateTask: (id, data) => {
          set((state) => ({
            workspaces: updateAllBoards(state.workspaces, (board) => ({
              ...board,
              tasks: board.tasks.map((task) =>
                task.id === id
                  ? { ...task, ...data, updatedAt: getCurrentTimestamp() }
                  : task
              ),
              updatedAt: getCurrentTimestamp(),
            })),
          }));
        },

        deleteTask: (id) => {
          set((state) => ({
            workspaces: updateAllBoards(state.workspaces, (board) => ({
              ...board,
              tasks: board.tasks.filter((task) => task.id !== id),
              updatedAt: getCurrentTimestamp(),
            })),
          }));
        },
        
        moveTask: (taskId, sourceColumnId, destinationColumnId, newIndex) => {
          // This is a simplified implementation
          // In a real app, you'd need to handle more complex reordering
          set((state) => {
            let boardToUpdate: Board | null = null;
            let taskToMove: Task | null = null;
            
            // Find the board and task
            state.workspaces.forEach((workspace) => {
              workspace.boards.forEach((board) => {
                const task = board.tasks.find((t) => t.id === taskId);
                if (task) {
                  boardToUpdate = board;
                  taskToMove = task;
                }
              });
            });
            
            if (!boardToUpdate || !taskToMove) return state;
            
            return {
              workspaces: state.workspaces.map((workspace) => ({
                ...workspace,
                boards: workspace.boards.map((board) => 
                  board.id === boardToUpdate?.id
                    ? {
                        ...board,
                        tasks: board.tasks.map((task) => 
                          task.id === taskId
                            ? { ...task, columnId: destinationColumnId }
                            : task
                        ),
                        updatedAt: getCurrentTimestamp(),
                      }
                    : board
                ),
              })),
            };
          });
        },
        
        // User actions
        setCurrentUser: (user) => {
          set({ currentUser: user });
        },
        
        addUserToWorkspace: (workspaceId, user) => {
          set((state) => ({
            workspaces: state.workspaces.map((workspace) => 
              workspace.id === workspaceId
                ? { 
                    ...workspace, 
                    members: [...workspace.members.filter((m) => m.id !== user.id), user] 
                  }
                : workspace
            ),
          }));
        },
        
        removeUserFromWorkspace: (workspaceId, userId) => {
          set((state) => ({
            workspaces: state.workspaces.map((workspace) => 
              workspace.id === workspaceId
                ? { 
                    ...workspace, 
                    members: workspace.members.filter((member) => member.id !== userId) 
                  }
                : workspace
            ),
          }));
        },

        // Group actions
        createGroup: (boardId, title) => {
          const now = getCurrentTimestamp();
          const newGroupId = uuidv4();
          
          const newGroup: Group = {
            id: newGroupId,
            title,
            isExpanded: true,
            taskIds: [],
            createdAt: now,
            updatedAt: now,
          };

          set((state) => ({
            workspaces: updateBoardInWorkspaces(state.workspaces, boardId, (board) => ({
              ...board,
              groups: [...(board.groups || []), newGroup],
              updatedAt: now,
            })),
          }));

          return newGroupId;
        },

        updateGroup: (boardId, groupId, data) => {
          const now = getCurrentTimestamp();

          set((state) => ({
            workspaces: updateBoardInWorkspaces(state.workspaces, boardId, (board) => ({
              ...board,
              groups: board.groups.map((group) =>
                group.id === groupId ? { ...group, ...data, updatedAt: now } : group
              ),
              updatedAt: now,
            })),
          }));
        },

        deleteGroup: (boardId, groupId) => {
          const now = getCurrentTimestamp();

          set((state) => ({
            workspaces: updateBoardInWorkspaces(state.workspaces, boardId, (board) => ({
              ...board,
              groups: board.groups.filter((group) => group.id !== groupId),
              ungroupedTaskIds: [
                ...(board.ungroupedTaskIds || []),
                ...(board.groups.find((g) => g.id === groupId)?.taskIds || []),
              ],
              updatedAt: now,
            })),
          }));
        },
        
        moveTaskToGroup: (boardId, taskId, groupId) => {
          const now = getCurrentTimestamp();

          set((state) => ({
            workspaces: updateBoardInWorkspaces(state.workspaces, boardId, (board) => {
              // Remove task from current group or ungrouped list
              const updatedGroups = board.groups.map((group) => ({
                ...group,
                taskIds: group.taskIds.filter((id) => id !== taskId),
                updatedAt: group.taskIds.includes(taskId) ? now : group.updatedAt,
              }));

              const updatedUngroupedTaskIds = (board.ungroupedTaskIds || []).filter(
                (id) => id !== taskId
              );

              // Add task to new group or ungrouped list
              if (groupId) {
                updatedGroups.forEach((group) => {
                  if (group.id === groupId) {
                    group.taskIds.push(taskId);
                    group.updatedAt = now;
                  }
                });
              } else {
                updatedUngroupedTaskIds.push(taskId);
              }

              return {
                ...board,
                groups: updatedGroups,
                ungroupedTaskIds: updatedUngroupedTaskIds,
                updatedAt: now,
              };
            }),
          }));
        },

        toggleGroupExpanded: (boardId, groupId) => {
          set((state) => ({
            workspaces: updateBoardInWorkspaces(state.workspaces, boardId, (board) => ({
              ...board,
              groups: board.groups.map((group) =>
                group.id === groupId ? { ...group, isExpanded: !group.isExpanded } : group
              ),
            })),
          }));
        },

        // Status management actions
        addStatus: (name: string, color: string) => {
          set((state) => ({
            statusConfigs: [...state.statusConfigs, { name, color }],
          }));
        },
        
        updateStatus: (oldName: string, newName: string, color: string) => {
          set((state) => {
            // Update status configs
            const newStatusConfigs = state.statusConfigs.map((config) =>
              config.name === oldName ? { name: newName, color } : config
            );

            // Update all tasks with the old status
            const newWorkspaces = state.workspaces.map((workspace) => ({
              ...workspace,
              boards: workspace.boards.map((board) => ({
                ...board,
                tasks: board.tasks.map((task) => ({
                  ...task,
                  status: task.status === oldName ? newName : task.status,
                  subtasks: task.subtasks.map((subtask) => ({
                    ...subtask,
                    status: subtask.status === oldName ? newName : subtask.status,
                  })),
                })),
              })),
            }));

            return {
              statusConfigs: newStatusConfigs,
              workspaces: newWorkspaces,
            };
          });
        },
        
        deleteStatus: (status: string) => {
          set((state) => ({
            statusConfigs: state.statusConfigs.filter((config) => config.name !== status),
          }));
        },
        
        reorderStatuses: (statusConfigs: StatusConfig[]) => {
          set({ statusConfigs });
        },

        getStatusColor: (status: string) => {
          const state = get();
          const statusConfig = state.statusConfigs.find((config) => config.name === status);
          return statusConfig?.color || '#6B7280'; // default gray color
        },
      };
    },
    {
      name: 'taskhub-storage',
      version: 1,
      storage: storage,
    }
  )
);

export const getCurrentWorkspace = () => {
  const { workspaces, currentWorkspaceId } = useStore.getState();
  return workspaces.find((ws) => ws.id === currentWorkspaceId) || null;
};

export const getCurrentBoard = () => {
  const { workspaces, currentWorkspaceId, currentBoardId } = useStore.getState();
  const workspace = workspaces.find((ws) => ws.id === currentWorkspaceId);
  return workspace?.boards.find((board) => board.id === currentBoardId) || null;
};