import http from 'k6/http';
import { check, sleep } from 'k6';

// ============================================================
// STB Bank — Load Test (Charge Progressive)
// Simule 200 utilisateurs concurrents qui consultent l'API
// ============================================================
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp-up : monte à 50 users
    { duration: '1m',  target: 200 },  // Load    : maintient 200 users
    { duration: '30s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% des requêtes < 2 secondes
    http_req_failed:   ['rate<0.01'],  // Taux d'erreur < 1%
  },
};

export default function () {
  const BASE_URL = 'http://localhost:3000/api/v1';

  // ── Endpoint public léger (pas besoin de token) ───────────────
  // /health/ping = réponse simple sans check MongoDB/Disk (parfait pour load test)
  const res = http.get(`${BASE_URL}/health/ping`);

  check(res, {
    '✅ Health check - status 200': (r) => r.status === 200,
    '✅ Response time < 2s':        (r) => r.timings.duration < 2000,
  });

  sleep(1); // Think time (comportement humain réaliste)
}
