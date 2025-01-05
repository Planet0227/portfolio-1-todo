"use client";
import Item from "./Item";

const List = ({ todo, listId } ) => {
  return (
    <>
      {todo.map((_todo) => {
        return <Item key={_todo.id} todo={_todo} listId={listId}/>;
      })}
    </>
  );
};

export default List;
