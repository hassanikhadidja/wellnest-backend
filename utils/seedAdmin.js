const bcrypt = require("bcrypt");
const User = require("../models/user");
const { upsertNewsletter } = require("../controlles/newslettercontrolles");

async function migrateLegacyRoles() {
  // Old AJBloks backend used role "client"
  await User.updateMany({ role: "client" }, { $set: { role: "user" } });
}

async function seedAdmin() {
  await migrateLegacyRoles();

  const email = (
    process.env.ADMIN_EMAIL || "admin@wellnest.com"
  )
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin Wellnest";

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
    }
    return existing;
  }

  const admin = await User.create({
    email,
    name,
    password: await bcrypt.hash(password, 10),
    role: "admin",
  });

  try {
    await upsertNewsletter({
      email: admin.email,
      name: admin.name,
      source: "account",
    });
  } catch {
    // non-blocking
  }

  console.log(`Seeded admin user: ${email}`);
  return admin;
}

module.exports = seedAdmin;
