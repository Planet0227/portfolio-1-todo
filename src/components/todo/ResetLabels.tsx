"use client";

import { ResetDaysType } from "@/context/TodoContext";


type DayKey = keyof ResetDaysType; // "sun" | "mon" | … | "sat"
type LabelType = DayKey | "everyday" | "weekday" | "weekend";


type ResetLabelsProps = {
  resetDays: ResetDaysType;
}

const ResetLabels:React.FC<ResetLabelsProps> = ({ resetDays }) => {


  const days: { key: DayKey; label: string }[] = [
    { key: "sun", label: "日" },
    { key: "mon", label: "月" },
    { key: "tue", label: "火" },
    { key: "wed", label: "水" },
    { key: "thu", label: "木" },
    { key: "fri", label: "金" },
    { key: "sat", label: "土" },
  ];

  const getDayLabelStyle = (type: LabelType) => {
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


  const activeDays = days.filter((d) => resetDays[d.key]);
  const resetDayKeys = activeDays.map((d) => d.key);

  const weekdayKeys: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];
  const weekendKeys: DayKey[] = ["sat", "sun"];

  const isEveryday = days.every((d) => resetDayKeys.includes(d.key));
  const isWeekdays = weekdayKeys.every((k) => resetDayKeys.includes(k));
  const isWeekend = weekendKeys.every((k) => resetDayKeys.includes(k));

  type Label = { label: string; type: LabelType };
  const resetLabels: Label[] = [];

  if (isEveryday) {
    resetLabels.push({ label: "毎日", type: "everyday" });
  } else {
    if (isWeekdays) {
      resetLabels.push({ label: "平日", type: "weekday" });
    } else {
      weekdayKeys.forEach((k) => {
        if (resetDayKeys.includes(k)) {
          const label = days.find((d) => d.key === k)!.label;
          resetLabels.push({ label, type: k });
        }
      });
    }
    if (isWeekend) {
      resetLabels.push({ label: "週末", type: "weekend" });
    } else {
      weekendKeys.forEach((k) => {
        if (resetDayKeys.includes(k)) {
          const label = days.find((d) => d.key === k)!.label;
          resetLabels.push({ label, type: k });
        }
      });
    }
  }

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {resetLabels.map(({ label, type }) => (
        <span
          key={label}
          className={`px-1 font-semibold rounded-full text-[8px] md:text-xs ${getDayLabelStyle(type)}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
};

export default ResetLabels;
