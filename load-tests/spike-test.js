import http from 'k6/http';
import { check, sleep } from 'k6';

// ============================================================
// STB Bank — Spike Test (Pic de Trafic)
// Simule 1000 utilisateurs qui se connectent d'un coup
// Scénario réel : versement des salaires à minuit
// ============================================================
export const options = {
  stages: [
    { duration: '10s', target: 50   }, // Trafic normal
    { duration: '20s', target: 1000 }, // ⚡ SPIKE brutal
    { duration: '1m',  target: 1000 }, // Maintien du pic
    { duration: '20s', target: 50   }, // Retour à la normale
    { duration: '30s', target: 0    }, // Fin
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // Max 3 secondes sous le pic
    http_req_failed:   ['rate<0.05'],  // Max 5% d'erreurs tolérées
  },
};

export default function () {
  const BASE_URL = 'http://localhost:3000/api/v1';

  // ── Endpoint public (pas besoin de token) ──────────────────
  const res = http.get(`${BASE_URL}/health/ping`);

  check(res, {
    '✅ API répond sous le pic': (r) => r.status === 200,
    '✅ Pas de crash (5xx)':     (r) => r.status !== 500 && r.status !== 502 && r.status !== 503,
    '✅ Temps de réponse < 3s':  (r) => r.timings.duration < 3000,
  });

  sleep(0.5); // Pause courte pour simuler la pression
}
