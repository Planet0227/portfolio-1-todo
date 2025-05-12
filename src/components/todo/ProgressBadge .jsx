// src/components/ProgressBadge.js
import React from "react";

const ProgressBadge = ({ tasks }) => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.complete).length;
  const ratio = total > 0 ? done / total : 0;

  let badgeColorClass;
  if (ratio === 0) {
    badgeColorClass = "text-gray-300";
  } else if (ratio < 0.66) {
    badgeColorClass = "text-yellow-500";
  } else if (ratio < 1) {
    badgeColorClass = "text-orange-600";
  } else {
    badgeColorClass = "text-green-600";
  }

  return (
    <div className={`px-1 text-[10px] md:text-sm font-semibold rounded-full`}>
      <span className={`${badgeColorClass}`}>{done}</span>
      <span className="text-gray-500">/</span>
      <span className="text-gray-500">{`${total}`}</span>
    </div>
  );
};

export default ProgressBadge;
