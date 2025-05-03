import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export const TodosDescription = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div onClick={() => setIsExpanded(!isExpanded)} className={`relative p-2 mt-2 mx-2 md:mx-60 bg-white border shadow rounded-xl transition-all duration-600 ease-in-out  ${
        isExpanded ? 'max-h-96' : 'max-h-20'
      }`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-500 md:text-3xl">How to</h2>
        <button
          className="p-1 text-gray-600 transition hover:text-gray-900"
        >
          <FontAwesomeIcon icon={isExpanded ? faAngleUp : faAngleDown} size="lg" />
        </button>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"
        }`}
      >
        <div className="flex flex-col gap-2 text-gray-700">
          <section className="border-t ">
            <h3 className="text-base font-semibold md:text-lg">◇ リストの追加</h3>
            <p className="text-sm">タイトルを入力して + ボタンを押すと、指定されたカテゴリーに新しいリストが作成されます。</p>
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
