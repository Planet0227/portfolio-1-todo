import { useTodosDispatch } from "@/context/TodoContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TodoDetailItem = ({ todos, todo, id, listId, isOverlay}) => {
  const [editContent, setEditContent] = useState(todo.content);
  const dispatch = useTodosDispatch();
  const textareaRef = useRef(null);

  const {
    isDragging,
    setActivatorNodeRef,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  // transformのx軸を固定して、上下の移動だけに制限
  const limitedTransform = transform
    ? { ...transform, x: 0 } // x方向の移動を0に固定
    : null;

  const style = {
    transform: CSS.Translate.toString(transform), //Translateに変更(歪み防止)
    transition,
  };
  // 削除
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
  const updateContent = async (newContent) => {
    if (newContent !== todo.content) {
      const updatedTodos = todos.map((_todo) =>
        _todo.id === todo.id ? { ..._todo, content: newContent } : _todo
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

        if (!response.ok) throw new Error("タスクを更新できませんでした。");
      } catch (error) {
        console.log(error);
      }
    }
  };

  // チェックボックス更新
  const toggleCheckBox = async () => {
    const updatedTodos = todos.map((_todo) =>
      _todo.id === todo.id ? { ..._todo, complete: !todo.complete } : _todo
    );
    dispatch({ type: "todo/update", payload: { listId, updatedTodos } });
    try {
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, updatedTodos }),
      });

      if (!response.ok) throw new Error("チェック状態を更新できませんでした。");
    } catch (error) {
      console.log(error);
    }
  };

  // textareaの高さの調整
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [editContent]);

  // ウィンドウサイズ変更時にも高さを再計算
  useEffect(() => {
    const handleResize = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    window.addEventListener("resize", handleResize); // リスナーを登録
    return () => window.removeEventListener("resize", handleResize); // クリーンアップ
  }, []);

  // onChangeイベントでリアルタイム更新
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setEditContent(newContent);
    updateContent(newContent);
  };
  // 入力が空なら削除
  const handleBlurDelete = () => {
    if (editContent.trim().length === 0) {
      deleteTodo();
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex w-full mb-2 border-gray-600 border-2 relative  ${
        isOverlay ? "opacity-80" : ""
      } ${isDragging ? "z-10" : ""}`}
      >
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600"
        >
          <FontAwesomeIcon icon={faGripLines} size="xl" />
        </div>

        <input
          type="checkbox"
          checked={todo.complete}
          onChange={toggleCheckBox}
          className={`ml-2 w-5 h-5 mt-0.5 appearance-none cursor-pointer rounded-full border hover:bg-gray-100 border-gray-300 ${
            todo.complete
              ? "bg-green-500 border-green-500 hover:bg-green-600 before:content-['✓'] before:text-white before:text-sm before:flex before:items-center before:justify-center"
              : ""
          }`}
        />

        <textarea
          ref={textareaRef}
          type="text"
          value={editContent}
          onChange={handleContentChange} // 変更を即座に反映
          onBlur={handleBlurDelete}
          className={`w-10/12 text-lg ml-2 flex-1 border-b focus:outline-none resize-none overflow-hidden whitespace-pre-wrap break-words ${
            todo.complete ? "line-through text-gray-500" : ""
          }`}
          rows={1} // 最小高さを1行に設定
        />

        <button
          className="self-start text-xl font-semibold text-red-400 ml-7 hover:text-red-700"
          onClick={deleteTodo}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
    </>
  );
};

export default TodoDetailItem;
