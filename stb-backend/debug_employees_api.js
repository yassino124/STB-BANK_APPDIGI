const axios = require('axios');
const jwt = require('jsonwebtoken');

async function run() {
  const token = jwt.sign(
    { sub: '6a640a82aaec357d375ee389', matricule: 'EMP1008', roles: ['MANAGER'] },
    'super-secret-stb-jwt-key-2026-very-secure', 
    { expiresIn: '1h' }
  );
  
  try {
    const res = await axios.get('http://localhost:3000/api/v1/employees?limit=100', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Response data:", res.data);
  } catch (e) {
    console.error("Error:", e.response?.data || e.message);
  }
}
run();
