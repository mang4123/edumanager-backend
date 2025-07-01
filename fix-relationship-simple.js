const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = 'https://qyaorhetkrgmkrtzjpvm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada no .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function corrigirRelacionamento() {
  console.log('=== CORREÇÃO DO RELACIONAMENTO PROFESSOR-ALUNO ===');
  
  const professorId = 'e650f5ee-747b-4574-9bfa-8e2d411c4974';
  const alunoId = '7ca41f3b-62dd-4d64-9c05-cb694bd6fdf4';
  
  try {
    // 1. Verificar perfil do aluno
    console.log('\n1. VERIFICANDO PERFIL DO ALUNO:');
    console.log('🔍 Buscando aluno ID:', alunoId);
    
    const { data: perfilsAluno, error: erroAluno } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', alunoId);
    
    console.log('📊 Resultado da busca:');
    console.log('   - Error:', erroAluno?.message || 'Nenhum');
    console.log('   - Dados:', perfilsAluno?.length || 0, 'registros');
    
    if (erroAluno || !perfilsAluno || perfilsAluno.length === 0) {
      console.log('❌ Perfil do aluno não encontrado');
      
      // Tentar buscar por email
      console.log('\n🔍 TENTANDO BUSCAR POR EMAIL:');
      const { data: perfilsPorEmail, error: erroPorEmail } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', 'pedrolima@gmail.com');
      
      console.log('📊 Busca por email:');
      console.log('   - Error:', erroPorEmail?.message || 'Nenhum');
      console.log('   - Dados:', perfilsPorEmail?.length || 0, 'registros');
      
      if (perfilsPorEmail && perfilsPorEmail.length > 0) {
        console.log('✅ Perfil encontrado por email:', perfilsPorEmail[0]);
        const perfilAluno = perfilsPorEmail[0];
        // Usar esse perfil para continuar
        await continuarProcesso(professorId, perfilAluno.id, perfilAluno);
      }
      return;
    }
    
    const perfilAluno = perfilsAluno[0];
    console.log('✅ Perfil do aluno:', perfilAluno.nome, '-', perfilAluno.email);
    
    await continuarProcesso(professorId, alunoId, perfilAluno);
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
  
  process.exit(0);
}

async function continuarProcesso(professorId, alunoId, perfilAluno) {
  // 2. Verificar se tabela alunos existe
  console.log('\n2. VERIFICANDO TABELA ALUNOS:');
  const { data: tabelaTest, error: erroTabela } = await supabaseAdmin
    .from('alunos')
    .select('*')
    .limit(1);
  
  if (erroTabela) {
    console.log('❌ Erro na tabela alunos:', erroTabela.message);
    
    // Se a tabela não existe, vamos criá-la
    if (erroTabela.message.includes('does not exist')) {
      console.log('🔧 TABELA ALUNOS NÃO EXISTE!');
      console.log(`
📋 EXECUTE ESTE SQL NO SUPABASE:

CREATE TABLE IF NOT EXISTS alunos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT true,
    data_inicio DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(professor_id, aluno_id)
);

-- Policies
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores podem ver seus alunos" ON alunos
    FOR ALL USING (auth.uid() = professor_id);

CREATE POLICY "Alunos podem ver seu próprio registro" ON alunos
    FOR SELECT USING (auth.uid() = aluno_id);
      `);
      return;
    }
    return;
  }
  
  console.log('✅ Tabela alunos existe');
  
  // 3. Verificar relacionamento atual
  console.log('\n3. VERIFICANDO RELACIONAMENTO:');
  const { data: relacionamentoAtual } = await supabaseAdmin
    .from('alunos')
    .select('*')
    .eq('professor_id', professorId)
    .eq('aluno_id', alunoId);
  
  if (relacionamentoAtual && relacionamentoAtual.length > 0) {
    console.log('✅ Relacionamento já existe:', relacionamentoAtual[0]);
  } else {
    console.log('❌ Relacionamento não existe');
    
    // 4. CRIAR RELACIONAMENTO
    console.log('\n4. CRIANDO RELACIONAMENTO:');
    const { data: novoRelacionamento, error: erroRelacionamento } = await supabaseAdmin
      .from('alunos')
      .insert({
        professor_id: professorId,
        aluno_id: alunoId,
        ativo: true
      })
      .select();
    
    if (erroRelacionamento) {
      console.log('❌ Erro ao criar relacionamento:', erroRelacionamento.message);
    } else {
      console.log('✅ Relacionamento criado com sucesso!');
      console.log('📋 Dados:', novoRelacionamento);
    }
  }
  
  // 5. Verificar convites e marcar como aceito
  console.log('\n5. ATUALIZANDO CONVITES:');
  const { data: convites } = await supabaseAdmin
    .from('convites')
    .select('*')
    .eq('professor_id', professorId)
    .eq('email', perfilAluno.email);
  
  console.log('📧 Convites encontrados:', convites?.length || 0);
  
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
  
  console.log('\n🎉 PROCESSO CONCLUÍDO!');
  console.log('📱 Agora teste:');
  console.log('   1. Atualize o painel do professor (F5)');
  console.log('   2. Atualize o painel do aluno (F5)');
  console.log('   3. O aluno deve aparecer vinculado');
}

corrigirRelacionamento().catch(console.error); 