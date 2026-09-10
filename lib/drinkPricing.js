export function getDrinkPrice(drink, discountDrinkId, discountAmount = 1) {
  return drink.id === discountDrinkId ? Math.max(0, drink.price - discountAmount) : drink.price;
}

export function calculateTotal(drinks, counts, discountDrinkId, discountAmount = 1) {
  return drinks.reduce((total, drink) => {
    const quantity = counts[drink.id] || 0;
    return total + getDrinkPrice(drink, discountDrinkId, discountAmount) * quantity;
  }, 0);
}