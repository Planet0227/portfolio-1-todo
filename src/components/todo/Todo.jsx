"use client";

import List from "./List";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faLock } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCategoryInfo } from "@/utils/categories";
import ProgressBar from "./ProgressBar";



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

  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  };

  const style = {
    transform: isSorting ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? "0" : "1",
    touchAction: isDragging ? "none" : "pan-y",
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

  const getDayLabelStyle = (type) => {
    switch (type) {
      case "everyday":
        return "text-emerald-700 bg-emerald-200";
      case "weekday":
      case "mon":
      case "tue":
      case "wed":
      case "thu":
      case "fri":
        return "text-gray-700 bg-gray-200";
      case "weekend":
      case "sun":
        return "text-red-600 bg-red-200";
      case "sat":
        return "text-blue-600 bg-blue-200";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

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
        style={{
          ...style,
          WebkitTouchCallout: "none", // iOS長押しメニュー無効
          WebkitUserSelect: "none",   // ユーザー選択無効
          userSelect: "none",
        }}
        className={`bg-white border-2 relative px-2 md:px-4 py-1 rounded-xl shadow-lg shadow-emerald-100 transition-colors duration-200 cursor-pointer min-h-16 max-h-16 md:min-h-20 md:max-h-48 overflow-hidden hover:bg-gray-50 select-none ${
          selectedTodoId === todo.id ? "border-sky-500" : "border-gray-100"
        }`}
      >
        <div>
          <div className="flex">
            {/* カテゴリーバー */}
            <div
              className={`${category.styles.baseColor} w-1 h-3 flex items-center p-1 rounded-md absolute left-2 top-0.5  md:top-2 gap-2`}
            >
            </div>
            {todo.lock && (
              <FontAwesomeIcon
                icon={faLock}
                className="absolute flex items-center h-3 gap-2 px-2 text-gray-600 rounded-md md:text-base md:h-4 right-2 top-1 md:top-2"
              />
            )}
            {/* リセット曜日 */}
            {activeResetDays.length > 0 && (
              <div className="absolute flex flex-wrap items-center gap-1 top-1 md:top-2 left-6">
                {resetLabels.map(({ label, type }) => (
                  <span
                    key={label}
                    className={`px-1 text-[8px] md:text-xs font-semibold rounded-full 
                  ${getDayLabelStyle(type)}`}
                  >
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* タイトルと進捗 */}
          <div className="flex items-start justify-between mt-4 md:mt-6">
            <div
              className={`text-[9px] md:text-base font-semibold truncate ${
                !todo.title ? "text-gray-400" : "text-gray-800"
              }`}
              title={todo.title}
            >
              {todo.title || "タイトル未設定"}
            </div>

            <div className="flex items-center space-x-1">
              <div className="px-1 md:px-2 py-0.5 text-[10px] md:text-sm text-gray-500 bg-gray-50 rounded-full">
                {`${todo.tasks.filter((t) => t.complete).length}/${
                  todo.tasks.length
                }`}
              </div>
              <button className="text-[10px] text-gray-400 transition-colors hover:text-blue-500 md:text-base">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>

          {/* 進捗バー */}
          <ProgressBar tasks={todo.tasks} />

          {/* Todoリスト */}
          {!isTouchDevice() && (
            <div className="mt-1">
              <List todo={todo.tasks} listId={todo.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Todo;
