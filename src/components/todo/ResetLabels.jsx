"use client";

const days = [
  { key: "sun", label: "日" },
  { key: "mon", label: "月" },
  { key: "tue", label: "火" },
  { key: "wed", label: "水" },
  { key: "thu", label: "木" },
  { key: "fri", label: "金" },
  { key: "sat", label: "土" },
];

const getDayLabelStyle = (type) => {
  switch (type) {
    case "everyday":
      return "text-emerald-700 bg-emerald-200";
    case "weekday":
    case "mon":
    case "tue":
    case "wed":
    case "thu":
    case "fri":
      return "text-gray-700 bg-gray-200";
    case "weekend":
    case "sun":
      return "text-red-500 bg-red-200";
    case "sat":
      return "text-blue-500 bg-blue-200";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

const ResetLabels = ({ resetDays }) => {
  const activeDays = days.filter((day) => resetDays[day.key]);
  const resetDayKeys = activeDays.map((day) => day.key);

  const isEveryday = days.every((d) => resetDayKeys.includes(d.key));
  const isWeekdays = ["mon", "tue", "wed", "thu", "fri"].every((d) =>
    resetDayKeys.includes(d)
  );
  const isWeekend = ["sat", "sun"].every((d) => resetDayKeys.includes(d));

  const resetLabels = [];

  if (isEveryday) {
    resetLabels.push({ label: "毎日", type: "everyday" });
  } else {
    if (isWeekdays) {
      resetLabels.push({ label: "平日", type: "weekday" });
    } else {
      ["mon", "tue", "wed", "thu", "fri"].forEach((key) => {
        if (resetDayKeys.includes(key)) {
          const label = days.find((d) => d.key === key)?.label;
          resetLabels.push({ label, type: key });
        }
      });
    }

    if (isWeekend) {
      resetLabels.push({ label: "週末", type: "weekend" });
    } else {
      ["sat", "sun"].forEach((key) => {
        if (resetDayKeys.includes(key)) {
          const label = days.find((d) => d.key === key)?.label;
          resetLabels.push({ label, type: key });
        }
      });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {resetLabels.map(({ label, type }) => (
        <span
          key={label}
          className={`px-1 text-[8px] md:text-xs font-semibold rounded-full ${getDayLabelStyle(type)}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
};

export default ResetLabels;
