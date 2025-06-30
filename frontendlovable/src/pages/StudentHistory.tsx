
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import StudentHeader from '@/components/student-history/StudentHeader';
import StudentOverviewTab from '@/components/student-history/StudentOverviewTab';
import StudentClassesTab from '@/components/student-history/StudentClassesTab';
import StudentQuestionsTab from '@/components/student-history/StudentQuestionsTab';
import StudentMaterialsTab from '@/components/student-history/StudentMaterialsTab';
import StudentFinancialTab from '@/components/student-history/StudentFinancialTab';
import StudentRecordingsTab from '@/components/student-history/StudentRecordingsTab';

interface Student {
  id: string;
  profiles: { name: string }[];
  nivel: string;
  observacoes: string;
  created_at: string;
}

interface Aula {
  id: string;
  data_hora: string;
  duracao: number;
  assunto: string;
  status: string;
  observacoes: string;
}

interface Duvida {
  id: string;
  pergunta: string;
  resposta: string;
  data_pergunta: string;
  data_resposta: string;
  respondida: boolean;
}

interface Material {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  created_at: string;
}

interface Financeiro {
  id: string;
  valor: number;
  descricao: string;
  data_vencimento: string;
  data_pagamento: string;
  status: string;
  metodo_pagamento: string;
}

const StudentHistory = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [financeiro, setFinanceiro] = useState<Financeiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('StudentId from URL:', studentId);
    if (studentId && studentId !== ':studentId') {
      // Validate if studentId looks like a UUID (more flexible validation)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(studentId)) {
        fetchStudentData();
      } else {
        console.error('Invalid UUID format for studentId:', studentId);
        toast({
          title: "Erro",
          description: "ID do aluno inválido. Por favor, volte ao dashboard e tente novamente.",
          variant: "destructive"
        });
        setLoading(false);
      }
    } else {
      console.error('Invalid studentId:', studentId);
      setLoading(false);
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for student:', studentId);

      // Buscar dados do aluno
      const { data: studentData, error: studentError } = await supabase
        .from('alunos')
        .select('*, profiles(name)')
        .eq('id', studentId)
        .single();

      if (studentError) {
        console.error('Error fetching student:', studentError);
        throw studentError;
      }
      
      console.log('Student data:', studentData);
      setStudent(studentData);

      // Buscar aulas
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('*')
        .eq('aluno_id', studentId)
        .order('data_hora', { ascending: false });

      if (aulasError) {
        console.error('Error fetching aulas:', aulasError);
        throw aulasError;
      }
      setAulas(aulasData || []);

      // Buscar dúvidas
      const { data: duvidasData, error: duvidasError } = await supabase
        .from('duvidas')
        .select('*')
        .eq('aluno_id', studentId)
        .order('data_pergunta', { ascending: false });

      if (duvidasError) {
        console.error('Error fetching duvidas:', duvidasError);
        throw duvidasError;
      }
      setDuvidas(duvidasData || []);

      // Buscar materiais
      const { data: materiaisData, error: materiaisError } = await supabase
        .from('materiais')
        .select('*')
        .eq('aluno_id', studentId)
        .order('created_at', { ascending: false });

      if (materiaisError) {
        console.error('Error fetching materiais:', materiaisError);
        throw materiaisError;
      }
      setMateriais(materiaisData || []);

      // Buscar dados financeiros
      const { data: financeiroData, error: financeiroError } = await supabase
        .from('financeiro')
        .select('*')
        .eq('aluno_id', studentId)
        .order('created_at', { ascending: false });

      if (financeiroError) {
        console.error('Error fetching financeiro:', financeiroError);
        throw financeiroError;
      }
      setFinanceiro(financeiroData || []);

    } catch (error) {
      console.error('Erro ao buscar dados do aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do aluno",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando histórico do aluno...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Aluno não encontrado ou ID inválido
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Verifique se o aluno existe e se você tem permissão para visualizar seus dados.
          </p>
          <Button onClick={() => navigate('/teacher-dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentHeader student={student} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="classes">Aulas</TabsTrigger>
            <TabsTrigger value="questions">Dúvidas</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="recordings">Gravações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StudentOverviewTab 
              student={student}
              aulasCount={aulas.length}
              duvidasCount={duvidas.length}
              materiaisCount={materiais.length}
              financeiroCount={financeiro.length}
            />
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <StudentClassesTab aulas={aulas} />
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <StudentQuestionsTab duvidas={duvidas} />
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <StudentMaterialsTab materiais={materiais} />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <StudentFinancialTab financeiro={financeiro} />
          </TabsContent>

          <TabsContent value="recordings" className="space-y-6">
            <StudentRecordingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentHistory;
