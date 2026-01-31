const http = require('http');
http.get('http://127.0.0.1:3000/ui', (res) => {
  let data='';
  res.on('data', c => data+=c);
  res.on('end', ()=>{
    console.log(data.slice(0, 2000));
    require('fs').writeFileSync('server_ui.html', data);
  });
}).on('error', (e)=>{ console.error('ERR', e); process.exit(1); });
