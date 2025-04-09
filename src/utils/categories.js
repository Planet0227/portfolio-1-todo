export const CATEGORIES = {
  COMPLETED: {
    id: "completed",
    title: "完了",
    styles: {
      baseColor: "bg-green-200",
      hover: "hover:bg-green-300",
    },
    description: "完了したタスク",
    order: 3,
  },
  IN_PROGRESS: {
    id: "inProgress",
    title: "実行中",
    styles: {
      baseColor: "bg-orange-200",
      hover: "hover:bg-orange-300",
    },
    description: "現在取り組み中のタスク",
    order: 2,
  },
  NOT_STARTED: {
    id: "notStarted",
    title: "未着手",
    styles: {
      baseColor: "bg-red-200",
      hover: "hover:bg-red-300",
    },
    description: "まだ開始していないタスク",
    order: 1,
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES).sort((a, b) => a.order - b.order);

// カテゴリー情報を取得する
export const getCategoryInfo = (categoryId) => {
  return (
    CATEGORIES[Object.keys(CATEGORIES).find(key => CATEGORIES[key].id === categoryId)] || {
      id: categoryId,
      title: "未設定",
      styles: {
        baseColor: "bg-gray-200",
        hover: "hover:bg-gray-300",
      },
      description: "不明なカテゴリー",
      order: 999,
    }
  );
};

// // カテゴリーのスタイルを組み合わせて返す関数
// export const getCategoryStyles = (categoryId) => {
//   return getCategoryInfo(categoryId).styles.base;
// };

// // カテゴリーの表示名を取得する関数
// export const getCategoryTitle = (categoryId) => {
//   return getCategoryInfo(categoryId).title;
// };

