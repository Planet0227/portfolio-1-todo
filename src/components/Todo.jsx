"use client";

import List from "./List";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faLock } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCategoryInfo } from "@/utils/categories";

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

  const days = [
    { key: "sun", label: "日" },
    { key: "mon", label: "月" },
    { key: "tue", label: "火" },
    { key: "wed", label: "水" },
    { key: "thu", label: "木" },
    { key: "fri", label: "金" },
    { key: "sat", label: "土" },
  ];

  const activeResetDays = days.filter((day) => todo.resetDays[day.key]);

  const resetDayKeys = activeResetDays.map((day) => day.key);

  const isWeekdays = ["mon", "tue", "wed", "thu", "fri"].every((d) =>
    resetDayKeys.includes(d)
  );
  const isWeekend = ["sat", "sun"].every((d) => resetDayKeys.includes(d));
  const isEveryday = days.every((d) => resetDayKeys.includes(d.key));

  // 複合表示用配列
  const resetLabels = [];

  //全部true "毎日"
  if (isEveryday) {
    resetLabels.push({ label: "毎日", type: "everyday" });
  } else {
    if (isWeekdays) {
      resetLabels.push({ label: "平日", type: "weekday" });
    } else {
      ["mon", "tue", "wed", "thu", "fri"].forEach((key) => {
        if (resetDayKeys.includes(key)) {
          const label = days.find((d) => d.key === key)?.label;
          resetLabels.push({ label, type: key }); // ← 各曜日をtypeとして使う
        }
      });
    }

    if (isWeekend) {
      resetLabels.push({ label: "週末", type: "weekend" });
    } else {
      ["sat", "sun"].forEach((key) => {
        if (resetDayKeys.includes(key)) {
          const label = days.find((d) => d.key === key)?.label;
          resetLabels.push({ label, type: key });
        }
      });
    }
  }

  const category = getCategoryInfo(todo.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-10" : ""}`}
    >
      <div
        data-todo
        onClick={() => (isOverlay ? "" : openModal(todo.id))}
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={`bg-white border-2 relative px-4 py-1 rounded-xl shadow transition-colors duration-200 cursor-pointer min-h-32 max-h-32 md:min-h-20 md:max-h-48 overflow-hidden hover:bg-gray-50 ${
          selectedTodoId === todo.id ? "border-sky-500" : "border-gray-100"
        }`}
      >
        <div>
          <div className="flex">
            {/* カテゴリーバー */}
            <div
              className={`${category.styles.baseColor} h-4 flex items-center p-1 rounded-md absolute left-4 top-2 gap-2`}
            >
              <FontAwesomeIcon
                icon={category.icon}
                className="text-xs text-white drop-shadow-lg"
              />
            </div>
            {/* リセット曜日 */}
            {todo.lock && (
              <FontAwesomeIcon
                icon={faLock}
                className="absolute flex items-center h-4 gap-2 px-2 text-gray-600 rounded-md right-4 top-2"
              />
            )}
            {activeResetDays.length > 0 && (
              <div className="absolute flex flex-wrap items-center gap-1 mt-1 left-10">
                {resetLabels.map(({ label, type }) => (
                  <span
                    key={label}
                    className={`px-1 text-xs font-semibold rounded-full 
                   ${
                     type === "everyday"
                       ? "text-emerald-700 bg-emerald-200"
                       : type === "weekday"
                       ? "text-gray-600 bg-gray-200"
                       : type === "mon" ||
                         type === "tue" ||
                         type === "wed" ||
                         type === "thu" ||
                         type === "fri"
                       ? "text-gray-600 bg-gray-200"
                       : type === "sat"
                       ? "text-blue-600 bg-blue-200"
                       : type === "sun" || type === "weekend"
                       ? "text-red-600 bg-red-200"
                       : "text-gray-600 bg-gray-200"
                   }`}
                  >
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* タイトルと進捗 */}
          <div className="flex items-start justify-between mt-6">
            <div
              className={`text-sm md:text-base font-semibold ${
                !todo.title ? "text-gray-400" : "text-gray-800"
              }`}
            >
              {todo.title || "タイトル未設定"}
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-2 py-0.5 text-sm text-gray-500 bg-gray-50 rounded-full">
                {`${todo.tasks.filter((t) => t.complete).length}/${
                  todo.tasks.length
                }`}
              </div>
              <button className="text-gray-400 transition-colors hover:text-blue-500">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>

          {/* Todoリスト */}
          <div className="mt-1">
            <List todo={todo.tasks} listId={todo.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo;
