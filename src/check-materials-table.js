const { supabaseAdmin } = require('./config/supabase');

async function checkMaterialsTable() {
  try {
    console.log('🔍 VERIFICANDO TABELA EXERCICIOS...\n');
    
    // Tentar fazer uma query simples
    const { data, error } = await supabaseAdmin
      .from('exercicios')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro ao acessar tabela exercicios:', error.message);
      
      // Verificar se existe alguma tabela similar
      console.log('\n🔍 Tentando encontrar tabelas similares...');
      
      const { data: tables, error: tableError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (!tableError && tables) {
        console.log('📊 Tabelas encontradas:', tables.map(t => t.table_name));
      }
    } else {
      console.log('✅ Tabela exercicios encontrada!');
      if (data && data.length > 0) {
        console.log('🗂️ Colunas:');
        console.log(Object.keys(data[0]));
        console.log('\n📋 Exemplo de dados:');
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('📋 Tabela existe mas está vazia');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    process.exit(0);
  }
}

checkMaterialsTable(); 