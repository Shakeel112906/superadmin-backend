// hash.js
const bcrypt = require('bcryptjs');

const plainPassword = 'admin12356'; // Apna desired password yahan likhein

bcrypt.hash(plainPassword, 10).then(hash => {
  console.log("Hashed password:", hash);
}).catch(err => {
  console.error("Error hashing password:", err);
});
