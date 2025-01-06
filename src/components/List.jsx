"use client";
import Item from "./Item";

const List = ({ todo, listId } ) => {
  if (todo.length === 0) {
    return <div className="text-blue-500">Todoを追加しましょう！</div>;
  }
  return (
    <>
      {todo.map((_todo) => {
        return <Item key={_todo.id} todo={_todo} listId={listId}/>;
      })}
    </>
  );
};

export default List;
