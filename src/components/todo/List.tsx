"use client";

import { TaskType } from "@/context/TodoContext";
import Item from "./Item";
interface ListProps {
  tasks: TaskType[];
}

const List: React.FC<ListProps> = ({ tasks } ) => {
  if (tasks.length === 0) {
    return <div className="text-sm text-gray-400">クリックしてタスクを追加</div>;
  }
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
  return (
    <>
      {sortedTasks.map((_task) => {
        return <Item key={_task.id} task={_task}/>;
      })}
    </>
  );
};

export default List;
