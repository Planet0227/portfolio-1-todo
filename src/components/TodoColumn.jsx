import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from "@dnd-kit/sortable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getCategoryStyles, getCategoryTitle, getCategoryIcon } from "@/constants/categories";
import { useState } from "react";
import TodoItem from "./TodoItem";

const TodoColumn = ({ category, todoList, openModal, selectedTodoId }) => {
  const { setNodeRef } = useDroppable({ id: category });
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const strategy = isMobile ? rectSortingStrategy : verticalListSortingStrategy;
  
  const isEmpty = todoList.length === 0;

  return (
    <div 
      className="flex flex-col flex-1 h-full min-w-[300px] px-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`p-3 mb-4 rounded-lg shadow-sm transition-colors duration-200 ${
          getCategoryStyles(category, { 
            isHovered,
            includeBorder: true 
          })
        }`}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-bold">{getCategoryTitle(category)}</h2>
          <span className="ml-auto text-sm text-gray-600">
            {todoList.length}件
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-2 rounded-lg transition-all ${
          isEmpty ? "bg-gray-50" : "bg-white"
        }`}
      >
        <SortableContext items={todoList.map((todo) => todo.id)} strategy={strategy}>
          {isEmpty ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400 border-2 border-dashed rounded-lg">
              タスクをドラッグ＆ドロップで追加
            </div>
          ) : (
            <div className="space-y-2">
              {todoList.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onClick={() => openModal(todo.id)}
                  isSelected={selectedTodoId === todo.id}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default TodoColumn; 