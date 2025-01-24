import Todos from "@/components/Todos";

export default function Home() {
  return (
   <div>
      <h3 className="sticky top-0 z-20 w-full p-1 text-3xl text-white bg-green-500">✓Todoアプリ</h3>
      <Todos />
   </div>
  );
}
