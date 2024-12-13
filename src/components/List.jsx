"use client";
// import { useTodos } from "../context/TodoContext";
import Item from "./Item";

const List = ({ todo, listId } ) => {
  // const todos = useTodos();

  return (
    <>
      {todo.map((_todo) => {
        return <Item key={_todo.id} todo={_todo} listId={listId}/>;
      })}
    </>
  );
};

export default List;
