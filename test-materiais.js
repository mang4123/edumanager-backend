const https = require('https');

function testAPI(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'edumanager-backend-5olt.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`\n🔧 TESTANDO: ${method} ${path}`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(responseData);
          console.log('📋 Resposta:', JSON.stringify(json, null, 2));
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          console.log('📋 Resposta (texto):', responseData);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Erro:', error.message);
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🚀 TESTANDO API DE MATERIAIS\n');

  try {
    // 1. Testar setup da tabela (sem autenticação)
    await testAPI('/api/materiais/setup-table', 'POST');

    console.log('\n✅ TESTES CONCLUÍDOS');
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }

  process.exit(0);
}

runTests(); 