"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { subscribeUserTodos } from "@/firebase/todos";

// --- 型定義 ---
export interface TaskType {
  id: string;
  order: number;
  complete: boolean;
  content: string;
}

export type ResetDaysType = {
  sun: boolean;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
};

export interface TodoListType {
  id: string;
  title: string;
  category: string;
  date: string;
  order: number;
  lock: boolean;
  resetDays: ResetDaysType;
  tasks: TaskType[];
}

interface TodoContextType {
  todos: TodoListType[];
  isTodosLoading: boolean;
}

export type TodoAction =
  | { type: "todo/init"; payload: TodoListType[] }
  | { type: "todo/addList"; payload: TodoListType }
  | { type: "todo/add"; payload: { id: string; newTask: TaskType } }
  | { type: "todo/updateListTitle"; payload: { listId: string; updatedTitle: string } }
  | { type: "todo/update"; payload: { listId: string; updatedTasks: TaskType[] } }
  | { type: "todo/updateList"; payload: { listId: string; updatedCategory: string; updatedOrder: number } }
  | { type: "todo/updateLock"; payload: { listId: string; lock: boolean } }
  | { type: "todo/updateResetDays"; payload: { listId: string; updatedResetDays: ResetDaysType } }
  | { type: "todo/resetComplete"; payload: { listId: string } }
  | { type: "todo/deleteList"; payload: { listId: string } }
  | { type: "todo/delete"; payload: { listId: string; taskId: string } }
  | { type: "todo/sort"; payload: { updatedTodos: TodoListType[] } };

type TodoDispatch = React.Dispatch<TodoAction>;

const TodoContext = createContext<TodoContextType | undefined>(undefined);
const TodoContextDispatch = createContext<TodoDispatch | undefined>(undefined);

const todoReducer = (state: TodoListType[], action: TodoAction) => {
  const { type, payload } = action;
  switch (type) {
    case "todo/init":
      return [...payload].sort((a, b) => a.order - b.order);
    case "todo/addList":
      return [...state, payload].sort((a, b) => a.order - b.order);
    case "todo/add":
      return state.map((todoList) =>
        todoList.id === payload.id
          ? { ...todoList, tasks: [...todoList.tasks, payload.newTask] }
          : todoList
      );
    case "todo/updateListTitle":
      return state.map((todoList) =>
        todoList.id === payload.listId
          ? { ...todoList, title: payload.updatedTitle }
          : todoList
      );
    case "todo/update":
      return state.map((todoList) =>
        todoList.id === payload.listId
          ? { ...todoList, tasks: payload.updatedTasks }
          : todoList
      );
    case "todo/updateList":
      return state.map((todoList) =>
        todoList.id === payload.listId
          ? {
            ...todoList,
            category: payload.updatedCategory,
            order: payload.updatedOrder,
          }
          : todoList
      );
    case "todo/updateLock":
      return state.map((todoList) =>
        todoList.id === payload.listId
          ? { ...todoList, lock: payload.lock }
          : todoList
      );
    case "todo/updateResetDays":
      return state.map((todoList) =>
        todoList.id === payload.listId
          ? { ...todoList, resetDays: payload.updatedResetDays }
          : todoList
      );
    case "todo/resetComplete":
      return state.map((todoList) =>
        todoList.id === payload.listId
          ? {
            ...todoList,
            tasks: todoList.tasks.map((task) => {
              return { ...task, complete: false };
            }),
          }
          : todoList
      );
    case "todo/deleteList":
      return state
        .filter((todoList) => todoList.id !== payload.listId)
        .sort((a, b) => a.order - b.order);
    case "todo/delete":
      return state.map((todoList) => {
        if (todoList.id === payload.listId) {
          const normalizedTasks = todoList.tasks
            .filter((task) => task.id !== payload.taskId)
            .sort((a, b) => a.order - b.order)
            .map((task, index) => ({ ...task, order: index + 1 }));



          return {
            ...todoList,
            tasks: normalizedTasks,
          };
        }
        return todoList;
      });
    case "todo/sort":
      return payload.updatedTodos;

    default:
      return state;
  }
};

const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(todoReducer, []);
  const [isTodosLoading, setIsTodosLoading] = useState(true);
  const { user, isAuthLoading } = useAuth();

  // サブスクリプション解除関数を listId→unsubscribe で保持

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      dispatch({ type: "todo/init", payload: [] });
      setIsTodosLoading(false);
      return;
    }

    const unsubscribe = subscribeUserTodos(
      user.uid,
      dispatch,
      setIsTodosLoading
    );

    return () => unsubscribe();
  }, [user, isAuthLoading]);

  return (
    <TodoContext.Provider value={{ todos: state, isTodosLoading }}>
      <TodoContextDispatch.Provider value={dispatch}>
        {children}
      </TodoContextDispatch.Provider>
    </TodoContext.Provider>
  );
};

const useTodos = (): TodoListType[] => {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error("useTodos は TodoProviderの中で使ってください")
  }
  return ctx.todos;
};
const useTodosLoading = (): boolean => {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error("useTodosLoading は TodoProviderの中で使ってください")
  }
  return ctx.isTodosLoading;
};
const useTodosDispatch = (): TodoDispatch => {
  const ctx = useContext(TodoContextDispatch);
  if (!ctx) {
    throw new Error("useTodosDispatch は TodoProviderの中で使ってください")
  }
  return ctx;
};

export { TodoProvider, useTodos, useTodosDispatch, useTodosLoading };
