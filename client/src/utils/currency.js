export const formatINRCurrency = (value, options = {}) => {
  const numericValue = Number(value || 0);

  return `₹${numericValue.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  })}`;
};
