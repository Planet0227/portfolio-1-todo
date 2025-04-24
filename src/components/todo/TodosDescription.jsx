import React from "react";

export const TodosDescription = () => {
  return (
    <div className="mx-8 mt-8 md:mx-auto md:max-w-5xl md:px-5">
      <div>
        <div className="text-4xl font-bold">タスク管理</div>
        <div>
          <div>
            タイトルを入力して+ボタンをクリックすると、リストの追加先に指定されているカラムにリストが新規作成されます。
          </div>
          <div>
            詳細ページではタスクの追加、変更、削除、チェックを付けて進捗を記録・確認出来ます。
          </div>
          <div>リストやタスクはドラッグアンドドロップで並べ替えられます。</div>
        </div>
      </div>
    </div>
  );
};
