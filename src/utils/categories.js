import {
  faTrophy,
  faRunning,
  faSeedling,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

export const CATEGORIES = {
  COMPLETED: {
    id: "completed",
    title: "完了",
    styles: {
      baseColor: "bg-green-300",
      hover: "hover:bg-green-400",
    },
    icon: faTrophy,
    description: "完了したタスク",
    order: 4,
  },
  IN_PROGRESS: {
    id: "inProgress",
    title: "実行中",
    styles: {
      baseColor: "bg-orange-300",
      hover: "hover:bg-orange-400",
    },
    icon: faRunning,
    description: "現在取り組み中のタスク",
    order: 3,
  },
  PRIORITY: {
    id: "priority",
    title: "優先",
    styles: {
      baseColor: "bg-yellow-300",
      hover: "hover:bg-yellow-400",
    },
    icon: faExclamationCircle,
    description: "優先度の高いタスク",
    order: 2,
  },
  NOT_STARTED: {
    id: "notStarted",
    title: "未着手",
    styles: {
      baseColor: "bg-red-300",
      hover: "hover:bg-red-400",
    },
    icon: faSeedling,
    description: "まだ開始していないタスク",
    order: 1,
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES).sort((a, b) => a.order - b.order);

export const getCategoryInfo = (categoryId) => {
  return (
    CATEGORIES[Object.keys(CATEGORIES).find(key => CATEGORIES[key].id === categoryId)] || {
      id: categoryId,
      title: "未設定",
      styles: {
        baseColor: "bg-gray-200",
        hover: "hover:bg-gray-300",
      },
      icon: faSeedling,
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

