import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItemById } from "../../api/itemsApi";
import type { ItemDetailResponse } from "../../api/itemsApi.ts";
import Edit from "../../assets/imgs/Edit.svg";
import "./Product.css";
import Main from "../../assets/imgs/main.svg";
import alertImg from "../../assets/imgs/exclamation-circle.svg";

function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [improve, setImprove] = useState(false);
  const [toImprove, setToImprove] = useState<string[]>([]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await getItemById(id!);
      setItem(data);
      checkMissingFields(data);
    } catch (err) {
      console.error("Ошибка загрузки объявления", err);
      setError("Не удалось загрузить объявление");
    } finally {
      setLoading(false);
    }
  };

  const checkMissingFields = (data: ItemDetailResponse) => {
    const missing: string[] = [];
    const params = data.params || {};

    if (!data.title?.trim()) missing.push("Название");
    if (!data.price || data.price <= 0) missing.push("Цена");

    if (data.category === "auto") {
      if (
        !params.brand ||
        typeof params.brand !== "string" ||
        !params.brand.trim()
      ) {
        missing.push("Бренд");
      }
      if (
        !params.model ||
        typeof params.model !== "string" ||
        !params.model.trim()
      ) {
        missing.push("Модель");
      }
      if (!params.yearOfManufacture) missing.push("Год выпуска");
      if (!params.mileage) missing.push("Пробег");
    }

    if (data.category === "real_estate") {
      if (!params.type) missing.push("Тип объекта");
      if (
        !params.address ||
        typeof params.address !== "string" ||
        !params.address.trim()
      ) {
        missing.push("Адрес");
      }
      if (!params.area) missing.push("Площадь");
    }

    if (data.category === "electronics") {
      if (!params.type) missing.push("Тип устройства");
      if (
        !params.brand ||
        typeof params.brand !== "string" ||
        !params.brand.trim()
      ) {
        missing.push("Бренд");
      }
      if (
        !params.model ||
        typeof params.model !== "string" ||
        !params.model.trim()
      ) {
        missing.push("Модель");
      }
      if (!params.condition) missing.push("Состояние");
      if (
        !params.color ||
        typeof params.color !== "string" ||
        !params.color.trim()
      ) {
        missing.push("Цвет");
      }
    }

    if (!data.description?.trim()) missing.push("Описание");

    setToImprove(missing);
    setImprove(missing.length > 0);
  };

  useEffect(() => {
    if (!id) {
      setError("ID объявления не указан в адресе");
      setLoading(false);
      return;
    }
    loadItem();
  }, [id]);

  const editProduct = () => {
    navigate(`/item/${id}/edit`);
  };

  const parseDate = (dateString: string): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="loadingContainerProduct">
        <div className="spinner"></div>
        <p>Загрузка объявления...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="errorMessageProduct">
        <p>{error || "Объявление не найдено"}</p>
        <button onClick={() => navigate(-1)}>← Назад к списку</button>
      </div>
    );
  }

  const params = item.params || {};
  const needsImprovement = new Set(toImprove);

  const shouldShow = (fieldName: string): boolean =>
    !needsImprovement.has(fieldName);

  return (
    <div className="itemDetail">
      <div className="itemDetailTitle">
        <h1>{item.title}</h1>
        <h1>{item.price} ₽</h1>
      </div>

      <div className="itemDetailSubTitle">
        <button className="edit" onClick={editProduct}>
          <p>Редактировать</p> <img src={Edit} alt="" />
        </button>
        <div className="dates">
          <h2>Опубликовано: {parseDate(item.createdAt)}</h2>
          <h2>Отредактировано: {parseDate(item.updatedAt)}</h2>
        </div>
      </div>

      <hr />

      <div className="itemDetailMain">
        <img src={Main} alt="" />
        <div className="itemDetailMainText">
          {improve && (
            <div className="improve-box">
              <div className="improve-header">
                <img src={alertImg} className="warning-icon" />
                <h3>Требуются доработки</h3>
              </div>
              <div className="improve-content">
                <p>У объявления не заполнены поля:</p>
                <ul>
                  {toImprove.map((el, index) => (
                    <li key={index}>{el}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <h1>Характеристики</h1>
            <div className="characteristics-list">
              {item.category === "auto" && (
                <>
                  {shouldShow("Бренд") && (
                    <div className="char-row">
                      <span className="char-label">Бренд:</span>
                      <span className="char-value">{params.brand || "—"}</span>
                    </div>
                  )}
                  {shouldShow("Модель") && (
                    <div className="char-row">
                      <span className="char-label">Модель:</span>
                      <span className="char-value">{params.model || "—"}</span>
                    </div>
                  )}
                  {shouldShow("Год выпуска") && (
                    <div className="char-row">
                      <span className="char-label">Год выпуска:</span>
                      <span className="char-value">
                        {params.yearOfManufacture || "—"}
                      </span>
                    </div>
                  )}
                  {shouldShow("Коробка") && (
                    <div className="char-row">
                      <span className="char-label">Коробка:</span>
                      <span className="char-value">
                        {params.transmission === "automatic"
                          ? "Автомат"
                          : params.transmission === "manual"
                            ? "Механика"
                            : "—"}
                      </span>
                    </div>
                  )}
                  {shouldShow("Пробег") && (
                    <div className="char-row">
                      <span className="char-label">Пробег:</span>
                      <span className="char-value">
                        {params.mileage ? `${params.mileage} км` : "—"}
                      </span>
                    </div>
                  )}
                  {shouldShow("Мощность двигателя") && (
                    <div className="char-row">
                      <span className="char-label">Мощность двигателя:</span>
                      <span className="char-value">
                        {params.enginePower
                          ? `${params.enginePower} л.с.`
                          : "—"}
                      </span>
                    </div>
                  )}
                </>
              )}

              {item.category === "real_estate" && (
                <>
                  {shouldShow("Тип объекта") && (
                    <div className="char-row">
                      <span className="char-label">Тип:</span>
                      <span className="char-value">
                        {params.type === "flat"
                          ? "Квартира"
                          : params.type === "house"
                            ? "Дом"
                            : params.type === "room"
                              ? "Комната"
                              : "—"}
                      </span>
                    </div>
                  )}
                  {shouldShow("Адрес") && (
                    <div className="char-row">
                      <span className="char-label">Адрес:</span>
                      <span className="char-value">
                        {params.address || "—"}
                      </span>
                    </div>
                  )}
                  {shouldShow("Площадь") && (
                    <div className="char-row">
                      <span className="char-label">Площадь:</span>
                      <span className="char-value">
                        {params.area ? `${params.area} м²` : "—"}
                      </span>
                    </div>
                  )}
                  {shouldShow("Этаж") && (
                    <div className="char-row">
                      <span className="char-label">Этаж:</span>
                      <span className="char-value">{params.floor || "—"}</span>
                    </div>
                  )}
                </>
              )}

              {item.category === "electronics" && (
                <>
                  {shouldShow("Тип устройства") && (
                    <div className="char-row">
                      <span className="char-label">Тип:</span>
                      <span className="char-value">
                        {params.type === "phone"
                          ? "Телефон"
                          : params.type === "laptop"
                            ? "Ноутбук"
                            : params.type === "misc"
                              ? "Другое"
                              : "—"}
                      </span>
                    </div>
                  )}
                  {shouldShow("Бренд") && (
                    <div className="char-row">
                      <span className="char-label">Бренд:</span>
                      <span className="char-value">{params.brand || "—"}</span>
                    </div>
                  )}
                  {shouldShow("Модель") && (
                    <div className="char-row">
                      <span className="char-label">Модель:</span>
                      <span className="char-value">{params.model || "—"}</span>
                    </div>
                  )}
                  {shouldShow("Состояние") && (
                    <div className="char-row">
                      <span className="char-label">Состояние:</span>
                      <span className="char-value">
                        {params.condition === "new"
                          ? "Новое"
                          : params.condition === "used"
                            ? "Б/у"
                            : "—"}
                      </span>
                    </div>
                  )}
                  {shouldShow("Цвет") && (
                    <div className="char-row">
                      <span className="char-label">Цвет:</span>
                      <span className="char-value">{params.color || "—"}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="itemDetailDescription">
        <h1>Описание</h1>
        <p>{item.description || "Описание отсутствует"}</p>
      </div>

      <button className="edit" onClick={() => navigate(-1)}>
        <p>Назад</p>
      </button>
    </div>
  );
}

export default Product;
