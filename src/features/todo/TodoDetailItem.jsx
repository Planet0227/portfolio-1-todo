import { useState } from "react";
import { useTodosDispatch } from "@/context/TodoContext";

const TodoDetailItem = ({ todo, listId }) => {
  const [editContent, setEditContent] = useState(todo.content);
  const dispatch = useTodosDispatch();

  const changeContent = (e) => {
    setEditContent(e.target.value);
  };

  //削除
  const deleteTodo = async () => {
    dispatch({ type: "todo/delete", payload: {listId, todoId: todo.id} });
    const taskId = todo.id;
    try{
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, taskId })
      });
      if (!response.ok) throw new Error("タスクの削除に失敗しました。");

    console.log("タスクが削除されました。");
  } catch (error) {
    console.error(error);
  }
  };

  // //編集・更新
  const updateTodo = () => {
    const newTodo = {
      ...todo,
      complete: !todo.complete,
      content: editContent, // 編集中の値を反映
    };
    dispatch({ type: "todo/update", payload: newTodo });
  };

  return (
    <>
      <div className="flex w-full">
        <button className="font-semibold text-red-400" onClick={deleteTodo}>×</button>
        <input type="checkbox" checked={todo.complete} onChange={updateTodo} className="ml-2"/>
        {todo.complete ? (
          <span className="ml-2">{todo.content}</span>
        ) : (
          <input className="w-10/12 max-w-full ml-2 text-lg focus:caret-black focus:outline-none" type="text" value={editContent} onChange={changeContent} />
        )}
      </div>
    </>
  );
};
export default TodoDetailItem;