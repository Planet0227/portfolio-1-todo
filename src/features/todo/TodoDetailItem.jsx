import { useState } from "react";
import { useTodosDispatch } from "@/context/TodoContext";

const TodoDetailItem = ({ todo, listId }) => {
  const [editContent, setEditContent] = useState(todo.content);
  const dispatch = useTodosDispatch();

  const changeContent = (e) => {
    setEditContent(e.target.value);
  };

  //削除
  const deleteTodo = () => {
    dispatch({ type: "todo/delete", payload: {listId, todoId: todo.id} });
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
      <div>
        <button className="font-semibold text-red-400" onClick={deleteTodo}>×</button>
        <input type="checkbox" checked={todo.complete} onChange={updateTodo} className="ml-2"/>
        {todo.complete ? (
          <span className="ml-2">{todo.content}</span>
        ) : (
          <input className="max-w-full ml-2" type="text" value={editContent} onChange={changeContent} />
        )}

        
      </div>
    </>
  );
};
export default TodoDetailItem;