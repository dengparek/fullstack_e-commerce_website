export const formatCurrency = (
  amount: number,
  currency: string = "SSP",
  locale: string = "en-US",
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount || 0);
};
