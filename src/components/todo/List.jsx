"use client";
import Item from "./Item";

const List = ({ todo, listId } ) => {
  if (todo.length === 0) {
    return <div className="text-sm text-gray-400">クリックしてタスクを追加</div>;
  }
  const sortedTodo = [...todo].sort((a, b) => a.order - b.order);
  return (
    <>
      {sortedTodo.map((_todo) => {
        return <Item key={_todo.id} todo={_todo} listId={listId}/>;
      })}
    </>
  );
};

export default List;
