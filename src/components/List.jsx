"use client";
import { useTodos } from "../context/TodoContext";
import Item from "./Item";

const List = () => {
  const todos = useTodos();

  return (
    <>
      {todos.map((todo) => {
        return <Item key={todo.id} todo={todo}/>;
      })}
    </>
  );
};

export default List;
