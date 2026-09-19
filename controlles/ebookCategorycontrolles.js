const EbookCategory = require("../models/ebookCategory");
const Ebook = require("../models/ebook");
const { EBOOK_CATEGORIES } = require("../constants/ebookCategories");

async function ensureSeeded() {
  const count = await EbookCategory.countDocuments();
  if (count > 0) return;
  await EbookCategory.insertMany(
    EBOOK_CATEGORIES.map((name, index) => ({ name, order: index })),
  );
}

function toDto(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(obj._id || obj.id),
    name: obj.name || "",
    order: typeof obj.order === "number" ? obj.order : 0,
  };
}

exports.listEbookCategories = async (req, res) => {
  try {
    await ensureSeeded();
    const items = await EbookCategory.find().sort({ order: 1, name: 1 });
    res.json(items.map(toDto));
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.createEbookCategory = async (req, res) => {
  try {
    await ensureSeeded();
    const name = String(req.body?.name ?? "").trim();
    if (!name) {
      return res.status(400).json({ msg: "Le nom de la catégorie est requis." });
    }
    const exists = await EbookCategory.findOne({
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (exists) {
      return res.status(409).json({ msg: "Cette catégorie existe déjà." });
    }
    const last = await EbookCategory.findOne().sort({ order: -1 });
    const item = await EbookCategory.create({
      name,
      order: (last?.order ?? -1) + 1,
    });
    res.status(201).json(toDto(item));
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ msg: "Cette catégorie existe déjà." });
    }
    res.status(e.status || 503).json({ msg: e.message });
  }
};

exports.updateEbookCategory = async (req, res) => {
  try {
    const item = await EbookCategory.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Catégorie introuvable" });

    const name = String(req.body?.name ?? item.name).trim();
    if (!name) {
      return res.status(400).json({ msg: "Le nom de la catégorie est requis." });
    }

    const duplicate = await EbookCategory.findOne({
      _id: { $ne: item._id },
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (duplicate) {
      return res.status(409).json({ msg: "Cette catégorie existe déjà." });
    }

    const oldName = item.name;
    item.name = name;
    if (typeof req.body?.order === "number") item.order = req.body.order;
    await item.save();

    if (oldName !== name) {
      const affected = await Ebook.find({ categories: oldName });
      await Promise.all(
        affected.map(async (ebook) => {
          ebook.categories = (ebook.categories || []).map((c) =>
            c === oldName ? name : c
          );
          await ebook.save();
        })
      );
    }

    res.status(202).json(toDto(item));
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ msg: "Cette catégorie existe déjà." });
    }
    res.status(e.status || 503).json({ msg: e.message });
  }
};

exports.deleteEbookCategory = async (req, res) => {
  try {
    const item = await EbookCategory.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Catégorie introuvable" });

    const name = item.name;
    await EbookCategory.deleteOne({ _id: item._id });
    await Ebook.updateMany({ categories: name }, { $pull: { categories: name } });

    res.json({ msg: "Catégorie supprimée" });
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.getAllowedCategoryNames = async () => {
  await ensureSeeded();
  const items = await EbookCategory.find().sort({ order: 1, name: 1 });
  return items.map((item) => item.name);
};
