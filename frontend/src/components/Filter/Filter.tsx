import { useState } from "react";
import down from "../../assets/imgs/Down.svg";
import "./Filter.css"; 

interface FiltersProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;

  onlyNeedsRevision: boolean;
  setOnlyNeedsRevision: (value: boolean) => void;

  onResetFilters: () => void;
}

const categories = [
  { value: "auto", label: "Авто" },
  { value: "electronics", label: "Электроника" },
  { value: "real_estate", label: "Недвижимость" },
];

function Filter({
  selectedCategories,
  setSelectedCategories,
  onlyNeedsRevision,
  setOnlyNeedsRevision,
  onResetFilters,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(true); 

  const toggleCategory = (value: string) => {
    if (selectedCategories.includes(value)) {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== value));
    } else {
      setSelectedCategories([...selectedCategories, value]);
    }
  };

  return (
    <div className="filterBlock">
      <div className="filterMain">
        <h1>Фильтры</h1>
        <div
          className="filterHeader"
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
        >
          <h2>Категории</h2>
          <span className={`arrow ${isOpen ? "open" : ""}`}> <img src={down} alt="" /></span>
        </div>
        {isOpen && (
          <div className="filterContent">
            <div className="section">
              <div className="checkboxes">
                {categories.map(({ value, label }) => (
                  <label key={value} className="checkboxLabel">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(value)}
                      onChange={() => toggleCategory(value)}
                    />
                    <span className="checkmark"></span>
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="spaceLine"></div>
        <div className="sectionToImprove">
          <h2>Только требующие доработок</h2>
          <label className="toggleSwitch">
            <input
              type="checkbox"
              checked={onlyNeedsRevision}
              onChange={(e) => setOnlyNeedsRevision(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <button className="resetButton" onClick={onResetFilters}>
        Сбросить фильтры
      </button>
    </div>
  );
}

export default Filter;
