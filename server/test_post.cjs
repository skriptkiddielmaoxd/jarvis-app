const http = require('http');
const data = JSON.stringify({intent: 'Create a small README badge for CI status', project: 'default', mock: true});
const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/intent/test',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log(body);
  });
});

req.on('error', (e) => console.error('REQ ERROR', e));
req.write(data);
req.end();
