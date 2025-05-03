import { useTodosDispatch } from "@/context/TodoContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getAuth } from "firebase/auth";
import { authenticatedFetch } from "@/utils/authToken";

const TodoDetailItem = ({ tasks, task, id, listId }) => {
  const [editContent, setEditContent] = useState(task.content);
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
    transform: isSorting ? CSS.Translate.toString(transform) : undefined, //CSS.Translateに変更(歪み防止)
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
    const taskId = task.id;
    dispatch({ type: "todo/delete", payload: { listId, taskId: taskId } });

    try {
      await authenticatedFetch("/api/todos", {
        method: "DELETE",
        body: JSON.stringify({ listId, taskId }),
      });
    } catch (error) {
      console.error("タスク更新エラー:", error);
    }
  };

  // タスク更新
  const updateContent = async (newContent) => {
    const updatedTasks = tasks.map((_todo) =>
      _todo.id === task.id ? { ..._todo, content: newContent } : _todo
    );
    dispatch({ type: "todo/update", payload: { listId, updatedTasks } });
    try {
      await authenticatedFetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ listId, updatedTasks }),
      });
    } catch (error) {
      console.error("タスク更新エラー:", error);
    }
  };

  // チェックボックス更新
  const toggleCheckBox = async () => {
    const updatedTasks = tasks.map((_todo) =>
      _todo.id === task.id ? { ..._todo, complete: !task.complete } : _todo
    );
    dispatch({ type: "todo/update", payload: { listId, updatedTasks } });
    try {
      await authenticatedFetch("/api/todos", {
        method: "PATCH",
        body: JSON.stringify({ listId, updatedTasks }),
      });
    } catch (error) {
      console.error("タスク更新エラー:", error);
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

    const updatedTasks = tasks.map((_todo) =>
      _todo.id === task.id ? { ..._todo, content: newContent } : _todo
    );
    dispatch({
      type: "todo/update",
      payload: { listId, updatedTasks },
    });
  };
  // 入力が空なら削除
  const handleContentBlur = () => {
    updateContent(editContent);
    if (editContent.trim().length === 0) {
      deleteTodo();
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex w-full mb-1 md:mb-2 border-gray-500 border-0 md:border-0 p-1 md:p-2 rounded-lg bg-white relative ${
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
          name={`todo-${task.id}-checkBox`}
          checked={task.complete}
          onChange={toggleCheckBox}
          className={`ml-2 w-6 h-6 mt-0.5 appearance-none cursor-pointer rounded-full border hover:bg-gray-100 select-none border-gray-300 ${
            task.complete
              ? "bg-green-500 border-green-500 hover:bg-green-600 before:content-['✓'] before:text-white before:text-sm before:mt-0.5 before:flex before:items-center before:justify-center"
              : ""
          }`}
        />

        <textarea
          ref={textareaRef}
          type="text"
          name={`todo-${task.id}-textarea`}
          value={editContent}
          onChange={handleContentChange} // 変更を即座に反映
          onBlur={handleContentBlur}
          className={`w-10/12 self-center text-md md:text-lg ml-2 flex-1 focus:outline-none resize-none overflow-hidden whitespace-pre-wrap break-words ${
            task.complete ? "line-through text-gray-500" : ""
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
