import {} from "react";
import "./Card.css";
import cardPlaceholder from "../../assets/imgs/cover.svg";
import { useNavigate } from "react-router-dom";

interface CardProps {
  id: string | number;
  cardName: string;
  cardPrice: number;
  cardType: string;
  needsRevision: boolean;
}

function Card({ id, cardName, cardPrice, cardType, needsRevision }: CardProps) {
  const navigate = useNavigate();
  const types: Record<typeof cardType, string> = {
    electronics: "Электроника",
    auto: "Авто",
    real_estate: "Недвижимость",
  };
  const handleClick = () => {
    navigate(`/item/${id}`);
  };
  return (
    <>
      <div className="card" onClick={handleClick} style={{ cursor: "pointer" }}>
        <img src={cardPlaceholder} alt="" />
        <div className="cardText">
          <div className="cardType">
            <p>{types[cardType]}</p>
          </div>
          <h1>
            {cardName.length > 19 ? cardName.slice(0, 19) + "..." : cardName}
          </h1>
          <h2>{cardPrice + " ₽"}</h2>
          {needsRevision ? (
            <div className="cardRevision">
              <div className="cardRevisionCircle"></div>
              <p>Требует доработок</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}

export default Card;
