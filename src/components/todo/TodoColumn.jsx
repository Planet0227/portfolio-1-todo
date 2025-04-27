import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Todo from "./Todo";
import useMediaQuery from "@/hooks/useMediaQuery";
import CategoryHeader from "../common/CategoryHeader";

const TodoColumn = ({ category, todoList, openModal, selectedTodoId }) => {
  const { setNodeRef } = useDroppable({ id: category });

  const isMobile = useMediaQuery("(max-width: 768px)");
  const strategy = isMobile ? rectSortingStrategy : verticalListSortingStrategy;

  return (
    <>
      <div
        className={`z-20 w-full pb-1 md:pt-7 border-b-2 border-gray-400 mb-3 bg-white `}
      >
        <div className="flex items-center rounded-md">
          <CategoryHeader category={category} className="rounded-md" disableHover={true} />
          <span className="ml-3 text-gray-500">{todoList.length}</span>
        </div>
      </div>
      <SortableContext id={category} items={todoList} strategy={strategy}>
        {/* gapがあるとちらつく&無限ループエラー */}
        <div
          ref={setNodeRef}
          className="grid grid-cols-2 p-3 bg-gray-100 bg-opacity-50 rounded-lg min-h-32 md:min-h-screen auto-rows-auto md:flex md:flex-col"
        >
          {todoList.map((todo) => (
            <Todo
              key={todo.id}
              todo={todo}
              selectedTodoId={selectedTodoId}
              openModal={openModal}
            />
          ))}
        </div>
      </SortableContext>
    </>
  );
};

export default TodoColumn;
