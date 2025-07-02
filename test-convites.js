const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Iniciando script de verificação de convites...');

// Usar as mesmas credenciais do backend
const supabaseAdmin = createClient(
  'https://pktmkdkdkbgsfixnzxkx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdG1rZGtka2Jnc2ZpeG56eGt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjg3MzI3MSwiZXhwIjoyMDUyNDQ5MjcxfQ.6pFKt7O9kJqG8WgSKCfhHxjBN7wGWmPPtaXLJhyJHb8',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('✅ Cliente Supabase criado');

async function verificarConvites() {
  console.log('🔍 Verificando convites para nataliapereira@gmail.com...');
  
  try {
    console.log('📡 Fazendo consulta à tabela convites...');
    
    // Verificar todos os convites primeiro
    const { data: todosConvites, error: errorTodos } = await supabaseAdmin
      .from('convites')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('📋 Resultado da consulta - Total de convites:', todosConvites?.length || 0);
    console.log('📋 Dados recebidos:', JSON.stringify(todosConvites, null, 2));
    
    if (errorTodos) {
      console.log('❌ Erro ao buscar todos convites:', JSON.stringify(errorTodos, null, 2));
      return;
    }
    
    // Verificar convites específicos para Natalia
    console.log('🔍 Buscando convites específicos para nataliapereira@gmail.com...');
    const { data: convitesNatalia, error: errorNatalia } = await supabaseAdmin
      .from('convites')
      .select('*')
      .eq('email_aluno', 'nataliapereira@gmail.com');
    
    console.log('📋 Convites para Natalia:', JSON.stringify(convitesNatalia, null, 2));
    
    if (errorNatalia) {
      console.log('❌ Erro ao buscar convites da Natalia:', JSON.stringify(errorNatalia, null, 2));
      return;
    }
    
    if (convitesNatalia && convitesNatalia.length > 0) {
      console.log('📊 Total de convites para Natalia:', convitesNatalia.length);
      convitesNatalia.forEach((convite, index) => {
        console.log(`📄 Convite ${index + 1}:`);
        console.log('  - ID:', convite.id);
        console.log('  - Professor ID:', convite.professor_id);
        console.log('  - Email:', convite.email_aluno);
        console.log('  - Nome:', convite.nome_aluno);
        console.log('  - Usado:', convite.usado);
        console.log('  - Criado em:', convite.created_at);
      });
    } else {
      console.log('❌ Nenhum convite encontrado para Natalia!');
      console.log('🔍 Verificando se a tabela convites existe e tem dados...');
      
      if (todosConvites && todosConvites.length > 0) {
        console.log('📊 Exemplo de convites existentes:');
        todosConvites.slice(0, 3).forEach((convite, index) => {
          console.log(`  Convite ${index + 1}: ${convite.email_aluno} - Usado: ${convite.usado}`);
        });
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

console.log('🏃 Executando verificação...');
verificarConvites()
  .then(() => {
    console.log('✅ Script concluído');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }); 