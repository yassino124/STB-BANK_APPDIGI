const http = require('http');

function makeRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        // Faking authorization to bypass JwtAuthGuard if possible? Wait, we can't bypass unless we have a token.
        // I will just use the DB to run the service directly to bypass auth.
      }
    }, res => {
      let resBody = '';
      res.on('data', d => resBody += d);
      res.on('end', () => resolve(resBody));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
// Since we don't have a valid JWT token here, let's just write a small script that instantiates the NestJS app context and runs the service.
