import searchIcon from "../../assets/imgs/icon-wrapper.svg";
import "./SearchString.css";

interface SearchStringProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (query: string) => void;
  selectWidth: number;
}

function SearchString({
  searchQuery,
  setSearchQuery,
  onSearch,
  selectWidth,
}: SearchStringProps) {

  const handleSearch = () => {
    const trimQuery = searchQuery.trim();
    onSearch(trimQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <label className="searchString" style={{ width: `${selectWidth}px` }}>
          <input
            className="searchStringInput"
            placeholder=" "
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="searchStringPlaceholder" >Найти объявление, например "Телефон"</span>
          <div className="searchButton" onClick={handleSearch}>
            <img src={searchIcon} alt="Search" />
          </div>
        </label>
    </>
  );
}

export default SearchString;
