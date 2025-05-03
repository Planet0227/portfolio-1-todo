// src/components/CategoryHeader.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCategoryInfo } from "@/utils/categories";

const CategoryHeader = ({ category, className = "" , disableHover = false}) => {

  const hoverClass = disableHover ? "" : getCategoryInfo(category).styles.hover;

  return (
    <div className="flex items-center">
      <div
        className={`flex items-center px-3 py-1 gap-2 w-full ${
          getCategoryInfo(category).styles.baseColor
        } ${hoverClass} ${className}`}
      >
        <FontAwesomeIcon
          icon={getCategoryInfo(category).icon}
          className="text-white drop-shadow-lg"
        />
        <span className="w-[3em] text-center text-xs md:text-sm font-semibold text-white drop-shadow-lg">
          {getCategoryInfo(category).title}
        </span>
      </div>
    </div>
  );
};

export default CategoryHeader;
