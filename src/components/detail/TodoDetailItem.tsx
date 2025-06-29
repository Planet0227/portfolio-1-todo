import { TaskType, useTodosDispatch } from "@/context/TodoContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef, ChangeEvent } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteTask, updateTasks } from "@/firebase/todos";
import { useAuth } from "@/context/AuthContext";

interface TodoDetailItemProps {
  tasks: TaskType[]; task: TaskType; id: string; listId: string | null; magnification: boolean;
}

const TodoDetailItem: React.FC<TodoDetailItemProps> = ({ tasks, task, id, listId, magnification }) => {
  const [editContent, setEditContent] = useState(task.content);
  const dispatch = useTodosDispatch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  //  dnd
  const {
    isDragging,
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

  const { user } = useAuth();

  const style = {
    transform: isSorting ? CSS.Translate.toString(transform) : undefined, //CSS.Translateに変更(歪み防止)
    transition,
    opacity: isDragging ? "0.6" : "",
  };

  // 削除
  const handleDeleteTodo = async () => {
    if(!listId) return;
    const taskId = task.id;
    if (!user) {
      dispatch({ type: "todo/delete", payload: { listId, taskId } });
    } else {
      try {
        await deleteTask(user.uid, listId, taskId);
      } catch (error) {
        console.error("タスク更新エラー:", error);
      }
    }
  };

  // タスク更新
  const handleUpdateContent = async (newContent: string) => {
    if(!listId) return;
    const updatedTasks = tasks.map((_todo) =>
      _todo.id === task.id ? { ..._todo, content: newContent } : _todo
    );
    if (!user) {
      dispatch({ type: "todo/update", payload: { listId, updatedTasks } });
    } else {
      try {
        await updateTasks(user.uid, listId, updatedTasks);
      } catch (error) {
        console.error("タスク更新エラー:", error);
      }
    }
  };

  // チェックボックス更新
  const handleToggleCheckBox = async () => {
    if(!listId) return;
    const updatedTasks = tasks.map((_todo) =>
      _todo.id === task.id ? { ..._todo, complete: !task.complete } : _todo
    );
    if (!user) {
      dispatch({ type: "todo/update", payload: { listId, updatedTasks } });
    } else {
      try {
        await updateTasks(user.uid, listId, updatedTasks);
      } catch (error) {
        console.error("タスク更新エラー:", error);
      }
    }
  };

  // textareaの高さの調整
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [editContent, magnification]);

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
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if(!listId) return;
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
    handleUpdateContent(editContent);
    if (editContent.trim().length === 0) {
      handleDeleteTodo();
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex w-full p-1 border-2 border-gray-400 md:p-2 rounded-lg relative bg-opacity-0 ${isDragging ? "z-10" : ""}`}
      >
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          style={{
            WebkitTouchCallout: "none", // iOS長押しメニュー無効
            WebkitUserSelect: "none", // ユーザー選択無効
            userSelect: "none",
          }}
          className="mt-1 text-lg text-gray-400 select-none cursor-grab active:cursor-grabbing hover:text-gray-600"
        >
          <FontAwesomeIcon icon={faGripLines} size="xl" />
        </div>

        <input
          type="checkbox"
          name={`todo-${task.id}-checkBox`}
          checked={task.complete}
          onChange={handleToggleCheckBox}
          className={`ml-2 w-8 h-8 mt-0.5  appearance-none cursor-pointer rounded-full border hover:bg-gray-100 select-none border-gray-300 ${task.complete
            ? "bg-green-400 border-green-400 hover:bg-green-600 before:content-['✓'] before:text-white before:text-sm before:mt-1 before:flex before:items-center before:justify-center"
            : ""
            }`}
        />

        <textarea
          ref={textareaRef}
          name={`todo-${task.id}-textarea`}
          value={editContent}
          onChange={handleContentChange} // 変更を即座に反映
          onBlur={handleContentBlur}
          className={`w-10/12 self-center text-md md:text-lg ml-2 flex-1 bg-none focus:outline-none resize-none overflow-hidden whitespace-pre-wrap break-words ${task.complete ? "line-through text-gray-500" : ""
            }`}
          rows={1} // 最小高さを1行に設定
        />

        <button
          className="self-start px-3 ml-7 text-xl font-semibold text-red-300 border-l-2 border-gray-300 hover:text-red-700"
          onClick={handleDeleteTodo}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
    </>
  );
};

export default TodoDetailItem;
