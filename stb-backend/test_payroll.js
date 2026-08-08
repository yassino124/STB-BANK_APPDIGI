const axios = require('axios');
const jwt = require('jsonwebtoken');

async function run() {
  const token = jwt.sign(
    { sub: '6a640a82aaec357d375ee389', matricule: 'RH_ADMIN', roles: ['RH'] },
    'super-secret-jwt-key',
    { expiresIn: '1h' }
  );

  try {
    console.log('Running credit-salaries...');
    const res = await axios.post('http://localhost:3000/api/v1/payroll/credit-salaries', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Results:');
    res.data.data.forEach(r => {
      if (r.error) console.log(`[${r.matricule}] ERROR: ${r.error}`);
      else console.log(`[${r.matricule}] SUCCESS: ${r.salaireNet} TND`);
    });
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}
run();
