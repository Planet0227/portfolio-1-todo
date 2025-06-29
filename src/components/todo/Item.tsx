"use client";

import { TaskType } from "@/context/TodoContext";

interface ItemProps {
  task: TaskType;
}

const Item: React.FC<ItemProps> = ({ task }) => {

  return (
    <div
      className="relative flex items-start w-full space-x-2 mb-0.5"
    >
      <input
        type="checkbox"
        name={`todo-${task.id}`}
        checked={task.complete}
        onChange={(e) => e.stopPropagation()}
        className={`w-4 h-4 appearance-none relative rounded-full border border-gray-300 ${
          task.complete
            ? "bg-green-400 border-green-400 before:absolute before:content-['✓'] before:inset-0 before:top-0.5 before:text-white before:text-xs before:md:text-sm before:flex before:items-center before:justify-center"
            : ""
        }`}
      />
      <span
        className={`flex-1 text-xs md:text-xs overflow-hidden text-ellipsis whitespace-nowrap ${
          task.complete ? "line-through text-gray-500" : ""
        }`}
      >
        {task.content}
      </span>
    </div>
  );
};

export default Item;
