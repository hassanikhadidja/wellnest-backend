const Ebook = require("../models/ebook");
const { CONTENT_CATEGORIES } = require("../models/article");
const { ebookToDash } = require("../utils/dto");

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v ?? "").trim()).filter(Boolean);
}

function normalizeCategories(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((c) => CONTENT_CATEGORIES.includes(c));
}

function normalizeRecipeMeta(raw) {
  const meta = raw && typeof raw === "object" ? raw : {};
  const difficulty = ["facile", "moyen", "difficile"].includes(meta.difficulty)
    ? meta.difficulty
    : "facile";
  return {
    time: String(meta.time || ""),
    difficulty,
    people: String(meta.people || ""),
  };
}

function parseEbookBody(body, { partial = false } = {}) {
  const data = {};
  if (!partial || "title" in body) {
    const title = String(body.title ?? "").trim();
    if (!title) {
      const err = new Error("Le titre est requis.");
      err.status = 400;
      throw err;
    }
    data.title = title;
  }
  if (!partial || "subtitle" in body) data.subtitle = String(body.subtitle ?? "");
  if (!partial || "author" in body) data.author = String(body.author ?? "");
  if (!partial || "pages" in body) data.pages = String(body.pages ?? "");
  if (!partial || "image" in body) data.image = String(body.image ?? "");
  if (!partial || "language" in body) {
    data.language = body.language === "ar" ? "ar" : "fr";
  }
  if (!partial || "pdfUrl" in body) data.pdfUrl = String(body.pdfUrl ?? "");
  if (!partial || "pdfFileName" in body) {
    data.pdfFileName = String(body.pdfFileName ?? "");
  }
  if (!partial || "about" in body) data.about = String(body.about ?? "");
  if (!partial || "tip" in body) data.tip = String(body.tip ?? "");
  if (!partial || "featured" in body) data.featured = Boolean(body.featured);
  if (!partial || "isRecipe" in body) data.isRecipe = Boolean(body.isRecipe);
  if (!partial || "delivery" in body) {
    data.delivery =
      body.delivery === "email-after-pay" ? "email-after-pay" : "immediate";
  }
  if (!partial || "categories" in body) {
    data.categories = normalizeCategories(body.categories);
  }
  if (!partial || "highlights" in body) {
    data.highlights = asStringArray(body.highlights);
  }
  if (!partial || "summary" in body) data.summary = asStringArray(body.summary);
  if (!partial || "tags" in body) data.tags = asStringArray(body.tags);
  if (!partial || "recipeMeta" in body) {
    data.recipeMeta = normalizeRecipeMeta(body.recipeMeta);
  }
  return data;
}

exports.listEbooks = async (req, res) => {
  try {
    const items = await Ebook.find().sort({ createdAt: -1 });
    res.json(items.map(ebookToDash));
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.getEbook = async (req, res) => {
  try {
    const item = await Ebook.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "E-book introuvable" });
    res.json(ebookToDash(item));
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.createEbook = async (req, res) => {
  try {
    const data = parseEbookBody(req.body || {});
    if (data.featured) {
      await Ebook.updateMany({ featured: true }, { $set: { featured: false } });
    }
    const item = await Ebook.create(data);
    res.status(201).json(ebookToDash(item));
  } catch (e) {
    res.status(e.status || 503).json({ msg: e.message });
  }
};

exports.updateEbook = async (req, res) => {
  try {
    const item = await Ebook.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "E-book introuvable" });

    const data = parseEbookBody(req.body || {}, { partial: true });
    if (data.featured) {
      await Ebook.updateMany(
        { featured: true, _id: { $ne: item._id } },
        { $set: { featured: false } },
      );
    }
    Object.assign(item, data);
    await item.save();
    res.status(202).json(ebookToDash(item));
  } catch (e) {
    res.status(e.status || 503).json({ msg: e.message });
  }
};

exports.deleteEbook = async (req, res) => {
  try {
    const result = await Ebook.deleteOne({ _id: req.params.id });
    if (!result.deletedCount) {
      return res.status(404).json({ msg: "E-book introuvable" });
    }
    res.json({ msg: "E-book supprimé" });
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};
