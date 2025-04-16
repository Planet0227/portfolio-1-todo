import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Todo from "./Todo";
import { getCategoryInfo } from "@/utils/categories";
import useMediaQuery from "@/hooks/useMediaQuery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TodoColmun = ({ category, todoList, openModal, selectedTodoId }) => {
  const { setNodeRef } = useDroppable({ id: category });

  const isMobile = useMediaQuery("(max-width: 768px)");
  const strategy = isMobile ? rectSortingStrategy : verticalListSortingStrategy;


  return (
    <>
      <div
        className={`z-20 w-full pb-1 md:pt-7 border-b-2 border-gray-400 mb-3 bg-white md:sticky top-14  `}
      >
        <div className="flex items-center">
          <div
            className={`items-center flex px-3 py-1 rounded-md gap-2 ${
              getCategoryInfo(category).styles.baseColor
            }`}
          >
            <FontAwesomeIcon icon={getCategoryInfo(category).icon} className="text-white drop-shadow-lg" />
            <span className="text-sm font-semibold text-white drop-shadow-lg w-[3em] text-center">
              {getCategoryInfo(category).title}
            </span>
          </div>
          <span className="ml-3 text-gray-500">{todoList.length}</span>
        </div>
      </div>
      <SortableContext id={category} items={todoList} strategy={strategy}>
        {/* gapがあるとちらつく&無限ループエラー */}
        <div
          ref={setNodeRef}
          className="grid grid-cols-2 p-3 pb-10 bg-gray-100 bg-opacity-50 rounded-lg min-h-32 md:min-h-screen auto-rows-auto md:flex md:flex-col"
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

export default TodoColmun;
