"use client";
import { createContext, useContext, useEffect, useReducer } from "react";
import { getAuth } from "firebase/auth";
import { authenticatedFetch } from "@/utils/auth";
const TodoContext = createContext();
const TodoContextDispatch = createContext();

const todoReducer = (state, { type, payload }) => {
  switch (type) {
    case "todo/init":
      return payload;
    case "todo/addList":
      return [...state, payload];
    case "todo/add":
      return state.map((todoList) =>
        todoList.id === payload.id
          ? { ...todoList, todos: [...todoList.todos, payload.newTodo] }
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
          ? { ...todoList, todos: payload.updatedTasks }
          : todoList
      );
    case "todo/updateList":
      return state.map((todoList) =>
        todoList.id === payload.listId
          ? { ...todoList, category: payload.updatedCategory, order: payload.updatedOrder }
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
              todos: todoList.todos.map((task) => {
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
            todos: todoList.todos.filter(
              (_todo) => _todo.id !== payload.todoId
            ),
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

  useEffect(() => {
    const getTodos = async () => {
      const todos = await authenticatedFetch("/api/todos", {
        method: "GET",
      }).then((res) => res.json());
      dispatch({ type: "todo/init", payload: todos });
    };
    getTodos();
  }, []);

  return (
    <TodoContext.Provider value={state}>
      <TodoContextDispatch.Provider value={dispatch}>
        {children}
      </TodoContextDispatch.Provider>
    </TodoContext.Provider>
  );
};

const useTodos = () => useContext(TodoContext);
const useTodosDispatch = () => useContext(TodoContextDispatch);

export { TodoProvider, useTodos, useTodosDispatch };
