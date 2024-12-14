"use client";
import { createContext, useContext, useReducer } from "react";

const TodoContext = createContext();
const TodoContextDispatch = createContext();

const TODOS = [
  {
    id: 101,
    title: "カレーの準備",
    date: "2024/12/08 09:12:36",
    todos: [
      { id: 1, content: "ジャガイモを買う", complete: false },
      { id: 2, content: "ニンジンを切る", complete: false },
      { id: 3, content: "玉ねぎを洗う", complete: false },
    ],
  },
  {
    id: 102,
    title: "家事をする",
    date: "2024/12/10 08:54:32",
    todos: [
      { id: 4, content: "洗濯をする", complete: false },
      { id: 5, content: "掃除機をかける", complete: false },
      { id: 6, content: "洗剤を詰め替える", complete: false },
    ],
  },
  {
    id: 103,
    title: "勉強する",
    date: "2024/12/12 13:09:59",
    todos: [
      { id: 7, content: "数学", complete: false },
      { id: 8, content: "国語", complete: false },
      { id: 9, content: "保健体育", complete: false },
    ],
  },
];

const todoReducer = (state, { type, payload }) => {
  switch (type) {
    case "todo/addList":
      return [...state, payload];
    case "todo/add":
      return [...state, payload];
    case "todo/update":
      return state.map((_todo) =>
        _todo.id === payload.id ? { ..._todo, ...payload } : _todo
      );
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
    case "todo/selected":
      return;
    default:
      return state;
  }
};

const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, TODOS);

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

//        TODOS[0].todos[0].content
