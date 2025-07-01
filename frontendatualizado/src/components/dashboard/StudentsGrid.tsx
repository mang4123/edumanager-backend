import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, MessageSquare, UserPlus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import StudentQuestionsModal from './StudentQuestionsModal';
import InviteStudentModal from './InviteStudentModal';

interface Student {
  id: string;
  aluno_id: string;
  nome: string;
  email: string;
  telefone?: string;
  nivel?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
}

const StudentsGrid = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (user && session) {
      fetchStudents();
    }
  }, [user, session]);

  const getAuthToken = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      return currentSession?.access_token;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  };

  const fetchStudents = async () => {
    try {
      setRefreshing(true);
      
      // Obter token do Supabase corretamente
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://edumanager-backend-5olt.onrender.com';
      
      const response = await fetch(`${backendUrl}/api/professor/alunos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setStudents(result.data || []);
        
        if (result.data?.length > 0) {
          toast({
            title: "Alunos carregados!",
            description: `${result.data.length} aluno(s) encontrado(s)`,
          });
        }
      } else {
        throw new Error(result.error || 'Erro ao buscar alunos');
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos. Usando dados do Supabase como fallback...",
        variant: "destructive",
      });
      
      // Fallback: tentar consulta direta Supabase
      await fetchStudentsFromSupabase();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStudentsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          *,
          aluno_profile:profiles!alunos_aluno_id_fkey(id, nome, email, telefone)
        `)
        .eq('professor_id', user?.id)
        .eq('ativo', true);

      if (error) throw error;

      // Formatar dados para compatibilidade
      const studentsFormatted = (data || [])
        .filter(student => student.aluno_profile)
        .map(student => ({
          id: student.id,
          aluno_id: student.aluno_id,
          nome: student.aluno_profile.nome,
          email: student.aluno_profile.email,
          telefone: student.aluno_profile.telefone,
          nivel: student.nivel,
          observacoes: student.observacoes,
          ativo: student.ativo,
          created_at: student.created_at
        }));

      setStudents(studentsFormatted);
      
      if (studentsFormatted.length > 0) {
        toast({
          title: "Fallback bem-sucedido!",
          description: `${studentsFormatted.length} aluno(s) carregado(s) do Supabase`,
        });
      }
    } catch (error) {
      console.error('Fallback também falhou:', error);
      toast({
        title: "Erro completo",
        description: "Não foi possível carregar alunos nem do backend nem do Supabase",
        variant: "destructive",
      });
    }
  };

  const handleViewHistory = (studentId: string) => {
    console.log('Navigating to student history:', studentId);
    navigate(`/student-history/${studentId}`);
  };

  const handleViewQuestions = (studentId: string) => {
    setSelectedStudentId(studentId);
    setQuestionsModalOpen(true);
  };

  // CORREÇÃO: Função callback para atualizar lista após criar convite
  const handleInviteCreated = async () => {
    await fetchStudents();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Alunos</h2>
          <Button 
            className="gradient-secondary text-white"
            onClick={() => setInviteModalOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Aluno
          </Button>
        </div>
        <p className="text-muted-foreground">Carregando alunos...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Alunos ({students.length})</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={fetchStudents}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            className="gradient-secondary text-white"
            onClick={() => setInviteModalOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Aluno
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum aluno cadastrado</h3>
          <p className="text-gray-500 mb-4">
            Você ainda não tem alunos vinculados ao seu perfil.
          </p>
          <Button 
            className="gradient-secondary text-white"
            onClick={() => setInviteModalOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Primeiro Aluno
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {student.nome || 'Nome não informado'}
                    </h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aluno desde:</span>
                    <span className="text-gray-900">
                      {new Date(student.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nível:</span>
                    <span className="text-gray-900">{student.nivel || 'Não definido'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total de aulas:</span>
                    <span className="text-gray-900">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Próxima aula:</span>
                    <span className="text-gray-900">Não agendada</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dúvidas pendentes:</span>
                    <span className="text-gray-900">0</span>
                  </div>
                </div>

                {student.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-500">Obs:</span> {student.observacoes}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewHistory(student.aluno_id)}
                  >
                    Ver Histórico
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewQuestions(student.aluno_id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Dúvidas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StudentQuestionsModal
        open={questionsModalOpen}
        onOpenChange={setQuestionsModalOpen}
        studentId={selectedStudentId}
        studentName={students.find(s => s.aluno_id === selectedStudentId)?.nome || ''}
      />

      <InviteStudentModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen} 
        onInviteCreated={handleInviteCreated}
      />
    </>
  );
};

export default StudentsGrid;