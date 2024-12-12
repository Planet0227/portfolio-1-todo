"use client";
import { createContext, useContext, useReducer } from "react";

const TodoContext = createContext();
const TodoContextDispatch = createContext();

const TODOS = [
  {
    id: 101,
    title: "カレーの準備",
    date: "2024-12-10T07:00:00.000Z",
    todos: [
      { id: 1, content: "ジャガイモを買う", complete: false },
      { id: 2, content: "ニンジンを切る", complete: false},
      { id: 3, content: "玉ねぎを洗う", complete: false},
    ]
  },
  {
    id: 102,
    title: "家事をする",
    date: "2024-12-11T08:00:00.000Z",
    todos: [
      { id: 4, content: "洗濯をする", complete: false },
      { id: 5, content: "掃除機をかける", complete: false},
      { id: 6, content: "洗剤を詰め替える", complete: false},
    ]
  },
  {
    id: 103,
    title: "勉強する",
    date: "2024-12-12T12:00:00.000Z",
    todos: [
      { id: 7, content: "数学", complete: false },
      { id: 8, content: "国語", complete: false},
      { id: 9, content: "保健体育", complete: false},
    ]
  },
];


const todoReducer = (todos, { type, payload }) => {
  switch (type) {
    case "todo/add":
      return [...todos, payload];
    case "todo/update":
      return todos.map((_todo) =>
        _todo.id === payload.id ? { ..._todo, ...payload } : _todo
      );
    case "todo/delete":
      return todos.filter((_todo) => _todo.id !== payload);
    default:
      return todos;
  }
};

const TodoProvider = ({ children }) => {
  const [todos, dispatch] = useReducer(todoReducer, TODOS);

  return (
    <TodoContext.Provider value={todos}>
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