import { useTodosDispatch } from "@/context/TodoContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getAuth } from "firebase/auth";

const TodoDetailItem = ({ todos, todo, id, listId,  }) => {
  const [editContent, setEditContent] = useState(todo.content);
  const dispatch = useTodosDispatch();
  const textareaRef = useRef(null);

  //  dnd
  const {
    isOver,
    isDragging,
    activeIndex,
    overIndex,
    isSorting,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    attributes,
    listeners,
  } = useSortable({
    id,
  });

  const style = {
    transform: isSorting ?  CSS.Translate.toString(transform) : undefined, //CSS.Translateに変更(歪み防止)
    transition,
    opacity: !isDragging && isSorting ? "0.6" : "",
  };

  // const sortDirection =
  //   activeIndex > overIndex
  //     ? "before"
  //     : activeIndex < overIndex
  //     ? "after"
  //     : null;

  // const isShowIndicator = isOver && sortDirection != null;

  // 削除
  const deleteTodo = async () => {
    const taskId = todo.id;
    dispatch({ type: "todo/delete", payload: { listId, todoId: taskId } });

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("ユーザーが認証されていません");
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // トークンをヘッダーにセット
        },
        body: JSON.stringify({ listId, taskId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "タスクの削除に失敗しました。");
      }
      console.log("タスクが削除されました。");
    } catch (error) {
      console.error("エラー:", error);
    }

    
  };

  // タスク更新
  const updateContent = async (newContent) => {
    if (newContent !== todo.content) {
      const updatedTasks = todos.map((_todo) =>
        _todo.id === todo.id ? { ..._todo, content: newContent } : _todo
      );
      dispatch({
        type: "todo/update",
        payload: { listId, updatedTasks },
      });

      //auth
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("ユーザーが認証されていません");
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/todos", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // トークンをヘッダーにセット
          },
          body: JSON.stringify({ listId, updatedTasks }),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "タスクを更新できませんでした。");
        }
      } catch (error) {
        console.error("エラー:", error);
      }
      
    }
  };

  // チェックボックス更新
  const toggleCheckBox = async () => {
    const updatedTasks = todos.map((_todo) =>
      _todo.id === todo.id ? { ..._todo, complete: !todo.complete } : _todo
    );
    dispatch({ type: "todo/update", payload: { listId, updatedTasks } });
    //auth
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("ユーザーが認証されていません");
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // トークンをヘッダーにセット
        },
        body: JSON.stringify({ listId, updatedTasks }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "チェック状態を更新できませんでした。");
      }
    } catch (error) {
      console.error("エラー:", error);
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
  const handleBlur = () => {
    if (editContent.trim().length === 0) {
      deleteTodo();
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex w-full mb-2 border-gray-500 border-2 p-2 rounded-lg bg-white relative ${
          isDragging ? "z-10" : ""
        }  `}
      >
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="text-lg text-gray-400 select-none cursor-grab active:cursor-grabbing hover:text-gray-600"
        >
          <FontAwesomeIcon icon={faGripLines} size="xl" />
        </div>

        <input
          type="checkbox"
          name={`todo-${todo.id}-checkBox`}
          checked={todo.complete}
          onChange={toggleCheckBox}
          className={`ml-2 w-6 h-6 mt-0.5 appearance-none cursor-pointer rounded-full border hover:bg-gray-100 select-none border-gray-300 ${
            todo.complete
              ? "bg-green-500 border-green-500 hover:bg-green-600 before:content-['✓'] before:text-white before:text-sm before:mt-0.5 before:flex before:items-center before:justify-center"
              : ""
          }`}
        />

        <textarea
          ref={textareaRef}
          type="text"
          name={`todo-${todo.id}-textarea`}
          value={editContent}
          onChange={handleContentChange} // 変更を即座に反映
          onBlur={handleBlur}
          className={`w-10/12 self-center text-lg ml-2 flex-1 focus:outline-none resize-none overflow-hidden whitespace-pre-wrap break-words ${
            todo.complete ? "line-through text-gray-500" : ""
          }`}
          rows={1} // 最小高さを1行に設定
        />

        <button
          className="self-start px-3 text-xl font-semibold text-red-400 border-l-2 border-gray-300 ml-7 hover:text-red-700"
          onClick={deleteTodo}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
    </>
  );
};

export default TodoDetailItem;

