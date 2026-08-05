const isValidEmail = require("../middlewares/emailvalidator");
const passwordvalidator = require("../middlewares/passwordvalidator");
const { passwordRequirementsMessage } = passwordvalidator;
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/jwtSecret");
const NewsletterEmail = require("../models/newsletteremail");
const { userToDash } = require("../utils/dto");
const { upsertNewsletter } = require("./newslettercontrolles");

async function newsletterAcceptedFor(email) {
  const row = await NewsletterEmail.findOne({
    email: String(email || "").trim().toLowerCase(),
  }).select("accepted");
  if (!row) return false;
  return row.accepted !== false;
}

function userWithNewsletter(user, newsletterAccepted) {
  return {
    ...userToDash(user),
    newsletterAccepted: Boolean(newsletterAccepted),
  };
}

function issueToken(user) {
  return jwt.sign({ _id: user._id, role: user.role }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

function normalizeRole(role, { allowAdmin = false } = {}) {
  if (role === "admin" && allowAdmin) return "admin";
  return "user";
}

exports.Adduser = async (req, res) => {
  try {
    const body = req.body || {};
    if (body.role) {
      return res.status(400).json({ msg: "Not auth !!" });
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");

    if (!name) {
      return res.status(400).json({ msg: "Le nom est requis." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "Should be format email" });
    }
    if (!passwordvalidator(password)) {
      return res.status(400).json({ msg: passwordRequirementsMessage() });
    }

    const matchedUser = await User.findOne({ email });
    if (matchedUser) {
      return res.status(400).json({ msg: "Email exist please login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: "user",
    });

    try {
      // New accounts are listed under Emails but opted out until they enable newsletter.
      await upsertNewsletter({
        email: user.email,
        name: user.name,
        source: "account",
        accepted: false,
      });
    } catch {
      // non-blocking
    }

    const token = issueToken(user);
    return res.status(201).json({
      msg: "Register success",
      token,
      user: userWithNewsletter(user, false),
    });
  } catch (error) {
    if (error.code === "JWT_SECRET_MISSING") {
      return res.status(503).json({ msg: error.message });
    }
    return res.status(503).json({ msg: error.message });
  }
};

exports.Login = async (req, res) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res.status(400).json({ msg: "E-mail ou mot de passe incorrect." });
    }

    const ok = await bcrypt.compare(password, existUser.password);
    if (!ok) {
      return res.status(400).json({ msg: "E-mail ou mot de passe incorrect." });
    }

    const token = issueToken(existUser);
    const newsletterAccepted = await newsletterAcceptedFor(existUser.email);
    return res.status(200).json({
      msg: "login success",
      token,
      user: userWithNewsletter(existUser, newsletterAccepted),
    });
  } catch (error) {
    if (error.code === "JWT_SECRET_MISSING") {
      return res.status(503).json({ msg: error.message });
    }
    return res.status(503).json({ msg: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const newsletterAccepted = await newsletterAcceptedFor(req.user.email);
    return res.status(200).json(userWithNewsletter(req.user, newsletterAccepted));
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users.map(userToDash));
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.createUserAdmin = async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    const role = normalizeRole(body.role, { allowAdmin: true });

    if (!name) return res.status(400).json({ msg: "Le nom est requis." });
    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "Should be format email" });
    }
    if (!passwordvalidator(password)) {
      return res.status(400).json({ msg: passwordRequirementsMessage() });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Cet e-mail existe déjà." });
    }

    const user = await User.create({
      email,
      name,
      password: await bcrypt.hash(password, 10),
      role,
    });

    try {
      await upsertNewsletter({
        email: user.email,
        name: user.name,
        source: "account",
        accepted: false,
      });
    } catch {
      // non-blocking
    }

    return res.status(201).json(userWithNewsletter(user, false));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.UpdateUSER = async (req, res) => {
  try {
    const body = req.body || {};
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Utilisateur introuvable" });
    }

    const isSelf = String(req.user._id) === String(user._id);
    const isAdmin = req.user.role === "admin";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if ("name" in body) {
      const name = String(body.name ?? "").trim();
      if (!name) return res.status(400).json({ msg: "Le nom ne peut pas être vide." });
      user.name = name;
    }

    if ("email" in body) {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!isValidEmail(email)) {
        return res.status(400).json({ msg: "Should be format email" });
      }
      const clash = await User.findOne({ email, _id: { $ne: user._id } });
      if (clash) {
        return res.status(400).json({ msg: "Cet e-mail existe déjà." });
      }
      user.email = email;
    }

    if ("password" in body && body.password) {
      if (!passwordvalidator(String(body.password))) {
        return res.status(400).json({ msg: passwordRequirementsMessage() });
      }
      user.password = await bcrypt.hash(String(body.password), 10);
    }

    if ("role" in body) {
      if (!isAdmin) {
        return res.status(403).json({ msg: "Access denied" });
      }
      user.role = normalizeRole(body.role, { allowAdmin: true });
    }

    await user.save();

    try {
      // Keep existing accepted flag; only refresh name/email/source on the contact.
      await upsertNewsletter({
        email: user.email,
        name: user.name,
        source: "account",
      });
    } catch {
      // non-blocking
    }

    const newsletterAccepted = await newsletterAcceptedFor(user.email);
    return res.status(202).json({
      msg: "Update success",
      user: userWithNewsletter(user, newsletterAccepted),
    });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ msg: "Vous ne pouvez pas supprimer votre propre compte." });
    }
    const result = await User.deleteOne({ _id: req.params.id });
    if (!result.deletedCount) {
      return res.status(404).json({ msg: "Utilisateur introuvable" });
    }
    return res.json({ msg: "Utilisateur supprimé" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const dbUser = await User.findById(req.user._id);
    if (!dbUser) {
      return res.status(404).json({ msg: "Utilisateur introuvable" });
    }
    const newsletterAccepted = await newsletterAcceptedFor(dbUser.email);
    return res.status(200).json(userWithNewsletter(dbUser, newsletterAccepted));
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.patchProfile = async (req, res) => {
  try {
    const body = req.body || {};
    const dbUser = await User.findById(req.user._id);
    if (!dbUser) {
      return res.status(404).json({ msg: "Utilisateur introuvable" });
    }

    if ("name" in body) {
      const name = String(body.name ?? "").trim();
      if (!name) {
        return res.status(400).json({ msg: "Le nom ne peut pas être vide." });
      }
      dbUser.name = name;
    }

    if ("password" in body && body.password) {
      if (!passwordvalidator(String(body.password))) {
        return res.status(400).json({ msg: passwordRequirementsMessage() });
      }
      dbUser.password = await bcrypt.hash(String(body.password), 10);
    }

    await dbUser.save();

    let newsletterAccepted = await newsletterAcceptedFor(dbUser.email);
    if (
      "newsletterAccepted" in body ||
      "accepted" in body ||
      "acceptEmails" in body
    ) {
      const nextAccepted =
        typeof body.newsletterAccepted === "boolean"
          ? body.newsletterAccepted
          : typeof body.accepted === "boolean"
            ? body.accepted
            : typeof body.acceptEmails === "boolean"
              ? body.acceptEmails
              : newsletterAccepted;
      try {
        await upsertNewsletter({
          email: dbUser.email,
          name: dbUser.name,
          source: "account",
          accepted: nextAccepted,
        });
        newsletterAccepted = nextAccepted;
      } catch {
        // keep previous
      }
    } else {
      try {
        await upsertNewsletter({
          email: dbUser.email,
          name: dbUser.name,
          source: "account",
        });
      } catch {
        // non-blocking
      }
      newsletterAccepted = await newsletterAcceptedFor(dbUser.email);
    }

    return res
      .status(200)
      .json(userWithNewsletter(dbUser, newsletterAccepted));
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
