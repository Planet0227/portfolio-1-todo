"use client";

import List from "./List";
import Form from "./Form";
import TodoDetail from "@/features/todo/TodoDetail";
import { TodoProvider, useTodos } from "../context/TodoContext";
import { useState } from "react";
import Modal from "./Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const Todo = ({ openModal }) => {
  const todos = useTodos();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2 border">
      {todos.map((todoList) => {
        // console.log(todoList);
        return (
          <div
            key={todoList.id}
            onClick={() => openModal(todoList.id)}
            className="p-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer max-h-48 hover:bg-gray-100"
          >
            <div className="flex items-start justify-between">
              <div
                className={`text-lg font-semibold ${
                  !todoList.title ? "text-gray-400" : ""
                }`}
              >
                {todoList.title || "タイトル未設定"}
              </div>
              <button className="text-xl text-gray-300 hover:text-gray-500">
              <FontAwesomeIcon icon={faChevronRight} />
              </button>
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
    <div className="w-full min-h-screen p-4 border-4 bg-gray-50">
      <div>
        <Todo openModal={openModal} />
      </div>

      <div className="fixed bottom-0 w-full max-w-md p-5 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl left-1/2">
        <Form />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <TodoDetail listId={selectedTodoId} onClose={closeModal} />
      </Modal>
    </div>
  </TodoProvider>
  );
};

export default Todos;
