const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@stb.tn',
      password: 'password'
    });
    console.log('✅ Login successful with password: "password"');
    console.log(res.data);
  } catch (error) {
    console.log('❌ Failed with password: "password". Status:', error.response?.status, error.response?.data);
    
    try {
      const res2 = await axios.post('http://localhost:3000/api/v1/auth/login', {
        email: 'admin@stb.tn',
        password: 'admin123'
      });
      console.log('✅ Login successful with password: "admin123"');
      console.log(res2.data);
    } catch (err2) {
      console.log('❌ Failed with password: "admin123". Status:', err2.response?.status, err2.response?.data);
    }
  }
}

testLogin();
