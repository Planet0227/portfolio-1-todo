"use client";

import List from "./List";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Todo = ({ openModal, todo }) => {
  //  dnd
  const {
    isDragging,
    isSorting,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    attributes,
    listeners,
  } = useSortable({
    id: todo.id,
  });

  const style = {
  transform: isSorting? undefined :CSS.Translate.toString(transform) ,
};


  return (

    <div ref={setNodeRef}
    style={style}
    className={`relative ${isDragging ? "z-10" : ""}`}
  >
      <div
        onClick={() => openModal(todo.id)}
        ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
        className="p-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer max-h-40 hover:bg-gray-100"
      >
        <div className="flex items-start justify-between">
          <div
            className={`text-md font-bold ${
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
    </div>
  );
};

export default Todo;
