const { supabaseAdmin } = require('./src/config/supabase');

async function investigate() {
  try {
    console.log('=== INVESTIGANDO DADOS ===');
    
    const email = 'aluno.teste@email.com';
    
    // 1. Verificar convites
    const { data: convites } = await supabaseAdmin
      .from('convites')
      .select('*')
      .eq('email', email);
    
    console.log('CONVITES:', JSON.stringify(convites, null, 2));
    
    // 2. Verificar profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email);
    
    console.log('PROFILES:', JSON.stringify(profiles, null, 2));
    
    // 3. Verificar alunos vinculados ao professor
    const { data: alunos } = await supabaseAdmin
      .from('alunos')
      .select('*, profiles!alunos_aluno_id_fkey(*)')
      .eq('professor_id', 'e650f5ee-747b-4574-9bfa-8e2d411c4974');
    
    console.log('ALUNOS PROFESSOR:', JSON.stringify(alunos, null, 2));
    
    // 4. Verificar se há relacionamento entre esse aluno e professor
    if (profiles && profiles.length > 0) {
      const alunoId = profiles[0].id;
      const { data: vinculo } = await supabaseAdmin
        .from('alunos')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('professor_id', 'e650f5ee-747b-4574-9bfa-8e2d411c4974');
      
      console.log('VÍNCULO:', JSON.stringify(vinculo, null, 2));
    }
    
  } catch (error) {
    console.error('ERRO:', error.message);
  }
  
  process.exit(0);
}

investigate(); 