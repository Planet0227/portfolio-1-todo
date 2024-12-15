"use client";

import { useTodos, useTodosDispatch } from "@/context/TodoContext";
import { use } from "react";

export default  function TodoDetail({params}) {
  const { id } = use(params);
  const todos = useTodos();
  const dispatch = useTodosDispatch();


  //paramsは文字列なのでparseIntで数値に変換
  const targetList = todos.find((todoList) => todoList.id === parseInt(id));
  console.log(targetList);
  return(
    <div>{targetList.id}</div>
  )
};