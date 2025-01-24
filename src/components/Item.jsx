
const Item = ({ todo }) => {

  return (
    <div
      className="relative flex items-start w-full space-x-2"
    >
      <input
        type="checkbox"
        checked={todo.complete}
        onChange={(e) => e.stopPropagation()}
        className={`w-4 h-4 mt-0.5 appearance-none rounded-full border border-gray-300 ${
          todo.complete
            ? "bg-green-500 border-green-500 before:content-['✓'] before:text-white before:text-sm before:flex before:items-center before:justify-center"
            : ""
        }`}
      />
      <span
        className={`flex-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap ${
          todo.complete ? "line-through text-gray-500" : ""
        }`}
      >
        {todo.content}
      </span>
    </div>
  );
};

export default Item;
