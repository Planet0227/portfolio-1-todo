"use client";

import { useEffect, useRef, useState } from "react";
import { useTodos, useTodosDispatch } from "@/context/TodoContext";
import { addTask } from "@/firebase/todos";
import { useAuth } from "@/context/AuthContext";

interface TodoDetailItemProps {
  listId: string | null;
}

const TodoDetailForm: React.FC<TodoDetailItemProps> = ({ listId }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useTodosDispatch();
  const todos = useTodos();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { user } = useAuth();

  const handleAddTask = async () => {
    if(!listId) return;
    if (inputValue.trim() === "") return;
 

    const targetListTasks = todos.find((todo) => todo.id === listId)?.tasks || [];
    const order = targetListTasks?.length + 1;

    const newTask = {
      id: Math.floor(Math.random() * 1e7).toString(),
      content: inputValue,
      complete: false,
      order: order,
    };

    try {
      if (!user) {
        dispatch({
          type: "todo/add",
          payload: { id: listId, newTask },
        });
      } else {
        await addTask(user.uid, listId, newTask);
      }

      setInputValue("");
    } catch (error) {
      console.error("タスクの追加に失敗しました:", error);
    }
  };

  // textareaの高さの調整
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 改行を防止
      handleAddTask(); // フォーム送信
    }
  };

  return (
    <div className="flex p-1 w-full bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 rounded-lg shadow-sm">
      <form
        onSubmit={handleAddTask}
        className="flex items-center space-x-2 w-full"
      >
        {/* 追加ボタン */}
        <div className="relative">
          <button
            onClick={handleAddTask}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex justify-center items-center w-8 h-8 text-2xl text-white bg-cyan-400 rounded-full transition hover:bg-cyan-500 active:scale-95"
          >
            +
          </button>
          <div
            className={`absolute z-10 flex flex-col items-center p-1 text-xs text-gray-700 bg-white rounded-lg shadow-md top-10 left-0 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
          >
            <span>追加</span>
            <span>(Enter)</span>
          </div>
        </div>

        {/* 入力欄 */}
        <textarea
          ref={textareaRef}
          placeholder="タスクを入力"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="overflow-hidden flex-1 p-2 placeholder-gray-400 text-gray-700 whitespace-pre-wrap break-words bg-white bg-opacity-80 rounded-lg border border-gray-200 transition-all resize-none focus:bg-white focus:outline-none"
        />
      </form>
    </div>
  );
};

export default TodoDetailForm;
