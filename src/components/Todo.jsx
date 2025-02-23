"use client";

import List from "./List";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Todo = ({ openModal, selectedTodoId, todo, isOverlay }) => {
  //  dnd
  const {
    isOver,
    activeIndex,
    overIndex,
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

  const transitionDuration = isDragging ? "0s" : "0.5s";
  const style = {
    transform: isSorting ? CSS.Translate.toString(transform) : undefined, //Translateに変更(歪み防止)
    transition: `opacity ${transitionDuration} ease`,
    opacity: isDragging ? "0" : "1",
  };

  const sortDirection =
    activeIndex > overIndex
      ? "before"
      : activeIndex < overIndex
      ? "after"
      : null;

  const isShowIndicator = isOver && sortDirection != null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-10" : ""}`}

      // ${isShowIndicator ? "after:absolute after:w-full after:left-0 after:h-[5px] after:rounded-full after:bg-blue-500" : ""
      // } ${sortDirection === "before" ? "after:top-[-8.5px]" : ""} ${
      //   sortDirection === "after" ? "after:bottom-[-8.5px]" : ""
      // }
    >
      <div
        data-todo
        onClick={() => openModal(todo.id)}
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={`p-4 overflow-hidden bg-white border-2 ${
          selectedTodoId === todo.id ? "border-blue-500" : "border-gray-300"
        }  rounded-lg shadow-sm cursor-pointer max-h-40 hover:bg-gray-100
      `}
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
