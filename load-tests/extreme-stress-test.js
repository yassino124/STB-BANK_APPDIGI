import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const errorRate   = new Rate('errors');
const pingTrend   = new Trend('ping_duration', true);

// ─── Scenario: 10,000 VUs Extreme Stress Test ─────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 500   },   // Warm-up: 0 → 500
    { duration: '30s', target: 2000  },   // Ramp:    500 → 2,000
    { duration: '30s', target: 5000  },   // Ramp:    2,000 → 5,000
    { duration: '30s', target: 10000 },   // SPIKE:   5,000 → 10,000 🔥
    { duration: '60s', target: 10000 },   // Sustain: 10,000 VUs pendant 1 min
    { duration: '30s', target: 2000  },   // Descend: 10,000 → 2,000
    { duration: '30s', target: 0     },   // Cool-down: retour à 0
  ],
  thresholds: {
    // Seuils adaptés à 10,000 VUs (infrastructure locale)
    'http_req_duration': ['p(95)<5000'],  // 95% des req < 5s sous 10k VUs
    'http_req_failed':   ['rate<0.10'],   // < 10% d'erreurs toléré
    'errors':            ['rate<0.10'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

// ─── Test Function ─────────────────────────────────────────────────────────────
export default function () {
  const startPing = Date.now();

  const res = http.get(`${BASE_URL}/health/ping`, {
    tags: { name: 'health_ping' },
    timeout: '10s',
  });

  pingTrend.add(Date.now() - startPing);

  const ok = check(res, {
    '✅ Status 200':           (r) => r.status === 200,
    '✅ Pas de crash 5xx':     (r) => r.status !== 500 && r.status !== 502 && r.status !== 503,
    '✅ Réponse < 5s':         (r) => r.timings.duration < 5000,
  });

  errorRate.add(!ok);

  // Petite pause réaliste entre les requêtes (utilisateurs = pas des robots purs)
  sleep(0.5);
}

// ─── Summary personnalisé ─────────────────────────────────────────────────────
export function handleSummary(data) {
  const p95 = data.metrics['http_req_duration']?.values?.['p(95)'] ?? 0;
  const p99 = data.metrics['http_req_duration']?.values?.['p(99)'] ?? 0;
  const errRate = (data.metrics['http_req_failed']?.values?.rate ?? 0) * 100;
  const rps = data.metrics['http_reqs']?.values?.rate ?? 0;
  const totalReqs = data.metrics['http_reqs']?.values?.count ?? 0;

  const verdict = (errRate < 10 && p95 < 5000)
    ? '🏆 SYSTÈME RÉSILIENT — 10,000 VUs supportés !'
    : '⚠️  LIMITES ATTEINTES — Optimisation requise';

  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔥  STB BANK — EXTREME STRESS TEST — 10,000 VUs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  📊 Requêtes totales  : ${totalReqs.toLocaleString()}`);
  console.log(`  ⚡ RPS (req/sec)     : ${rps.toFixed(1)}`);
  console.log(`  ⏱️  p(95) latence    : ${p95.toFixed(2)} ms`);
  console.log(`  ⏱️  p(99) latence    : ${p99.toFixed(2)} ms`);
  console.log(`  ❌ Taux d'erreur    : ${errRate.toFixed(2)}%`);
  console.log(`  👥 VUs max          : 10,000`);
  console.log('');
  console.log(`  ${verdict}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return {
    stdout: '\n✅ Rapport généré',
  };
}
