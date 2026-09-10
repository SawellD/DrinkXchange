import { getDrinkPrice } from "../lib/drinkPricing";

export default function DrinkCard({ drink, count, discountDrinkId, discountAmount, onIncrement }) {
  const isDiscounted = drink.id === discountDrinkId;
  const displayedPrice = getDrinkPrice(drink, discountDrinkId, discountAmount);

  return (
    <article className="drink-card">
      <div className="drink-card__header">
        <div>
          <h2 className="drink-card__name">{drink.name}</h2>
          <p className="drink-card__price">
            {displayedPrice} {drink.currency}
            {isDiscounted && <span className="drink-card__badge">Rabatt</span>}
          </p>
        </div>
        <output className="drink-card__count" aria-label={`${drink.name}: ${count}`}>
          {count}
        </output>
      </div>

      <div className="drink-card__actions" aria-label={`${drink.name} verkaufen`}>
        {[1, 5, 10].map((amount) => (
          <button
            key={amount}
            type="button"
            className="button button--increment"
            onClick={() => onIncrement(drink.id, amount)}
            aria-label={`${drink.name}: plus ${amount}`}
          >
            +{amount}
          </button>
        ))}
      </div>
    </article>
  );
}