import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { useState } from "react";

const SortDropdown = ({
  onSortChange,
  sortOrder,
  onSortOrderToggle,
}: {
  onSortChange: (sortKey: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderToggle: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const handleSortChange = (sortKey: string) => {
    onSortChange(sortKey);
    setIsOpen(false);
  };
  const options = [
    { key: "created_at", label: "Date Created" },
    { key: "name", label: "Title" },
    { key: "updated_at", label: "Last Modified" },
  ];

  const styles = {
    buttonsFrame:
      "inline-flex w-full items-center justify-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300",
    button: "hover:bg-gray-50 rounded p-1",
    dropdown:
      "absolute w-full right-0 p-1 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
    option: "block w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-100",
    icon: "-mr-1 h-5 w-5 text-gray-400",
    separator: "h-5 border-l border-gray-300",
  };

  return (
    <div className="relative inline-block text-left">
      <button className={styles.buttonsFrame}>
        <button
          type="button"
          className={styles.button}
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={toggleDropdown}
        >
          Sort Options
        </button>

        <span className={styles.separator}></span>
        <button
          className={styles.button}
          onClick={onSortOrderToggle}
          aria-label="Toggle sort order"
        >
          {sortOrder === "asc" ? <ArrowDownAZ /> : <ArrowUpAZ />}
        </button>
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <button
              key={option.key}
              className={styles.option}
              onClick={() => handleSortChange(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
