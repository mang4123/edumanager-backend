const { supabaseAdmin } = require('./src/config/supabase');

async function checkTable() {
  try {
    console.log('🔍 VERIFICANDO TABELA EXERCICIOS...\n');
    
    // Tentar buscar dados da tabela
    const { data, error } = await supabaseAdmin
      .from('exercicios')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ ERRO:', error.message);
      console.log('\n📋 PRECISA CRIAR A TABELA exercicios');
    } else {
      console.log('✅ TABELA EXISTE!');
      console.log('📊 Dados encontrados:', data?.length || 0);
      if (data?.[0]) {
        console.log('🗂️ Colunas:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.log('❌ ERRO GERAL:', err.message);
  }
  
  process.exit(0);
}

checkTable(); 