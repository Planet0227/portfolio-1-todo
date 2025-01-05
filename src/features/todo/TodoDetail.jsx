"use client";

import { useTodos } from "@/context/TodoContext";
import TodoDetailItem from "./TodoDetailItem";
import TodoDetailForm from "./TodoDetailForm";

export default function TodoDetail({ listId }) {

  const todos = useTodos();
  const foundList = todos.find(
    (todoList) => todoList.id === listId
  );
  if (todos.length === 0) {
    return (
    <div>Todoリストを読み込んでいます...</div>
  );
  }

  if (!foundList) {
    return <div>指定されたTodoリストは見つかりませんでした。</div>;
  }


  return (
    <div className="w-full h-full px-5 py-2 bg-white shadow-lg ">
      
      <h1 className="text-2xl font-bold">{foundList.title}</h1>
      <p>作成した日付: {foundList.date}</p>
      {foundList.todos.map((todo) => (
        <TodoDetailItem key={todo.id} todo={todo} />
      ))}
      <div className="my-5">
        <TodoDetailForm listId={listId} />
      </div>
    </div>
  );
}
