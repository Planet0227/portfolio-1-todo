"use client";

import List from "../todo/List";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faLock } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCategoryInfo } from "@/utils/categories";
import ProgressBar from "../todo/ProgressBar";
import ProgressBadge from "../todo/ProgressBadge ";
import ResetLabels from "../todo/ResetLabels";
import type { TodoListType } from "@/context/TodoContext";


interface TodoProps {
  todo: TodoListType;
  isOverlay?: boolean;
  openModal?: (id: string) => void;
  selectedTodoId?: string | null;
}


const Todo: React.FC<TodoProps> = ({ openModal, selectedTodoId, todo, isOverlay }) => {
  const {
    isDragging,
    isSorting,
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
  } = useSortable({
    id: todo.id,
  });

  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  };

  const style = {
    transform: isSorting ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? "0" : isOverlay ? "0.6" : "1",
    touchAction: isDragging ? "none" : "pan-y",
    transition,
  };

  const category = getCategoryInfo(todo.category);

  return (
    <div
      data-todo
      onClick={() => !isOverlay && openModal?.(todo.id)}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        ...style,
        WebkitTouchCallout: "none", // iOS長押しメニュー無効
        WebkitUserSelect: "none", // ユーザー選択無効
        userSelect: "none",
      }}
      className={`
    relative
    ${isDragging ? "z-10" : ""}
    bg-white
    border
    px-4 py-2
    rounded-2xl
    shadow-sm
    transition-all duration-200
    cursor-pointer
    min-h-16  max-h-16 md:min-h-16 md:max-h-48
    overflow-hidden
    hover:bg-gray-50
    hover:shadow-md
    select-none
    ${selectedTodoId === todo.id ? "ring-4 ring-offset-1 ring-sky-300" : ""}
  `}
    >
      {/* カード内のコンテンツはそのまま */}
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <div className="flex items-center space-x-1 md:space-x-2">
          <div
            className={`${category.styles.baseColor} w-1 h-3 rounded-full`}
          />
          {todo.lock && (
            <FontAwesomeIcon
              icon={faLock}
              className="absolute top-2 right-6 items-center h-3 text-gray-600 rounded-md md:text-base md:h-4 md:right-8"
            />
          )}
          {Object.values(todo.resetDays).some(Boolean) && (
            <ResetLabels resetDays={todo.resetDays} />
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-1 md:mb-2">
        <div
          className={`text-[9px] md:text-sm font-semibold truncate ${
            todo.title ? "text-gray-800" : "text-gray-400"
          }`}
          title={todo.title || "タイトル未設定"}
        >
          {todo.title || "タイトル未設定"}
        </div>
        
        <div className="flex gap-1 items-center">
          <ProgressBadge tasks={todo.tasks} />
          <button className="text-[10px] text-gray-400 transition-colors hover:text-blue-500 md:text-base">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      <ProgressBar tasks={todo.tasks} />

      {!isTouchDevice() && (
        <div className="mt-2">
          <List tasks={todo.tasks} />
        </div>
      )}
    </div>
  );
};

export default Todo;
