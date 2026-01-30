const bcrypt = require('bcrypt');

const passwords = {
  'admin@example.com': 'Admin123!',
  'user@example.com': 'User123!',
  'agent@example.com': 'Agent123!'
};

(async () => {
  for (const [email, pwd] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(pwd, 10);
    console.log(`${email}: ${hash}`);
  }
})();
