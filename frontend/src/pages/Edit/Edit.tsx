import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getItemById, updateItem } from "../../api/itemsApi";
import type { ItemDetailResponse, ItemUpdateIn } from "../../api/itemsApi.ts";
import { callGigaChat } from "../../api/gigachatApi";
import "./Edit.css";
import star from "../../assets/imgs/star.svg";
import lamp from "../../assets/imgs/lamp.svg";
import successImg from "../../assets/imgs/success.svg";
import errorImg from "../../assets/imgs/error.svg";

interface FormData {
  category: "auto" | "real_estate" | "electronics";
  title: string;
  price: number;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>;
}

interface GigaResultModal {
  isOpen: boolean;
  title: string;
  content: string;
  onAccept: () => void;
}

const STORAGE_KEY = (id: string) => `edit_form_${id}`;

function Edit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [formData, setFormData] = useState<FormData>({
    category: "electronics",
    title: "",
    price: 0,
    description: "",
    params: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isDescLoading, setIsDescLoading] = useState(false);

  const [modal, setModal] = useState<GigaResultModal | null>(null);
  const modalRef1 = useRef<HTMLDivElement>(null);

  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const saveToLocalStorage = (data: FormData) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY(id), JSON.stringify(data));
    }
  };

  const loadFromLocalStorage = (): FormData | null => {
    if (!id) return null;
    const saved = localStorage.getItem(STORAGE_KEY(id));
    return saved ? JSON.parse(saved) : null;
  };

  const clearLocalStorage = () => {
    if (id) {
      localStorage.removeItem(STORAGE_KEY(id));
    }
  };
  useEffect(() => {
    if (!id) {
      setError("ID не указан");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const savedData = loadFromLocalStorage();

        if (savedData) {
          setFormData(savedData);
          const serverData = await getItemById(id); 
          setItem(serverData);
          setLoading(false);
          return;
        }

        const data = await getItemById(id);
        setItem(data);

        const initialFormData: FormData = {
          category: data.category,
          title: data.title || "",
          price: data.price || 0,
          description: data.description || "",
          params: data.params || {},
        };

        setFormData(initialFormData);
        saveToLocalStorage(initialFormData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Не удалось загрузить объявление");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (id && !loading) {
      saveToLocalStorage(formData);
    }
  }, [formData, id, loading]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) || 0 : value,
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleParamChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      params: {
        ...prev.params,
        [key]: value,
      },
    }));
  };

  const handleMarketPrice = async () => {
    if (!formData.title.trim()) {
      return alert("Введите название товара");
    }

    setIsPriceLoading(true);

    try {
      const prompt = `Ты — эксперт по рынку вторичных товаров в России (Avito, Ozon, Wildberries, Юла). 
Анализируй реальные рыночные цены на похожие объявления. Не завышай цену.

Товар: ${formData.title}
Категория: ${formData.category}
Параметры: ${JSON.stringify(formData.params)}

Определи **реалистичную рыночную цену** с учётом состояния и параметров.

Ответь **строго в следующем формате**, без лишнего текста:

Средняя цена на ${formData.title}:
XXX XXX – XXX XXX ₽ — отличное состояние.
От XXX XXX ₽ — идеал / новый / минимальный износ.
XXX XXX – XXX XXX ₽ — хорошее состояние.
XXX XXX – XXX XXX ₽ — удовлетворительное / с мелкими дефектами.
Ниже XXX XXX ₽ — срочно или с заметными дефектами.

Используй пробел как разделитель тысяч.`;

      const text = await callGigaChat(prompt);

      setModal({
        isOpen: true,
        title: "Рекомендуемая рыночная цена",
        content: text,
        onAccept: () => {
          const priceMatches = text.match(/\d[\d\s]*(?=\s*–|\s*—|\s*₽)/g);
          let extractedPrice = 0;

          if (priceMatches && priceMatches.length > 0) {
            extractedPrice = parseInt(priceMatches[0].replace(/\s/g, ""), 10);
          } else {
            const fallback = text.match(/(\d[\d\s]*)/);
            if (fallback) {
              extractedPrice = parseInt(fallback[0].replace(/\s/g, ""), 10);
            }
          }

          if (extractedPrice > 0 && extractedPrice < 100000000) {
            setFormData((prev) => ({ ...prev, price: extractedPrice }));
          }
          setModal(null);
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("Ошибка GigaChat: " + (err.message || "Попробуйте позже"));
    } finally {
      setIsPriceLoading(false);
    }
  };

  const handleImproveDescription = async () => {
    if (!formData.description.trim()) {
      return alert("Напишите описание");
    }

    setIsDescLoading(true);

    try {
      const prompt = `Улучши описание товара для продажи:\n\nНазвание: ${formData.title}\nОписание: ${formData.description}. Не нужно писать лишних символов и смайликов.`;
      const improved = await callGigaChat(prompt);

      setModal({
        isOpen: true,
        title: "Улучшенное описание",
        content: improved,
        onAccept: () => {
          setFormData((prev) => ({ ...prev, description: improved }));
          setModal(null);
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("Ошибка улучшения: " + (err.message || "Попробуйте позже"));
    } finally {
      setIsDescLoading(false);
    }
  };

  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!formData.title.trim()) return alert("Название обязательно");
    if (formData.price <= 0) return alert("Цена должна быть больше 0");

    const updateData: ItemUpdateIn = {
      category: formData.category,
      title: formData.title,
      description: formData.description || undefined,
      price: formData.price,
      params: formData.params,
    };

    try {
      await updateItem(id!, updateData);
      clearLocalStorage();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(-1);
      }, 1500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Ошибка при сохранении:", err);
      setSaveError(true);
      setTimeout(() => setSaveError(false), 1500);
    }
  };

  const handleCancel = () => {
    clearLocalStorage();
    navigate(-1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef1.current &&
        !modalRef1.current.contains(event.target as Node)
      ) {
        setTimeout(() => setModal(null), 100);
      }
    };

    if (modal?.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modal]);

  if (loading)
    return (
      <div className="loadingContainerProduct">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  if (error || !item)
    return (
      <div className="errorMessageProduct">
        <p>{error || "Не найдено"}</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );

  return (
    <div className="edit-page">
      <h1>Редактирование объявления</h1>

      <div className="edit-form">
        <div className="form-group">
          <label>Категория</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="auto">Авто</option>
            <option value="real_estate">Недвижимость</option>
            <option value="electronics">Электроника</option>
          </select>
        </div>

        <hr />

        <div className="form-group">
          <label>
            <img src={star} alt="" /> Название
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Название товара"
          />
        </div>

        <hr />

        <div className="form-group price-row">
          <label>
            <img src={star} alt="" /> Цена
          </label>
          <div className="price-input">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="1"
            />
            <button
              type="button"
              className="market-price-btn"
              onClick={handleMarketPrice}
              disabled={isPriceLoading}
            >
              <img src={lamp} alt="" />
              {isPriceLoading ? "Запрашиваем..." : "Узнать рыночную цену"}
            </button>
          </div>

          {modal && modal.title === "Рекомендуемая рыночная цена" && (
            <div className="modal-content" ref={modalRef1}>
              <h3>Ответ AI:</h3>
              <div className="modal-result">{modal.content}</div>
              <div className="modal-buttons">
                <button onClick={modal.onAccept} className="accept-btn">
                  Применить
                </button>
                <button onClick={closeModal} className="cancel-btn">
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>

        <hr />

        {formData.category === "auto" && (
          <div className="form-group">
            <label>Характеристики</label>
            <div className="characteristics">
              <div className="container">
                <p>Бренд</p>
                <input
                  type="text"
                  placeholder="Бренд"
                  value={formData.params.brand || ""}
                  onChange={(e) => handleParamChange("brand", e.target.value)}
                />
              </div>
              <div className="container">
                <p>Модель</p>
                <input
                  type="text"
                  placeholder="Модель"
                  value={formData.params.model || ""}
                  onChange={(e) => handleParamChange("model", e.target.value)}
                />
              </div>
              <div className="container">
                <p>Год выпуска</p>
                <input
                  type="number"
                  placeholder="Год выпуска"
                  value={formData.params.yearOfManufacture || ""}
                  onChange={(e) =>
                    handleParamChange(
                      "yearOfManufacture",
                      Number(e.target.value) || undefined,
                    )
                  }
                />
              </div>
              <div className="container">
                <p>Коробка передач</p>
                <select
                  value={formData.params.transmission || ""}
                  onChange={(e) =>
                    handleParamChange("transmission", e.target.value)
                  }
                >
                  <option value="">Коробка передач</option>
                  <option value="automatic">Автомат</option>
                  <option value="manual">Механика</option>
                </select>
              </div>
              <div className="container">
                <p>Пробег</p>
                <input
                  type="number"
                  placeholder="Пробег (км)"
                  value={formData.params.mileage || ""}
                  onChange={(e) =>
                    handleParamChange(
                      "mileage",
                      Number(e.target.value) || undefined,
                    )
                  }
                />
              </div>
              <div className="container">
                <p>Мощность двигателя (л.с.)</p>
                <input
                  type="number"
                  placeholder="Мощность двигателя (л.с.)"
                  value={formData.params.enginePower || ""}
                  onChange={(e) =>
                    handleParamChange(
                      "enginePower",
                      Number(e.target.value) || undefined,
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        {formData.category === "real_estate" && (
          <div className="form-group">
            <label>Характеристики</label>
            <div className="characteristics">
              <div className="container">
                <p>Тип</p>
                <select
                  value={formData.params.type || ""}
                  onChange={(e) => handleParamChange("type", e.target.value)}
                >
                  <option value="">Тип объекта</option>
                  <option value="flat">Квартира</option>
                  <option value="house">Дом</option>
                  <option value="room">Комната</option>
                </select>
              </div>
              <div className="container">
                <p>Адрес</p>
                <input
                  type="text"
                  placeholder="Адрес"
                  value={formData.params.address || ""}
                  onChange={(e) => handleParamChange("address", e.target.value)}
                />
              </div>
              <div className="container">
                <p>Площадь</p>
                <input
                  type="number"
                  placeholder="Площадь (м²)"
                  value={formData.params.area || ""}
                  onChange={(e) =>
                    handleParamChange(
                      "area",
                      Number(e.target.value) || undefined,
                    )
                  }
                />
              </div>
              <div className="container">
                <p>Этаж</p>
                <input
                  type="number"
                  placeholder="Этаж"
                  value={formData.params.floor || ""}
                  onChange={(e) =>
                    handleParamChange(
                      "floor",
                      Number(e.target.value) || undefined,
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        {formData.category === "electronics" && (
          <div className="form-group">
            <label>Характеристики</label>
            <div className="characteristics">
              <div className="container">
                <p>Тип</p>
                <select
                  value={formData.params.type || ""}
                  onChange={(e) => handleParamChange("type", e.target.value)}
                >
                  <option value="">Тип устройства</option>
                  <option value="phone">Телефон</option>
                  <option value="laptop">Ноутбук</option>
                  <option value="misc">Другое</option>
                </select>
              </div>
              <div className="container">
                <p>Бренд</p>
                <input
                  type="text"
                  placeholder="Бренд"
                  value={formData.params.brand || ""}
                  onChange={(e) => handleParamChange("brand", e.target.value)}
                />
              </div>
              <div className="container">
                <p>Модель</p>
                <input
                  type="text"
                  placeholder="Модель"
                  value={formData.params.model || ""}
                  onChange={(e) => handleParamChange("model", e.target.value)}
                />
              </div>
              <div className="container">
                <p>Состояние</p>
                <select
                  value={formData.params.condition || ""}
                  onChange={(e) =>
                    handleParamChange("condition", e.target.value)
                  }
                >
                  <option value="">Состояние</option>
                  <option value="new">Новое</option>
                  <option value="used">Б/у</option>
                </select>
              </div>
              <div className="container">
                <p>Цвет</p>
                <input
                  type="text"
                  placeholder="Цвет"
                  value={formData.params.color || ""}
                  onChange={(e) => handleParamChange("color", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <hr />

        <div className="form-group">
          <label>Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={10}
            placeholder="Описание товара..."
          />
          <button
            type="button"
            className="improve-btn"
            onClick={handleImproveDescription}
            disabled={isDescLoading}
          >
            <img src={lamp} alt="" />
            {isDescLoading ? "Улучшаем..." : "Улучшить описание"}
          </button>
          {modal && modal.title === "Улучшенное описание" && (
            <div className="modal-content modal-description" ref={modalRef1}>
              <h3>Ответ AI:</h3>
              <div className="modal-result">{modal.content}</div>
              <div className="modal-buttons">
                <button onClick={modal.onAccept} className="accept-btn">
                  Применить
                </button>
                <button onClick={closeModal} className="cancel-btn">
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button onClick={handleSave} className="save-btn big-button">
            Сохранить
          </button>
          <button onClick={handleCancel} className="cancel-btn big-button">
            Отменить
          </button>
        </div>
      </div>
      {success && (
        <div className="modal-success">
          <img src={successImg} alt="" />
          <p>Изменения сохранены</p>
        </div>
      )}
      {saveError && (
        <div className="modal-error">
          <div className="modal-error-row">
            <img src={errorImg} alt="" />
            <p>Ошибка сохранения</p>
          </div>
          <p>
            При попытке сохранить изменения произошла ошибка. Попробуйте ещё раз
            или зайдите позже.
          </p>
        </div>
      )}
    </div>
  );
}

export default Edit;
