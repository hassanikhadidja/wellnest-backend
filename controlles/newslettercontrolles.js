const NewsletterEmail = require("../models/newsletteremail");
const { emailToDash } = require("../utils/dto");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase();
}

function normalizeSource(source) {
  return source === "account" ? "account" : "newsletter";
}

async function upsertNewsletter({ email, name, source }) {
  const normalized = normalizeEmail(email);
  if (!EMAIL_RE.test(normalized)) {
    const err = new Error("Adresse e-mail invalide");
    err.status = 400;
    throw err;
  }

  const cleanName = String(name || "").trim().slice(0, 120);
  const src = normalizeSource(source);
  const existing = await NewsletterEmail.findOne({ email: normalized });

  if (!existing) {
    return NewsletterEmail.create({
      email: normalized,
      name: cleanName,
      source: src,
    });
  }

  if (cleanName) existing.name = cleanName;
  if (src === "account" || existing.source !== "account") {
    existing.source = src;
  }
  await existing.save();
  return existing;
}

exports.listNewsletterEmails = async (req, res) => {
  try {
    const items = await NewsletterEmail.find().sort({ createdAt: -1 });
    res.json(items.map(emailToDash));
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.createNewsletterEmail = async (req, res) => {
  try {
    const body = req.body || {};
    const item = await upsertNewsletter({
      email: body.email,
      name: body.name,
      source: body.source,
    });
    res.status(201).json({
      msg: "Inscription enregistrée",
      ...emailToDash(item),
    });
  } catch (e) {
    res.status(e.status || 503).json({ msg: e.message });
  }
};

exports.updateNewsletterEmail = async (req, res) => {
  try {
    const item = await NewsletterEmail.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "E-mail introuvable" });

    const body = req.body || {};
    if ("name" in body) item.name = String(body.name || "").trim().slice(0, 120);
    if ("source" in body) item.source = normalizeSource(body.source);
    if ("email" in body) {
      const email = normalizeEmail(body.email);
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ msg: "Adresse e-mail invalide" });
      }
      item.email = email;
    }

    await item.save();
    res.status(202).json({ msg: "Mis à jour", item: emailToDash(item) });
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.deleteNewsletterEmail = async (req, res) => {
  try {
    const result = await NewsletterEmail.deleteOne({ _id: req.params.id });
    if (!result.deletedCount) {
      return res.status(404).json({ msg: "E-mail introuvable" });
    }
    res.json({ msg: "E-mail supprimé" });
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.exportNewsletterEmails = async (req, res) => {
  try {
    const items = await NewsletterEmail.find().sort({ email: 1 });
    const esc = (v) => {
      const text = String(v ?? "");
      if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
      return text;
    };
    const lines = ["email,name,source,createdAt"];
    for (const item of items) {
      lines.push(
        [
          esc(item.email),
          esc(item.name || ""),
          esc(item.source || ""),
          esc(item.createdAt ? new Date(item.createdAt).toISOString() : ""),
        ].join(","),
      );
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="wellnest-emails.csv"',
    );
    res.send(lines.join("\r\n") + "\r\n");
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.upsertNewsletter = upsertNewsletter;
