/**
 * Script to generate onboarding documents for all existing employees in Atlas
 * using the live Render backend API (POST /documents/onboarding/:employeeId)
 */

const https = require('https');

const RENDER_BASE = 'stb-backend-blno.onrender.com';
const EMPLOYEES = [
  { id: '6a801334b3dc3f567a8c89a5', matricule: 'ADMIN001' },
  { id: '6a8015898cb863f6a427742f', matricule: 'EMP1001' },
  { id: '6a802c659ba293d6ae0494a0', matricule: 'EMP1002' },
];

// First login to get a token
function login() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ matricule: 'ADMIN001', password: 'admin123' });
    const options = {
      hostname: RENDER_BASE,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const token = parsed?.data?.accessToken || parsed?.accessToken;
          if (token) {
            console.log('✅ Login successful');
            resolve(token);
          } else {
            console.log('Login response:', JSON.stringify(parsed, null, 2));
            reject(new Error('No token in response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function generateOnboarding(token, employeeId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: RENDER_BASE,
      path: `/api/v1/documents/onboarding/${employeeId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function generatePayslip(token, employeeId) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ type: 'FICHE_PAIE' });
    const options = {
      hostname: RENDER_BASE,
      path: `/api/v1/documents/generate/${employeeId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Authorization: `Bearer ${token}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('🚀 Connecting to Render backend to generate documents...\n');

  let token;
  try {
    token = await login();
  } catch (e) {
    console.error('❌ Login failed:', e.message);
    process.exit(1);
  }

  for (const emp of EMPLOYEES) {
    console.log(`\n📄 Generating documents for ${emp.matricule} (${emp.id})...`);
    try {
      const result = await generateOnboarding(token, emp.id);
      if (Array.isArray(result?.data || result)) {
        const docs = result?.data || result;
        const success = docs.filter((d) => d.success).length;
        const failed = docs.filter((d) => !d.success).length;
        console.log(`   ✅ ${success} documents generated, ❌ ${failed} failed`);
        if (failed > 0) {
          docs.filter((d) => !d.success).forEach((d) => console.log(`     - ${d.type}: ${d.error}`));
        }
      } else {
        console.log('   Response:', JSON.stringify(result, null, 2).substring(0, 300));
      }
    } catch (e) {
      console.error(`   ❌ Error: ${e.message}`);
    }

    // Also generate a payslip explicitly
    console.log(`   💰 Generating payslip for ${emp.matricule}...`);
    try {
      const payslip = await generatePayslip(token, emp.id);
      if (payslip?.data?._id || payslip?._id) {
        console.log(`   ✅ Payslip generated`);
      } else {
        console.log('   Payslip response:', JSON.stringify(payslip, null, 2).substring(0, 200));
      }
    } catch (e) {
      console.error(`   ❌ Payslip error: ${e.message}`);
    }
  }

  console.log('\n🎉 Done! All documents should now be in MongoDB Atlas and Cloudinary.');
}

main();
