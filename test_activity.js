async function test() {
  // Login
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matricule: 'EMP001', password: 'password123' })
  });
  const login = await loginRes.json();
  const token = login.data?.accessToken;
  
  console.log('✅ Token reçu:', token ? 'OUI' : 'NON');
  
  if (!token) {
    console.error('❌ Erreur login:', login);
    return;
  }
  
  // Get activity
  const actRes = await fetch('http://localhost:3000/api/v1/employees/my/activity?limit=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const activities = await actRes.json();
  
  console.log('\n📜 Activity Timeline:');
  console.log(JSON.stringify(activities, null, 2));
}

test().catch(console.error);
