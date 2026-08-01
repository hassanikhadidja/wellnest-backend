const Questionnaire = require("../models/questionnaire");

exports.submitQuestionnaire = async (req, res) => {
  try {
    const body = req.body || {};
    const profile = String(body.profile ?? "").trim();
    const goal = String(body.goal ?? "").trim();
    const trimester = String(body.trimester ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!profile || !goal) {
      return res.status(400).json({ msg: "Profil et objectif requis." });
    }

    const doc = await Questionnaire.create({
      profile,
      goal,
      trimester,
      email,
      userId: req.user ? String(req.user._id) : "",
      completedAt: new Date(),
    });

    res.status(201).json({
      id: String(doc._id),
      profile: doc.profile,
      trimester: doc.trimester || undefined,
      goal: doc.goal,
      completedAt: doc.completedAt.toISOString(),
    });
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};

exports.listQuestionnaires = async (req, res) => {
  try {
    const items = await Questionnaire.find().sort({ completedAt: -1 });
    res.json(
      items.map((doc) => ({
        id: String(doc._id),
        userId: doc.userId || "",
        email: doc.email || "",
        profile: doc.profile,
        trimester: doc.trimester || undefined,
        goal: doc.goal,
        completedAt: doc.completedAt
          ? doc.completedAt.toISOString()
          : new Date().toISOString(),
      })),
    );
  } catch (e) {
    res.status(503).json({ msg: e.message });
  }
};
