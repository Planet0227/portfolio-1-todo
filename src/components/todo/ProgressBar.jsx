// 進捗バー用コンポーネント
const ProgressBar = ({ tasks }) => {
  const total = tasks.length;
  const done = tasks.filter(t => t.complete).length;
  const ratio = total > 0 ? done / total : 0;

  let barColorClass;
  if (ratio === 0) {
    barColorClass = "bg-gray-300";
  } else if (ratio < 0.33) {
    barColorClass = "bg-yellow-400";
  } else if (ratio < 1) {
    barColorClass = "bg-cyan-400";
  } else {
    barColorClass = "bg-green-300";
  }

  const widthPercent = `${Math.round(ratio * 100)}%`;

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 my-1  overflow-hidden">
      <div
        className={`h-full transition-width duration-300 ${barColorClass}`}
        style={{ width: widthPercent }}
      />
    </div>
  );
};

export default ProgressBar;