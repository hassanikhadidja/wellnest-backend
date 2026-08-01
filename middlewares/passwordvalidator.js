/** Matches frontend AuthForm: at least 6 characters. */
function passwordvalidator(ch) {
  return typeof ch === "string" && ch.length >= 6;
}

function passwordRequirementsMessage() {
  return "Le mot de passe doit contenir au moins 6 caractères.";
}

module.exports = passwordvalidator;
module.exports.passwordRequirementsMessage = passwordRequirementsMessage;
