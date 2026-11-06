const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.log('Pemakaian: node hash.js "PasswordMu"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(hash);
console.error('Panjang hash:', hash.length);   // harus 60