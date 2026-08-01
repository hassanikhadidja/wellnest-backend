const Article = require("../models/article");
const { CONTENT_CATEGORIES } = Article;
const { articleToDash } = require("../utils/dto");

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v ?? "").trim()).filter(Boolean);
}

function normalizeCategories(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((c) => CONTENT_CATEGORIES.includes(c));
}

function normalizeSections(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => ({
    id: String(s?.id || uid()),
    title: String(s?.title || ""),
    note: String(s?.note || ""),
    text: String(s?.text || ""),
    image: String(s?.image || ""),
  }));
}

function parseArticleBody(body, { partial = false } = {}) {
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
  if (!partial || "image" in body) data.image = String(body.image ?? "");
  if (!partial || "author" in body) data.author = String(body.author ?? "");
  if (!partial || "introduction" in body) {
    data.introduction = String(body.introduction ?? "");
  }
  if (!partial || "tip" in body) data.tip = String(body.tip ?? "");
  if (!partial || "categories" in body) {
    data.categories = normalizeCategories(body.categories);
  }
  if (!partial || "keyPoints" in body) data.keyPoints = asStringArray(body.keyPoints);
  if (!partial || "tags" in body) data.tags = asStringArray(body.tags);
  if (!partial || "sections" in body) data.sections = normalizeSections(body.sections);
  return data;
}

exports.listArticles = async (req, res) => {
  try {
    const items = await Article.find().sort({ createdAt: -1 });
    res.json(items.map(articleToDash));
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const item = await Article.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Article introuvable" });
    res.json(articleToDash(item));
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const data = parseArticleBody(req.body || {});
    const item = await Article.create(data);
    res.status(201).json(articleToDash(item));
  } catch (e) {
    res.status(e.status || 503).json({ msg: e.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const item = await Article.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Article introuvable" });

    const data = parseArticleBody(req.body || {}, { partial: true });
    Object.assign(item, data);
    await item.save();
    res.status(202).json(articleToDash(item));
  } catch (e) {
    res.status(e.status || 503).json({ msg: e.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const result = await Article.deleteOne({ _id: req.params.id });
    if (!result.deletedCount) {
      return res.status(404).json({ msg: "Article introuvable" });
    }
    res.json({ msg: "Article supprimé" });
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.CONTENT_CATEGORIES = CONTENT_CATEGORIES;
