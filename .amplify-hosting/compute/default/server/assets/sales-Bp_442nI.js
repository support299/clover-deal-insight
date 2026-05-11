function generateSaleId(d = /* @__PURE__ */ new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1e5 + Math.random() * 9e5);
  return `SALE-${yyyy}${mm}${dd}-${rand}`;
}
function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
}
function formatPct(n, digits = 1) {
  if (!isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}
export {
  formatPct as a,
  formatCurrency as f,
  generateSaleId as g
};
