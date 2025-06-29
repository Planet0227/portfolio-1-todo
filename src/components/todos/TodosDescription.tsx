import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export const TodosDescription = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div onClick={() => setIsExpanded(!isExpanded)} className={`absolute cursor-pointer -top-2 z-20 right-0 p-1 bg-white  rounded-xl transition-all duration-500 ease-in-out transform  ${
        isExpanded ? 'max-h-96 w-full md:w-96 scale-100 rotate-0 opacity-95 border-4 border-gray-400' : 'max-h-12 w-32 scale-80'
      }`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 md:text-xl">How to</h2>
        <button
          className="p-1 text-gray-600 transition hover:text-gray-900"
        >
          <FontAwesomeIcon icon={isExpanded ? faAngleUp : faAngleDown} size="sm" className="shadow"/>
        </button>
      </div>

      <div
        className={`transition-all duration-[1s] ease-in-out overflow-hidden ${
          isExpanded ? "opacity-100 scale-100" : "max-h-0 opacity-0 scale-80"
        }`}
      >
        <div className="flex flex-col gap-2 text-gray-700">
          <section className="border-t ">
            <h3 className="text-base font-semibold md:text-lg">◇ リストの追加</h3>
            <p className="text-sm">タイトルを入力して + ボタンを押すと、指定されたカテゴリーに新しいリストが作成されます。追加先はカテゴリーボタンをタップすると変えられます。</p>
          </section>

          <section className="border-t">
            <h3 className="text-base font-semibold md:text-lg">◇ 並べ替え</h3>
            <p className="text-sm">リストやタスクはドラッグアンドドロップで並べ替え可能です。</p>
          </section>

          <section className="border-t">
            <h3 className="text-base font-semibold md:text-lg">◇ 詳細ページ</h3>
            <p className="text-sm">
              タスクの追加、変更、削除、チェックのON/OFF、カテゴリー変更ができます。<br />
              曜日ボタンを押すと、選択した曜日にチェックが外れた状態に戻ります。繰り返しのタスクに便利です。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
