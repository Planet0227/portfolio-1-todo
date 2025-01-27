import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform), // 動的な変形
        transition: transition || undefined, // 動的なアニメーション
        zIndex: isDragging ? 10 : "auto", // ドラッグ中は前面に表示
      }}
      className={`p-4 bg-white shadow-md rounded-md border hover:shadow-lg ${
        isDragging ? "opacity-75 cursor-grabbing" : "cursor-grab"
      }`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
