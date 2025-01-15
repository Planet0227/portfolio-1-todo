import { useState } from "react";
import { useTodosDispatch } from "@/context/TodoContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

const TodoDetailItem = ({ todos, todo, listId }) => {
  // const [editContent, setEditContent] = useState(todo.content);
  const dispatch = useTodosDispatch();



  //削除
  const deleteTodo = async () => {
    const taskId = todo.id;
    dispatch({ type: "todo/delete", payload: { listId, todoId: taskId } });

    try {
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, taskId }),
      });
      if (!response.ok) throw new Error("タスクの削除に失敗しました。");

      console.log("タスクが削除されました。");
    } catch (error) {
      console.error(error);
    }
  };

  // タスク更新
  const upudateContent = async (e) => {
    const newContent = e.target.innerText.trim();
    if (newContent.length === 0) {
      alert("最低1文字以上入力してください。");
      e.target.innerText = todo.content;
      return;
    }
    if (newContent !== todo.content) {
      
      const updatedTodos = todos.map((_todo) =>
        _todo.id === todo.id 
      ? { ..._todo, content: newContent } 
      : _todo
      );
      dispatch({
        type: "todo/update",
        payload: { listId, updatedTodos },
      });

      try {
        const response = await fetch("/api/todos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId, updatedTodos }),
        });
        // const result = await response.json();
        // console.log(result);
  
        if (!response.ok) throw new Error("タスクを更新できませんでした。");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };
  //　チェックボックス更新
  const toggleCheckBox = async () => {
    const updatedTodos = todos.map((_todo) =>
      _todo.id === todo.id 
    ? { ..._todo, complete: !todo.complete } 
    : _todo
    );
    dispatch({ type: "todo/update", payload: { listId, updatedTodos } });
    try {
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, updatedTodos }),
      });
      // const result = await response.json();
      // console.log(result);

      if (!response.ok) throw new Error("チェック状態を更新できませんでした。");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex w-full">
        <button
          className="font-semibold text-red-400 hover:text-red-700"
          onClick={deleteTodo}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
        <input
          type="checkbox"
          checked={todo.complete}
          onChange={toggleCheckBox}
          className="ml-2"
        />

        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={upudateContent}
          onKeyDown={handleKeyDown}
          className={`w-10/12 ml-2 text-lg border-b focus:outline-none ${todo.complete ? "line-through text-gray-500" : ""}`}
        >
          {todo.content}
        </span>

        {/* <input className="w-10/12 max-w-full ml-2 text-lg border-b focus:caret-black focus:outline-none" type="text" value={editContent} onChange={changeContent} /> */}
      </div>
    </>
  );
};
export default TodoDetailItem;
