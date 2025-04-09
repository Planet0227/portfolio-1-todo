import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Todo from "./Todo";
import { getCategoryInfo } from "@/utils/categories";
import useMediaQuery from "@/hooks/useMediaQuery";

const TodoColmun = ({ category, todoList, openModal ,selectedTodoId }) => {
  const { setNodeRef } = useDroppable({ id: category });

  const isMobile = useMediaQuery("(max-width: 768px)");
  const strategy = isMobile ? rectSortingStrategy : verticalListSortingStrategy;

  return (
    <>
      <div
        className={`z-20 w-full pb-1 pt-7 border-b-2 border-gray-400 mb-3 bg-white md:sticky top-14  `}
      >
        <div>
          <span
            className={`p-1 mb-3 text-lg border-white rounded-md border-1 ${getCategoryInfo(category).styles.baseColor}`}
          >
            {getCategoryInfo(category).title}
          </span>
          <span className="ml-3 text-gray-500">{todoList.length}</span>
        </div>
      </div>
      <SortableContext
        id={category}
        items={todoList}
        strategy={strategy}
      >
        {/* gapがあるとちらつく&無限ループエラー */}
        <div
          ref={setNodeRef}
          className="grid grid-cols-2 p-3 bg-gray-100 bg-opacity-50 rounded-lg min-h-28 md:min-h-screen auto-rows-auto md:flex md:flex-col"
        >
          {todoList.map((todo) => (
            <Todo key={todo.id} todo={todo} selectedTodoId={selectedTodoId} openModal={openModal} />
          ))}
        </div>
      </SortableContext>
    </>
  );
};

export default TodoColmun;
