function todayLabel(date = new Date()) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toId(doc) {
  if (!doc) return "";
  if (typeof doc === "string") return doc;
  return String(doc._id || doc.id || "");
}

function stripPassword(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;
  return obj;
}

function userToDash(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  return {
    id: toId(obj),
    name: obj.name || "",
    email: obj.email || "",
    role: obj.role === "admin" ? "admin" : "user",
    createdAt: todayLabel(obj.createdAt || Date.now()),
  };
}

function articleToDash(article) {
  const obj = article.toObject ? article.toObject() : { ...article };
  return {
    id: toId(obj),
    categories: Array.isArray(obj.categories) ? obj.categories : [],
    image: obj.image || "",
    title: obj.title || "",
    subtitle: obj.subtitle || "",
    keyPoints: Array.isArray(obj.keyPoints) ? obj.keyPoints : [],
    author: obj.author || "",
    introduction: obj.introduction || "",
    sections: Array.isArray(obj.sections)
      ? obj.sections.map((s) => ({
          id: s.id || toId(s) || `${Date.now()}`,
          title: s.title || "",
          note: s.note || "",
          text: s.text || "",
          image: s.image || "",
        }))
      : [],
    tip: obj.tip || "",
    tags: Array.isArray(obj.tags) ? obj.tags : [],
    createdAt: todayLabel(obj.createdAt || Date.now()),
  };
}

function ebookToDash(ebook) {
  const obj = ebook.toObject ? ebook.toObject() : { ...ebook };
  const recipeMeta = obj.recipeMeta || {};
  return {
    id: toId(obj),
    featured: Boolean(obj.featured),
    categories: Array.isArray(obj.categories) ? obj.categories : [],
    isRecipe: Boolean(obj.isRecipe),
    recipeMeta: {
      time: recipeMeta.time || "",
      difficulty: ["facile", "moyen", "difficile"].includes(recipeMeta.difficulty)
        ? recipeMeta.difficulty
        : "facile",
      people: recipeMeta.people || "",
    },
    title: obj.title || "",
    subtitle: obj.subtitle || "",
    author: obj.author || "",
    delivery: obj.delivery === "email-after-pay" ? "email-after-pay" : "immediate",
    pages: obj.pages || "",
    pdfUrl: obj.pdfUrl || "",
    pdfFileName: obj.pdfFileName || "",
    highlights: Array.isArray(obj.highlights) ? obj.highlights : [],
    about: obj.about || "",
    summary: Array.isArray(obj.summary) ? obj.summary : [],
    tip: obj.tip || "",
    tags: Array.isArray(obj.tags) ? obj.tags : [],
    createdAt: todayLabel(obj.createdAt || Date.now()),
  };
}

function emailToDash(item) {
  const obj = item.toObject ? item.toObject() : { ...item };
  const source = obj.source === "account" ? "account" : "newsletter";
  return {
    id: toId(obj),
    email: obj.email || "",
    name: obj.name || undefined,
    source,
    accepted: obj.accepted !== false,
    createdAt: todayLabel(obj.createdAt || Date.now()),
  };
}

module.exports = {
  todayLabel,
  toId,
  stripPassword,
  userToDash,
  articleToDash,
  ebookToDash,
  emailToDash,
};
