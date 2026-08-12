/**
 * STB Banking Platform — k6 Load Test
 * 
 * Usage:
 *   k6 run load-tests/k6-basic.js
 *   k6 run load-tests/k6-basic.js --out json=results/k6-report-$(date +%Y%m%d).json
 * 
 * Install k6: brew install k6 (Mac) / choco install k6 (Windows)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Custom Metrics ──────────────────────────────────────────────────────────
const loginSuccessRate = new Rate('login_success_rate');
const apiErrorRate = new Rate('api_error_rate');
const loginDuration = new Trend('login_duration_ms');
const apiDuration = new Trend('api_duration_ms');

// ── Load Test Scenarios ─────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Scénario 1: Charge progressive (principal)
    load_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 50   },  // Montée douce
        { duration: '1m',  target: 200  },  // Charge normale
        { duration: '1m',  target: 500  },  // Charge élevée
        { duration: '2m',  target: 1000 },  // Pic de charge
        { duration: '30s', target: 0    },  // Descente
      ],
    },
  },

  // Seuils de performance (SLA bancaire)
  thresholds: {
    // 95% des requêtes doivent répondre en moins de 500ms
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    // Moins de 1% d'erreurs
    http_req_failed: ['rate<0.01'],
    // Taux de login réussi > 99%
    login_success_rate: ['rate>0.99'],
    // Taux d'erreur API < 2%
    api_error_rate: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

// ── Setup: Authentification avant les tests ─────────────────────────────────
export function setup() {
  const loginPayload = JSON.stringify({
    matricule: __ENV.TEST_MATRICULE || 'EMP001',
    password: __ENV.TEST_PASSWORD || 'password123',
  });

  const startTime = Date.now();
  const res = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  loginDuration.add(Date.now() - startTime);

  const success = check(res, {
    'setup: login status 200': (r) => r.status === 200,
    'setup: token received': (r) => {
      try {
        return r.json('data.accessToken') !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    console.error('❌ Setup login failed! Check credentials and server.');
    console.error(`Status: ${res.status}, Body: ${res.body}`);
    return { token: null };
  }

  console.log(`✅ Setup: Login successful, token obtained`);
  return { token: res.json('data.accessToken') };
}

// ── Main Test Function ──────────────────────────────────────────────────────
export default function (data) {
  if (!data.token) {
    console.error('No token available, skipping iteration');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
    'X-Request-ID': `k6-${__VU}-${__ITER}`,
  };

  // ── Group 1: Mon profil ─────────────────────────────────────────────────
  group('Profile & Dashboard', function () {
    const start = Date.now();
    const r = http.get(`${BASE_URL}/employees/me`, { headers });
    apiDuration.add(Date.now() - start);

    const ok = check(r, {
      'profile: status 200': (res) => res.status === 200,
      'profile: has employee data': (res) => {
        try { return res.json('data.matricule') !== undefined; }
        catch (e) { return false; }
      },
    });
    apiErrorRate.add(!ok);
    sleep(0.5);
  });

  // ── Group 2: Congés ─────────────────────────────────────────────────────
  group('Leave Management', function () {
    const start = Date.now();
    const r = http.get(`${BASE_URL}/leave`, { headers });
    apiDuration.add(Date.now() - start);

    check(r, {
      'leave: status 200': (res) => res.status === 200,
    });
    sleep(0.3);
  });

  // ── Group 3: Accounts (Banking) ─────────────────────────────────────────
  group('Banking - Accounts', function () {
    const start = Date.now();
    const r = http.get(`${BASE_URL}/accounts`, { headers });
    apiDuration.add(Date.now() - start);

    check(r, {
      'accounts: status 200 or 403': (res) => [200, 403].includes(res.status),
    });
    sleep(0.5);
  });

  // ── Group 4: Health Check ───────────────────────────────────────────────
  group('Health Check', function () {
    const r = http.get(`${BASE_URL}/health`);
    check(r, {
      'health: status 200': (res) => res.status === 200,
      'health: mongodb up': (res) => {
        try { return res.json('info.mongodb.status') === 'up'; }
        catch (e) { return false; }
      },
    });
  });

  sleep(1); // Pause réaliste entre les actions d'un utilisateur
}

// ── Teardown: Afficher le résumé ────────────────────────────────────────────
export function teardown(data) {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  STB LOAD TEST — RÉSULTATS FINAUX');
  console.log('═══════════════════════════════════════════');
  console.log('  Vérifier les métriques ci-dessus.');
  console.log('  Seuils SLA: p95 < 500ms, errors < 1%');
  console.log('═══════════════════════════════════════════');
}
