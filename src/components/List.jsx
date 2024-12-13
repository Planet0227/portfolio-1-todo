"use client";
// import { useTodos } from "../context/TodoContext";
import Item from "./Item";

const List = ({todo}) => {
  // const todos = useTodos();

  return (
    <>
      {todo.map((_todo) => {
        return <Item key={_todo.id} todo={_todo}/>;
      })}
    </>
  );
};

export default List;
