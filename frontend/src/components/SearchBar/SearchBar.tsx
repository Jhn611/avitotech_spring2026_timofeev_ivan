import { useEffect, useRef, useState } from "react";
import cardsIcon from "../../assets/imgs/Vector.svg";
import listIcon from "../../assets/imgs/UnorderedList.svg";
import down from "../../assets/imgs/icon-select.svg";
import "./SearchBar.css";
import SearchString from "../SearchString/SearchString"

interface SearchBarProps {
  sortValue: string;
  setSortValue: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (query: string) => void;
}

function SearchBar({
  sortValue,
  setSortValue,
  searchQuery,
  setSearchQuery,
  onSearch,
}: SearchBarProps) {
  const [selectWidth, setSelectWidth] = useState(0);
  const hiddenSpanRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortOptions = [
    { value: "newest", label: "По новизне (сначала новые)" },
    { value: "oldest", label: "По новизне (сначала старые)" },
    { value: "name_asc", label: "По названию (А → Я)" },
    { value: "name_desc", label: "По названию (Я → А)" },
    { value: "price_asc", label: "По цене (сначала дешевле)" },
    { value: "price_desc", label: "По цене (сначала дороже)" },
  ];

  useEffect(() => {
    const updateWidth = () => {
      if (hiddenSpanRef.current) {
        const textWidth = hiddenSpanRef.current.offsetWidth;
        console.log(textWidth, hiddenSpanRef.current);
        setSelectWidth(textWidth + 10);
      }
    };
    document.fonts?.ready.then(updateWidth);
    updateWidth();

    localStorage.setItem("sort", sortValue);
  }, [sortValue]);

  const selectedLabel =
    sortOptions.find((opt) => opt.value === sortValue)?.label ||
    "По новизне (сначала новые)";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setTimeout(() => setIsOpen(false), 100);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div className="searchBlock">
        <SearchString searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectWidth={selectWidth} onSearch={onSearch}/>
        <div className="changeView">
          <img src={cardsIcon} alt="" />
          <div className="whiteLine"></div>
          <img src={listIcon} alt="" />
        </div>
        <div className="sortSelectWrapper">
          <div
            className="sortSelect"
            onClick={() => setIsOpen(!isOpen)}
            style={{ width: `${selectWidth}px` }}
          >
            {selectedLabel}

            <span className="arrowSelect">
              <img src={down} alt="" className={isOpen ? "openSelect" : ""} />
            </span>
          </div>

          {isOpen && (
            <div className="sortOptionsList" ref={dropdownRef}>
              {sortOptions.map((option) => (
                <div
                  key={option.value}
                  className={`sortOption ${sortValue === option.value ? "selected" : ""}`}
                  onClick={() => {
                    setSortValue(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}

          <span ref={hiddenSpanRef} className="hiddenText">
            {selectedLabel}
          </span>
        </div>
      </div>
    </>
  );
}

export default SearchBar;
