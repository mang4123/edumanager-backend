import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeacherAgenda from '@/components/TeacherAgenda';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentClasses from '@/components/dashboard/RecentClasses';
import StudentsGrid from '@/components/dashboard/StudentsGrid';
import MaterialsSection from '@/components/dashboard/MaterialsSection';
import FinancialSection from '@/components/dashboard/FinancialSection';
import RecordingsSection from '@/components/dashboard/RecordingsSection';
import InvitesList from '@/components/dashboard/InvitesList';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentClasses: [],
    students: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar alunos
      const { data: alunos, error: alunosError } = await supabase
        .from('alunos')
        .select(`
          id,
          ativo,
          profiles!inner(nome, email)
        `)
        .eq('professor_id', user?.id)
        .eq('ativo', true);

      if (alunosError) throw alunosError;

      // Buscar aulas do mês atual
      const mesAtual = new Date();
      const primeiroDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
      const ultimoDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);

      const { data: aulas, error: aulasError } = await supabase
        .from('aulas')
        .select(`
          id,
          data_hora,
          assunto,
          status,
          aluno_id,
          profiles!aulas_aluno_id_fkey(nome)
        `)
        .eq('professor_id', user?.id)
        .gte('data_hora', primeiroDiaMes.toISOString())
        .lte('data_hora', ultimoDiaMes.toISOString())
        .order('data_hora', { ascending: false });

      if (aulasError) throw aulasError;

      // Buscar dados financeiros
      const { data: financeiro, error: financeiroError } = await supabase
        .from('financeiro')
        .select('*')
        .eq('professor_id', user?.id);

      if (financeiroError) throw financeiroError;

      // Calcular estatísticas
      const totalAlunos = alunos?.length || 0;
      const totalAulas = aulas?.length || 0;
      const receitaMensal = financeiro?.filter(f => f.status === 'pago').reduce((sum, f) => sum + f.valor, 0) || 0;

      // Próximas aulas (hoje e amanhã)
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);

             const proximasAulas = aulas?.filter(aula => {
         const aulaData = new Date(aula.data_hora);
         return aulaData >= hoje && aulaData <= amanha;
       }).slice(0, 3).map(aula => ({
         id: aula.id,
         student: (aula as any).profiles?.nome || 'Aluno',
         subject: aula.assunto || 'Aula',
         time: new Date(aula.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
         date: new Date(aula.data_hora).toDateString() === hoje.toDateString() ? 'Hoje' : 'Amanhã',
         status: aula.status || 'agendada'
       })) || [];

      // Montar estatísticas
      const stats = [
        {
          title: 'Aulas este mês',
          value: totalAulas.toString(),
          change: totalAulas > 0 ? `+${totalAulas}` : '0',
          icon: <Calendar className="w-5 h-5 text-primary-500" />
        },
        {
          title: 'Alunos ativos',
          value: totalAlunos.toString(),
          change: totalAlunos > 0 ? `+${totalAlunos}` : '0',
          icon: <Users className="w-5 h-5 text-secondary-500" />
        },
        {
          title: 'Receita mensal',
          value: `R$ ${receitaMensal.toFixed(2)}`,
          change: receitaMensal > 0 ? `+${((receitaMensal / 1000) * 100).toFixed(0)}%` : '0%',
          icon: <DollarSign className="w-5 h-5 text-accent-500" />
        },
        {
          title: 'Total de aulas',
          value: totalAulas.toString(),
          change: '0',
          icon: <Star className="w-5 h-5 text-yellow-500" />
        }
      ];

             // Montar lista de estudantes
       const students = alunos?.map(aluno => ({
         id: aluno.id,
         name: (aluno as any).profiles?.nome || 'Aluno',
         subject: 'Matéria', // Pode ser melhorado buscando das aulas
         level: 'Nível',
         nextClass: null,
         totalClasses: aulas?.filter(a => a.aluno_id === aluno.id).length || 0,
         questions: 0 // Pode ser melhorado buscando das dúvidas
       })) || [];

      setDashboardData({
        stats,
        recentClasses: proximasAulas,
        students
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user} 
        logout={logout} 
        title="EduManager" 
        subtitle="Painel do Professor" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="materials">Exercícios</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="recordings">Gravações ⭐</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsCards stats={dashboardData.stats} />
            <QuickActions />
            <RecentClasses classes={dashboardData.recentClasses} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Agenda de Aulas</h2>
            </div>
            <TeacherAgenda />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <StudentsGrid students={dashboardData.students} />
            <InvitesList />
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <MaterialsSection />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialSection />
          </TabsContent>

          <TabsContent value="recordings" className="space-y-6">
            <RecordingsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
