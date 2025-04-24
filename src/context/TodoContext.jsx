"use client";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { authenticatedFetch } from "@/utils/authToken";
const TodoContext = createContext();
const TodoContextDispatch = createContext();

const todoReducer = (state, { type, payload }) => {
  switch (type) {
    case "todo/init":
      return  [...payload].sort((a, b) => a.order - b.order);
    case "todo/addList":
      return [...state, payload];
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
      return state.filter((todoList) => todoList.id !== payload.listId);
    case "todo/delete":
      return state.map((todoList) => {
        if (todoList.id === payload.listId) {
          return {
            ...todoList,
            tasks: todoList.tasks.filter((task) => task.id !== payload.taskId),
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
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getTodos = async () => {
      const todos = await authenticatedFetch("/api/todos", {
        method: "GET",
      }).then((res) => res.json());
      dispatch({ type: "todo/init", payload: todos });
      setIsLoading(false);
    };
    getTodos();
  }, []);

  return (
    <TodoContext.Provider value={{ todos: state, isLoading }}>
      <TodoContextDispatch.Provider value={dispatch}>
        {children}
      </TodoContextDispatch.Provider>
    </TodoContext.Provider>
  );
};

const useTodos = () => {
  const context = useContext(TodoContext);
  return context.todos;
};

const useTodosLoading = () => {
  const context = useContext(TodoContext);
  return context.isLoading;
};
const useTodosDispatch = () => useContext(TodoContextDispatch);

export { TodoProvider, useTodos, useTodosDispatch, useTodosLoading };
