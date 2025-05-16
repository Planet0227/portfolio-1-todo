"use client";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { authenticatedFetch } from "@/utils/authToken";
import { useAuth } from "./AuthContext";
import { resetTasksIfNeeded } from "@/utils/resetTasks";
const TodoContext = createContext();
const TodoContextDispatch = createContext();

const todoReducer = (state, { type, payload }) => {
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
          return {
            ...todoList,
            tasks: todoList.tasks
              .filter((task) => task.id !== payload.taskId)
              .sort((a, b) => a.order - b.order),
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

const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, []);
  const [isTodosLoading, setIsTodosLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const initTodos = async () => {
      // 未ログイン時はすぐ空配列で初期化
      if (!user) {
        dispatch({ type: "todo/init", payload: [] });
        setIsTodosLoading(false);
        return;
      }

      try {
        const res = await authenticatedFetch("/api/todos", { method: "GET" });

        // HTTP レスポンス判定を自前で
        if (res.status === 401) {
          console.warn("認証されていません。ゲストモードで動作します。");
          dispatch({ type: "todo/init", payload: [] });
          return;
        }
        if (!res.ok) {
          throw new Error(`Todo の取得に失敗しました: ${res.status}`);
        }

        let todos = await res.json();

        // fetch 直後にリセットロジックを通す
        todos = await resetTasksIfNeeded(todos);

        // ローカルステート初期化
        dispatch({ type: "todo/init", payload: todos });
      } catch (error) {
        console.error(error);
        // エラー時も空配列で安全に初期化
        dispatch({ type: "todo/init", payload: [] });
      } finally {
        setIsTodosLoading(false);
      }
    };

    initTodos();
  }, [user, authLoading]);

  return (
    <TodoContext.Provider value={{ todos: state, isTodosLoading }}>
      <TodoContextDispatch.Provider value={dispatch}>
        {children}
      </TodoContextDispatch.Provider>
    </TodoContext.Provider>
  );
};

const useTodos = () => useContext(TodoContext).todos;
const useTodosLoading = () => useContext(TodoContext).isTodosLoading;
const useTodosDispatch = () => useContext(TodoContextDispatch);

export { TodoProvider, useTodos, useTodosDispatch, useTodosLoading };
