import Todos from "@/components/Todos";

export default function Home() {
  return (
   <div>
      <h3 className="p-2 text-3xl text-white bg-green-500">✓Todoアプリ</h3>
      <Todos />
   </div>
  );
}
