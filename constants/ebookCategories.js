const EBOOK_CATEGORIES = [
  "Petit-déjeuner",
  "Lunch Box",
  "Déjeuners équilibrés",
  "Desserts sains",
  "Boissons saines",
  "Fruits & Smoothies",
  "Options végétariennes",
  "Repas protéinés",
  "Menus pour enfants",
];

/** Kept so existing documents can still be saved until re-tagged in the dashboard */
const LEGACY_EBOOK_CATEGORIES = [
  "Nutrition Maman",
  "Bébé & Enfant",
  "Enfants & Adolescents",
  "Santé Globale",
  "Bien-être & Équilibre",
  "Bien-être",
  "Recettes",
  "Guides Pratiques",
];

const ALLOWED_EBOOK_CATEGORIES = [...EBOOK_CATEGORIES, ...LEGACY_EBOOK_CATEGORIES];

module.exports = {
  EBOOK_CATEGORIES,
  LEGACY_EBOOK_CATEGORIES,
  ALLOWED_EBOOK_CATEGORIES,
};
