import { useState, useEffect } from "react";
import { getAllItems } from "../../api/itemsApi.ts";
import type { Item, ItemsResponse } from "../../api/itemsApi.ts";
import SearchBar from "../../components/SearchBar/SearchBar";
import Card from "../../components/Card/Card";
import Filter from "../../components/Filter/Filter.tsx";
import vectorRight from "../../assets/imgs/Vector-right.svg";
import vectorLeft from "../../assets/imgs/Vector-left.svg";
import "./App.css";

const PAGE_SIZE = 10;

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortValue, setSortValue] = useState(
    localStorage.getItem("sort") ?? "newest",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState(" ");

  const [products, setProducts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [onlyNeedsRevision, setOnlyNeedsRevision] = useState(false);

  const [countProducts, setCountProducts] = useState(0)

  const loadItems = async (
    q?: string,
    limit?: number,
    skip?: number,
    needsRevision?: boolean,
    categories?: string,
    sortColumn?: "title" | "createdAt" ,
    sortDirection?: "asc" | "desc",
  ) => {
    try {
      setLoading(true);
      const response: ItemsResponse = await getAllItems({
        q,
        limit,
        skip,
        needsRevision,
        categories,
        sortColumn,
        sortDirection,
      });
      const pagesCount = Math.ceil(response.total / PAGE_SIZE);
      setTotalPages(pagesCount);
      setProducts(response.items);
      //console.log(response.items)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Не удалось загрузить объявления");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE;
    if (sortValue === "newest")
      loadItems(
        appliedSearch,
        PAGE_SIZE,
        skip,
        onlyNeedsRevision,
        selectedCategories.join(","),
        "createdAt",
        "desc",
      );
    else if (sortValue === "oldest")
      loadItems(
        appliedSearch,
        PAGE_SIZE,
        skip,
        onlyNeedsRevision,
        selectedCategories.join(","),
        "createdAt",
        "asc",
      );
    else if (sortValue === "name_asc")
      loadItems(
        appliedSearch,
        PAGE_SIZE,
        skip,
        onlyNeedsRevision,
        selectedCategories.join(","),
        "title",
        "asc",
      );
    else if (sortValue === "name_desc")
      loadItems(
        appliedSearch,
        PAGE_SIZE,
        skip,
        onlyNeedsRevision,
        selectedCategories.join(","),
        "title",
        "desc",
      );

    console.log("Сортируем по ", sortValue);
  }, [
    sortValue,
    appliedSearch,
    currentPage,
    selectedCategories,
    onlyNeedsRevision,
  ]);

  useEffect(() => {
    const startLoad = async () => {
      try {
        setLoading(true);
        const response: ItemsResponse = await getAllItems({});
        setCountProducts(response.total);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err?.message || "Не удалось загрузить объявления");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    startLoad();
    console.log("Первая загрузка");
    setAppliedSearch(searchQuery);
  }, []);

  const onSearch = (searchValue: string) => {
    console.log("Ищем по", searchValue);
    setCurrentPage(1);
    setAppliedSearch(searchValue);
  };
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setOnlyNeedsRevision(false);
    setAppliedSearch("");
  };
  return (
    <>
      <header>
        <div className="headerText">
          <h1>Мои объявления</h1>
          <h2>{countProducts} объявления</h2>
        </div>
        <SearchBar
          sortValue={sortValue}
          setSortValue={setSortValue}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={onSearch}
        />
      </header>
      <main>
        <Filter
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          onlyNeedsRevision={onlyNeedsRevision}
          setOnlyNeedsRevision={setOnlyNeedsRevision}
          onResetFilters={handleResetFilters}
        />
        <div className="products">
          {loading ? (
            <div className="loadingContainer">
              <div className="spinner"></div>
              <p>Загрузка объявлений...</p>
            </div>
          ) : error ? (
            <div className="errorMessage">
              <p>{error}</p>
              <button onClick={() => loadItems()}>Повторить попытку</button>
            </div>
          ) : products.length === 0 ? (
            <div className="noItems">
              <p>По вашему запросу ничего не найдено</p>
            </div>
          ) : (
            <>
              <div className="cards">
                {products.map((el) => (
                  <Card
                    key={el.id}
                    id={el.id}
                    cardName={el.title}
                    cardPrice={el.price}
                    cardType={el.category}
                    needsRevision={el.needsRevision}
                  />
                ))}
              </div>

              {totalPages >= 1 && (
                <div className="pagination">
                  <button
                    className="paginationArrow"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <img src={vectorLeft} alt="" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={page === currentPage ? "active" : ""}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    className="paginationArrow"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <img src={vectorRight} alt="" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
