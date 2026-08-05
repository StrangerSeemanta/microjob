export function formatCurrency(value: bigint | number) {
  const formatted = new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 6,
    style: "currency",
    currency: "BDT",
  }).format(value);
  return formatted;
}
