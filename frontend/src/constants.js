export const LOCATIONS = [
  "Downtown", "Suburb North", "Suburb South", "Riverside", "Industrial Zone",
  "Hill View", "City Center", "Countryside", "Tech Park Area", "Old Town",
];

export const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully-Furnished"];

export const currency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return "₹" + Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};
