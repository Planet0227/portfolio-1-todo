import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Todo from "./Todo";
const TodoColmun = ({ category, todoList, openModal }) => {
  const { setNodeRef } = useDroppable({ id: category });

  let categoryColor = "";
  switch (category) {
    case "completed":
      categoryColor = "bg-green-200";
      break;
    case "inProgress":
      categoryColor = "bg-orange-100";
      break;
    case "notStarted":
      categoryColor = "bg-red-200";
      break;
  }

  let categoryTitle = "";
  switch (category) {
    case "completed":
      categoryTitle = "完了";
      break;

    case "inProgress":
      categoryTitle = "実行中";
      break;
    case "notStarted":
      categoryTitle = "未着手";
      break;
  }

  return (
    <>
      <div
        className={`z-10 w-full py-1 border-b-2 border-gray-500 mb-3 bg-white md:sticky top-11 `}
      >
        <div>
          <span
            className={`p-1 mb-3 text-lg border-white rounded-md border-1 ${categoryColor}`}
          >
            {categoryTitle}
          </span>
          <span className="ml-3 text-gray-500">{todoList.length}</span>
        </div>
      </div>
      <SortableContext
        id={category}
        items={todoList}
        strategy={verticalListSortingStrategy}
      >
        {/* paddingを付けて範囲を確保しないとDragイベント時にColumnIdが返らない */}
        <div
          ref={setNodeRef}
          className="grid grid-cols-2 gap-4 p-4 bg-gray-100 border rounded-lg auto-rows-auto md:flex md:flex-col"
        >
          {todoList.map((todo) => (
            <Todo key={todo.id} todo={todo} openModal={openModal} />
          ))}
        </div>
      </SortableContext>
    </>
  );
};

export default TodoColmun;
