"use client";
import { createContext, useContext, useReducer } from "react";

const TodoContext = createContext();
const TodoContextDispatch = createContext();


const TODOS = [
  {
    id: 1,
    content: "ジャガイモを買う",
    complete: false
  },
  {
    id: 2,
    content: "ニンジンを切る",
    complete: false
  },
  {
    id: 3,
    content: "玉ねぎを洗う",
    complete: false
  },
];

const todoReducer = (todos, {type, payload}) => {
    switch(type){
      case "todo/add":
        return [...todos, payload];
      case "todo/update":
        return  todos.map((_todo) =>
            _todo.id === payload.id ? { ..._todo, ...payload } : _todo
          )
      case "todo/delete":
        return todos.filter((_todo) => _todo.id !== payload);
      default :
        return todos;
    }
}

const TodoProvider = ({ children }) => {
    const [todos, dispatch ] = useReducer(todoReducer, TODOS);

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

export { TodoProvider, useTodos, useTodosDispatch  }