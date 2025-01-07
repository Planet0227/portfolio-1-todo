"use client";

import List from "./List";
import Form from "./Form";
import TodoDetail from "@/features/todo/TodoDetail";
import { TodoProvider, useTodos } from "../context/TodoContext";
import { useState } from "react";
import Modal from "./Modal";

const Todo = ({ openModal }) => {
  const todos = useTodos();
  
  return (
    <div className="flex flex-wrap gap-4">
      {todos.map((todoList) => {
        // console.log(todoList);
        return (
          <div
            key={todoList.id}
            onClick={() => openModal(todoList.id)}
            className="w-full max-w-xs p-6 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{todoList.title}</h3>
              <button className="text-blue-400 shrink-0">編集</button>
            </div>
            <List todo={todoList.todos} listId={todoList.id} />
          </div>
        );
      })}
    </div>
  );
};

const Todos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(null);

  const openModal = (id) => {
    setSelectedTodoId(id); // モーダルを開く
    
      setIsModalOpen(true);
    
  };

  const closeModal = () => {
      setSelectedTodoId(null); // モーダルを閉じる
      setIsModalOpen(false);
    
  };

  return (
    <TodoProvider>
      <div  className="min-h-screen p-10 bg-orange-100">
        <Todo openModal={openModal} />

        <div className="fixed w-full max-w-md p-6 transform -translate-x-1/2 bg-white rounded-lg shadow-md bottom-6 left-1/2 sw-full">
          <Form />
        </div>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <TodoDetail listId={selectedTodoId} onClose={closeModal}/>
        </Modal>
      </div>
    </TodoProvider>
  );
};

export default Todos;
