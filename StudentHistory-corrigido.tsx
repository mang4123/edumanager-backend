import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name?: string;
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

      // Buscar dados do aluno - SEM JOIN
      const { data: studentData, error: studentError } = await supabase
        .from('alunos')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) {
        console.error('Error fetching student:', studentError);
        throw studentError;
      }
      
      console.log('Student data:', studentData);
      setStudent(studentData || null);

      // Buscar aulas
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('*')
        .eq('aluno_id', studentId)
        .order('data_hora', { ascending: false });

      if (aulasError) {
        console.error('Error fetching aulas:', aulasError);
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
        {/* Header Simples */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {student.name || 'Aluno'}
              </h1>
              <p className="text-gray-600">Nível: {student.nivel || 'Não informado'}</p>
            </div>
            <Button onClick={() => navigate('/teacher-dashboard')}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        {/* Tabs Simples */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="classes">Aulas ({aulas?.length || 0})</TabsTrigger>
            <TabsTrigger value="questions">Dúvidas ({duvidas?.length || 0})</TabsTrigger>
            <TabsTrigger value="materials">Materiais ({materiais?.length || 0})</TabsTrigger>
            <TabsTrigger value="financial">Financeiro ({financeiro?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Resumo do Aluno</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">{aulas?.length || 0}</div>
                  <div className="text-sm text-gray-600">Aulas</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-orange-600">{duvidas?.length || 0}</div>
                  <div className="text-sm text-gray-600">Dúvidas</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">{materiais?.length || 0}</div>
                  <div className="text-sm text-gray-600">Materiais</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">{financeiro?.length || 0}</div>
                  <div className="text-sm text-gray-600">Cobranças</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Aulas</h2>
              {aulas && aulas.length > 0 ? (
                <div className="space-y-4">
                  {aulas.map((aula) => (
                    <div key={aula.id} className="border rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{aula.assunto}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(aula.data_hora).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Duração: {aula.duracao} min</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          aula.status === 'realizada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {aula.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma aula encontrada.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Dúvidas</h2>
              {duvidas && duvidas.length > 0 ? (
                <div className="space-y-4">
                  {duvidas.map((duvida) => (
                    <div key={duvida.id} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Pergunta</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          duvida.respondida ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {duvida.respondida ? 'Respondida' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{duvida.pergunta}</p>
                      {duvida.resposta && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm font-medium text-gray-600">Resposta:</p>
                          <p className="text-gray-700">{duvida.resposta}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma dúvida encontrada.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Materiais</h2>
              {materiais && materiais.length > 0 ? (
                <div className="space-y-4">
                  {materiais.map((material) => (
                    <div key={material.id} className="border rounded p-4">
                      <h3 className="font-medium">{material.titulo}</h3>
                      <p className="text-gray-600">{material.descricao}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Tipo: {material.tipo} | 
                        Criado em: {new Date(material.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum material encontrado.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Dados Financeiros</h2>
              {financeiro && financeiro.length > 0 ? (
                <div className="space-y-4">
                  {financeiro.map((item) => (
                    <div key={item.id} className="border rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.descricao}</h3>
                          <p className="text-lg font-bold text-green-600">
                            R$ {item.valor?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Vencimento: {new Date(item.data_vencimento).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum dado financeiro encontrado.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentHistory; 