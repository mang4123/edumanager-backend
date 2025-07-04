import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Aula {
  id: string;
  professor_id: string;
  aluno_id: string;
  data_hora: string;
  duracao: number;
  assunto: string;
  status: string;
  observacoes?: string;
  materia?: string;
  professor?: {
    nome: string;
    especialidade: string;
  };
}

const StudentAgenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchAulas();
    }
  }, [user?.id]);

  const fetchAulas = async () => {
    try {
      setLoading(true);

      // 1. Buscar aulas do aluno (SEM JOIN problemático)
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('*')
        .eq('aluno_id', user?.id)
        .order('data_hora', { ascending: true });

      if (aulasError) {
        console.error('Erro ao buscar aulas:', aulasError);
        throw aulasError;
      }

      if (!aulasData || aulasData.length === 0) {
        console.log('Nenhuma aula encontrada para o aluno');
        setAulas([]);
        return;
      }

      // 2. Buscar dados dos professores separadamente
      const professorIds = [...new Set(aulasData.map(aula => aula.professor_id))];
      
      let professoresData: any[] = [];
      if (professorIds.length > 0) {
        const { data: profs, error: profsError } = await supabase
          .from('profiles')
          .select('id, nome, especialidade, email')
          .in('id', professorIds);

        if (profsError) {
          console.error('Erro ao buscar professores:', profsError);
        } else {
          professoresData = profs || [];
        }
      }

      // 3. Combinar dados no frontend
      const aulasComProfessor = aulasData.map(aula => ({
        ...aula,
        professor: professoresData.find(prof => prof.id === aula.professor_id) || {
          nome: 'Professor',
          especialidade: 'Ensino'
        }
      }));

      setAulas(aulasComProfessor);
      console.log(`✅ ${aulasComProfessor.length} aulas carregadas para o aluno`);

    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aulas",
        variant: "destructive"
      });
      setAulas([]); // Importante: definir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const aulasDoMes = aulas.filter(aula => {
    const aulaDate = new Date(aula.data_hora);
    return aulaDate.getMonth() === selectedDate.getMonth() && 
           aulaDate.getFullYear() === selectedDate.getFullYear();
  });

  const aulasDoDia = aulas.filter(aula => 
    isSameDay(new Date(aula.data_hora), selectedDate)
  );

  const diasComAulas = aulasDoMes.map(aula => new Date(aula.data_hora));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'text-blue-600 bg-blue-50';
      case 'concluida':
      case 'realizada':
        return 'text-green-600 bg-green-50';
      case 'cancelada':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'concluida':
      case 'realizada':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status || 'Agendada';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando calendário...</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando aulas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Aulas</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            modifiers={{
              hasClass: diasComAulas
            }}
            modifiersStyles={{
              hasClass: { backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%' }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Aulas de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aulasDoDia.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma aula agendada para este dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aulasDoDia.map((aula) => (
                <div key={aula.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-primary-600" />
                        <span className="font-medium">
                          Prof. {aula.professor?.nome || 'Professor'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(aula.data_hora), 'HH:mm')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-4 h-4 text-secondary-600" />
                        <span className="font-medium text-gray-900">
                          {aula.assunto || 'Aula'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">
                        {aula.professor?.especialidade || aula.materia || 'Ensino'} • Duração: {aula.duracao || 60} minutos
                      </p>
                      
                      {aula.observacoes && (
                        <p className="text-sm text-gray-600 mb-2">{aula.observacoes}</p>
                      )}
                      
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(aula.status)}`}>
                        {getStatusText(aula.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAgenda;