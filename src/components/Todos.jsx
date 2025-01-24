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

  // 進行状況で分類
  const categorizedTodos = {
    notStarted: todos.filter(
      (todoList) =>
        todoList.todos.length === 0 ||
        todoList.todos.every((todo) => !todo.complete)
    ),
    inProgress: todos.filter(
      (todoList) =>
        todoList.todos.some((todo) => todo.complete) &&
        todoList.todos.some((todo) => !todo.complete)
    ),
    completed: todos.filter(
      (todoList) =>
        todoList.todos.length > 0 &&
        todoList.todos.every((todo) => todo.complete)
    ),
  };

  const renderSection = (category, categoryColor, todoList) => (
    <div className="w-full p-3 ">
      <div className="z-10 w-full py-1 mb-3 bg-white md:sticky top-11">
        <span
          className={` mb-3 text-lg p-1 border-1 border-white rounded-md ${categoryColor}`}
        >
          {category}
        </span>
        <span className="ml-3 text-gray-500">{todoList.length}</span>
      </div>
      <div
        className="grid grid-cols-2 gap-2 auto-rows-auto md:flex md:flex-col"
      >
        {todoList.map((todo) => (
          <div
            key={todo.id}
            onClick={() => openModal(todo.id)}
            className="p-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer max-h-40 hover:bg-gray-100"
          >
            <div className="flex items-start justify-between">
              <div
                className={`text-md font-semibold ${
                  !todo.title ? "text-gray-400" : ""
                }`}
              >
                {todo.title || "タイトル未設定"}
              </div>
              <div className="flex items-center mx-2">
                <span className="text-sm text-gray-500">{`${
                  todo.todos.filter((t) => t.complete).length
                }/${todo.todos.length}`}</span>
                <button className="text-xl text-gray-300 hover:text-gray-500">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
            <List todo={todo.todos} listId={todo.id} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 mb-40 md:p-12 md:grid-cols-3">
      {renderSection(
        "未着手",
        "bg-red-200",
        categorizedTodos.notStarted
      )}
      {renderSection(
        "実行中",
        "bg-orange-100",
        categorizedTodos.inProgress
      )}
      {renderSection(
        "完了",
        "bg-green-200",
        categorizedTodos.completed
      )}
    </div>
  );
};

const Todos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(null);

  const openModal = (id) => {
    setSelectedTodoId(id);
    setIsModalOpen(true);

    // スクロール無効化
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const closeModal = () => {
    setSelectedTodoId(null);
    setIsModalOpen(false);

    // スクロール復元
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };

  return (
    <TodoProvider>
      <div>
        <Todo openModal={openModal} />

        {!selectedTodoId && <Form />}

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <TodoDetail listId={selectedTodoId} onClose={closeModal} />
        </Modal>
      </div>
    </TodoProvider>
  );
};

export default Todos;
