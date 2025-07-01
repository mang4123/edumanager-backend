const { supabaseAdmin } = require('./src/config/supabase.ts');

async function corrigirRelacionamento() {
  console.log('=== CORREÇÃO DO RELACIONAMENTO PROFESSOR-ALUNO ===');
  
  const professorId = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
  const alunoId = '7ca41f3b-62dd-4d64-9c05-cb694bd6fdf4';
  
  try {
    // 1. Verificar se tabela alunos existe
    console.log('\n1. VERIFICANDO TABELA ALUNOS:');
    const { data: tabelaTest, error: erroTabela } = await supabaseAdmin
      .from('alunos')
      .select('count')
      .limit(1);
    
    if (erroTabela) {
      console.log('❌ Tabela alunos não existe:', erroTabela.message);
      console.log('🔧 Precisa criar a tabela alunos no Supabase');
      process.exit(1);
    } else {
      console.log('✅ Tabela alunos existe');
    }
    
    // 2. Verificar convites
    console.log('\n2. VERIFICANDO CONVITES:');
    const { data: convites } = await supabaseAdmin
      .from('convites')
      .select('*')
      .eq('professor_id', professorId);
    
    console.log('📧 Convites encontrados:', convites?.length || 0);
    
    // 3. Verificar perfil do aluno
    console.log('\n3. VERIFICANDO PERFIL DO ALUNO:');
    const { data: perfilAluno } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', alunoId)
      .single();
    
    if (perfilAluno) {
      console.log('✅ Perfil do aluno:', perfilAluno.nome, '-', perfilAluno.email);
    } else {
      console.log('❌ Perfil do aluno não encontrado');
      process.exit(1);
    }
    
    // 4. Verificar relacionamento atual
    console.log('\n4. VERIFICANDO RELACIONAMENTO:');
    const { data: relacionamentoAtual } = await supabaseAdmin
      .from('alunos')
      .select('*')
      .eq('professor_id', professorId)
      .eq('aluno_id', alunoId);
    
    if (relacionamentoAtual && relacionamentoAtual.length > 0) {
      console.log('✅ Relacionamento já existe:', relacionamentoAtual[0]);
    } else {
      console.log('❌ Relacionamento não existe');
      
      // 5. CRIAR RELACIONAMENTO
      console.log('\n5. CRIANDO RELACIONAMENTO:');
      const { data: novoRelacionamento, error: erroRelacionamento } = await supabaseAdmin
        .from('alunos')
        .insert({
          professor_id: professorId,
          aluno_id: alunoId,
          ativo: true,
          data_inicio: new Date().toISOString().split('T')[0],
          observacoes: 'Vinculação automática via convite',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (erroRelacionamento) {
        console.log('❌ Erro ao criar relacionamento:', erroRelacionamento.message);
      } else {
        console.log('✅ Relacionamento criado com sucesso!');
        console.log('📋 Dados:', novoRelacionamento);
      }
    }
    
    // 6. Marcar convite como aceito
    console.log('\n6. ATUALIZANDO CONVITES:');
    if (convites && convites.length > 0) {
      const { error: erroConvite } = await supabaseAdmin
        .from('convites')
        .update({ 
          status: 'aceito',
          usado_em: new Date().toISOString()
        })
        .eq('professor_id', professorId)
        .eq('email', perfilAluno.email);
      
      if (erroConvite) {
        console.log('⚠️ Erro ao atualizar convite:', erroConvite.message);
      } else {
        console.log('✅ Convite marcado como aceito');
      }
    }
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('📝 Agora o aluno deve aparecer no painel do professor');
    console.log('📝 E o aluno deve ver que está vinculado ao professor');
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
  
  process.exit(0);
}

corrigirRelacionamento().catch(console.error); 