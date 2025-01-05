import { useState } from "react";
// import { useTodosDispatch } from "../context/TodoContext";

const TodoDetailItem = ({ todo }) => {
  const [editContent, setEditContent] = useState(todo.content);
  // const dispatch = useTodosDispatch();

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
        <input type="checkbox" checked={todo.complete} onChange={updateTodo} />
        {todo.complete ? (
          <span className="ml-2">{todo.content}</span>
        ) : (
          <input className="ml-2" type="text" value={editContent} onChange={changeContent} />
        )}

        <button className="border border-gray-500 rounded" onClick={deleteTodo}>削除</button>
      </div>
    </>
  );
};
export default TodoDetailItem;