// CONSULTAS PRONTAS PARA O SUPABASE
// Copie estas consultas para o seu projeto Lovable

// 1. BUSCAR ALUNOS DO PROFESSOR (SEM JOIN)
export const buscarAlunos = async (supabase, professorId) => {
  const { data: alunos, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('professor_id', professorId)
    .eq('ativo', true);
  
  if (error) {
    console.error('Erro ao buscar alunos:', error);
    return [];
  }
  
  // Buscar dados dos profiles separadamente
  const alunoIds = alunos.map(a => a.aluno_id);
  if (alunoIds.length === 0) return [];
  
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, nome, email, telefone')
    .in('id', alunoIds);
  
  if (profileError) {
    console.error('Erro ao buscar profiles:', profileError);
    return alunos; // Retorna alunos sem dados do profile
  }
  
  // Combinar dados
  return alunos.map(aluno => ({
    ...aluno,
    profile: profiles.find(p => p.id === aluno.aluno_id)
  }));
};

// 2. BUSCAR AULAS DO PROFESSOR (SEM JOIN)
export const buscarAulas = async (supabase, professorId, limite = 10) => {
  const { data: aulas, error } = await supabase
    .from('aulas')
    .select('*')
    .eq('professor_id', professorId)
    .gte('data_hora', new Date().toISOString())
    .order('data_hora', { ascending: true })
    .limit(limite);
  
  if (error) {
    console.error('Erro ao buscar aulas:', error);
    return [];
  }
  
  // Buscar dados dos alunos separadamente
  const alunoIds = aulas.map(a => a.aluno_id);
  if (alunoIds.length === 0) return aulas;
  
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, nome, email')
    .in('id', alunoIds);
  
  if (profileError) {
    console.error('Erro ao buscar profiles das aulas:', profileError);
    return aulas;
  }
  
  // Combinar dados
  return aulas.map(aula => ({
    ...aula,
    aluno: profiles.find(p => p.id === aula.aluno_id)
  }));
};

// 3. BUSCAR EXERCÍCIOS DO PROFESSOR
export const buscarExercicios = async (supabase, professorId) => {
  const { data, error } = await supabase
    .from('exercicios')
    .select('*')
    .eq('professor_id', professorId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar exercícios:', error);
    return [];
  }
  
  return data || [];
};

// 4. BUSCAR DÚVIDAS DO PROFESSOR
export const buscarDuvidas = async (supabase, professorId) => {
  const { data: duvidas, error } = await supabase
    .from('duvidas')
    .select('*')
    .eq('professor_id', professorId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar dúvidas:', error);
    return [];
  }
  
  // Buscar dados dos alunos
  const alunoIds = duvidas.map(d => d.aluno_id);
  if (alunoIds.length === 0) return duvidas;
  
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, nome, email')
    .in('id', alunoIds);
  
  if (profileError) {
    console.error('Erro ao buscar profiles das dúvidas:', profileError);
    return duvidas;
  }
  
  // Combinar dados
  return duvidas.map(duvida => ({
    ...duvida,
    aluno: profiles.find(p => p.id === duvida.aluno_id)
  }));
};

// 5. BUSCAR DADOS FINANCEIROS
export const buscarFinanceiro = async (supabase, professorId) => {
  const { data: financeiro, error } = await supabase
    .from('financeiro')
    .select('*')
    .eq('professor_id', professorId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar financeiro:', error);
    return [];
  }
  
  // Buscar dados dos alunos
  const alunoIds = financeiro.map(f => f.aluno_id);
  if (alunoIds.length === 0) return financeiro;
  
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, nome, email')
    .in('id', alunoIds);
  
  if (profileError) {
    console.error('Erro ao buscar profiles do financeiro:', profileError);
    return financeiro;
  }
  
  // Combinar dados
  return financeiro.map(item => ({
    ...item,
    aluno: profiles.find(p => p.id === item.aluno_id)
  }));
};

// 6. FUNÇÃO COMPLETA PARA DASHBOARD
export const buscarDadosDashboard = async (supabase, professorId) => {
  try {
    // Buscar todos os dados em paralelo
    const [alunos, aulas, exercicios, duvidas, financeiro] = await Promise.all([
      buscarAlunos(supabase, professorId),
      buscarAulas(supabase, professorId, 5),
      buscarExercicios(supabase, professorId),
      buscarDuvidas(supabase, professorId),
      buscarFinanceiro(supabase, professorId)
    ]);
    
    return {
      alunos,
      aulas,
      exercicios,
      duvidas,
      financeiro,
      stats: {
        totalAlunos: alunos.length,
        totalAulas: aulas.length,
        totalExercicios: exercicios.length,
        duvidasPendentes: duvidas.filter(d => d.status === 'pendente').length,
        receitaTotal: financeiro
          .filter(f => f.status === 'pago')
          .reduce((sum, f) => sum + (f.valor || 0), 0)
      }
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return {
      alunos: [],
      aulas: [],
      exercicios: [],
      duvidas: [],
      financeiro: [],
      stats: {
        totalAlunos: 0,
        totalAulas: 0,
        totalExercicios: 0,
        duvidasPendentes: 0,
        receitaTotal: 0
      }
    };
  }
};

// 7. COMO USAR NO COMPONENTE REACT
/*
import { buscarDadosDashboard } from './queries-prontas-supabase';

const Dashboard = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const carregarDados = async () => {
      const user = supabase.auth.getUser();
      if (user) {
        const dadosDashboard = await buscarDadosDashboard(supabase, user.id);
        setDados(dadosDashboard);
      }
      setLoading(false);
    };
    
    carregarDados();
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total de alunos: {dados.stats.totalAlunos}</p>
      <p>Próximas aulas: {dados.stats.totalAulas}</p>
      // ... resto do componente
    </div>
  );
};
*/ 