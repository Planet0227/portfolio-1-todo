"use client";

import List from "./List";
import Form from "./Form";
import { TodoProvider, useTodos } from "../context/TodoContext";

const Todo = () => {
  const todosList = useTodos();
  return (
    <div className="flex flex-wrap justify-start gap-4">
      {todosList.map((list) => {
        return (
          <div
            key={list.id}
            className="w-full max-w-xs p-6 bg-white rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{list.title}</h3>
              <button>→</button>
            </div>
            <List listId={list.id}/>
          </div>
        );
      })}
    </div>
  );
};

const Todos = () => {
  return (
    <div>
      <TodoProvider>
        <div className="min-h-screen p-10 bg-gray-100">
          <Todo />
          <div className="fixed w-full max-w-md transform -translate-x-1/2 bottom-4 left-1/2">
            <div className="max-w-md p-6 bg-white rounded-lg shadow-md sw-full">
              <Form />
            </div>
          </div>
        </div>
      </TodoProvider>
    </div>
  );
};

export default Todos;
