"use client";

import { use, useEffect, useState } from "react";
import { useTodosDispatch } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";

export default function TodoDetail({ params, todos }) {
  const { id } = use(params); // paramsからidを取得

  const foundList = todos.find(
    (todoList) => String(todoList.id) === String(id)
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{foundList.title}</h1>
      <p>作成した日付: {foundList.date}</p>
      {foundList.todos.map((todo) => (
        <TodoDetailItem key={todo.id} todo={todo} />
      ))}
      <div className="fixed w-full max-w-md p-6 transform -translate-x-1/2 bg-white rounded-lg shadow-md bottom-6 left-1/2 sw-full">
        <TodoDetailForm listId={id} />
      </div>
    </div>
  );
}
