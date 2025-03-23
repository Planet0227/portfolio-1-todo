"use client";

import List from "./List";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Todo = ({ openModal, selectedTodoId, todo, isOverlay }) => {
  const {
    isOver,
    activeIndex,
    overIndex,
    isDragging,
    isSorting,
    setNodeRef,
    transform,
    setActivatorNodeRef,
    attributes,
    listeners,
  } = useSortable({
    id: todo.id,
  });

  const transitionDuration = isDragging ? "0s" : "0.5s";
  const style = {
    transform: isSorting ? CSS.Translate.toString(transform) : undefined,
    transition: `opacity ${transitionDuration} ease`,
    opacity: isDragging ? "0" : "1",
  };

  // 曜日の配列定義
  const days = [
    { key: "sun", label: "日" },
    { key: "mon", label: "月" },
    { key: "tue", label: "火" },
    { key: "wed", label: "水" },
    { key: "thu", label: "木" },
    { key: "fri", label: "金" },
    { key: "sat", label: "土" },
  ];

  // todo.resetDaysが存在する場合、true の曜日だけ抽出
  const activeResetDays = days.filter((day) => todo.resetDays && todo.resetDays[day.key]);

  return (
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? "z-10" : ""}`}>
      <div
        data-todo
        onClick={() => (isOverlay ? "" : openModal(todo.id))}
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={`p-4 bg-white border-2 rounded-lg max-h-48 overflow-hidden shadow-sm cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
          selectedTodoId === todo.id ? "border-blue-500" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className={`text-lg font-semibold ${!todo.title ? "text-gray-400" : "text-gray-800"}`}>
            {todo.title || "タイトル未設定"}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{`${todo.todos.filter((t) => t.complete).length}/${todo.todos.length}`}</span>
            <button className="text-xl text-gray-400 hover:text-gray-600">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
        {activeResetDays.length > 0 && (
          <div className="p-1 mt-1 text-xs bg-gray-100 rounded text-sky-500">
            {activeResetDays.map((day) => day.label).join("、")} 
          </div>
        )}
        <div className="mt-1">
          <List todo={todo.todos} listId={todo.id} />
        </div>
      </div>
    </div>
  );
};

export default Todo;
