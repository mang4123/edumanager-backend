require('dotenv').config();

console.log('🔍 Testando leitura do arquivo .env...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK ✅' : 'ERRO ❌');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'OK ✅' : 'ERRO ❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK ✅' : 'ERRO ❌');

console.log('\n📋 Valores reais:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'PRESENTE' : 'AUSENTE');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENTE' : 'AUSENTE'); 