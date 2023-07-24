/**
 * this functions hashes the given string
 * @param {string} password
 */
const { hash, compare } = require("bcryptjs");

const hashPassword = async (password) => {
  const hashedPassword = await hash(password, 10);
  return `${hashedPassword}`;
};

module.exports = { hashPassword };
