"use client";
import { createContext, useContext, useEffect, useReducer } from "react";

const TodoContext = createContext();
const TodoContextDispatch = createContext();

const todoReducer = (state, { type, payload }) => {
  switch (type) {
    case "todo/init":
      return payload;
    case "todo/addList":
      return [...state, payload];
    case "todo/add":
      return state.map(todoList => todoList.id === payload.id 
        ? {...todoList, todos:[...todoList.todos, payload.newTodo ]}
        : todoList
      )
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

    default:
      return state;
  }
};

const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, []); 
//jsonサーバーからTODOSリストの初期値を取得し、stateを更新
  useEffect(() => {
    const getTodos = async () => {
      const ENDPOINT = "/api/todos";
      try{
        const todos = await fetch(ENDPOINT).then((res) => res.json());
        dispatch({ type: "todo/init", payload: todos });

      }catch(error){
        console.error("Failed to fetch todos:", error);

      }
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

//        TODOS[0].todos[0].content
