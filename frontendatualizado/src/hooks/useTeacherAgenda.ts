import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Aula, Aluno, NewAula } from '@/types/agenda';

export const useTeacherAgenda = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newAula, setNewAula] = useState<NewAula>({
    aluno_id: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: '09:00',
    duracao: 60,
    assunto: '',
    observacoes: ''
  });

  useEffect(() => {
    fetchAulas();
    fetchAlunos();
  }, []);

  const fetchAulas = async () => {
    try {
      // 1. Buscar aulas SEM JOIN problemático
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('*')
        .order('data_hora', { ascending: true });

      if (aulasError) throw aulasError;
      
      if (!aulasData || aulasData.length === 0) {
        console.log('Nenhuma aula encontrada');
        setAulas([]);
        return;
      }

      // 2. Buscar profiles dos alunos separadamente
      const alunoIds = [...new Set(aulasData.map(aula => aula.aluno_id))];
      
      if (alunoIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', alunoIds);

        if (profilesError) {
          console.error('Erro ao buscar profiles das aulas:', profilesError);
        }

        // 3. Combinar dados no frontend
        const aulasComDados = aulasData.map(aula => ({
          ...aula,
          aluno_profile: profilesData?.find(profile => profile.id === aula.aluno_id) || {
            nome: 'Aluno não encontrado',
            email: ''
          }
        }));

        setAulas(aulasComDados);
      } else {
        setAulas(aulasData);
      }
      
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aulas",
        variant: "destructive"
      });
      setAulas([]); // Importante: definir array vazio em caso de erro
    }
  };

  const fetchAlunos = async () => {
    try {
      // 1. Buscar alunos SEM JOIN problemático
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('id, aluno_id, ativo')
        .eq('ativo', true);

      if (alunosError) throw alunosError;

      if (!alunosData || alunosData.length === 0) {
        console.log('Nenhum aluno encontrado');
        setAlunos([]);
        return;
      }

      // 2. Buscar profiles dos alunos separadamente
      const alunoIds = alunosData.map(aluno => aluno.aluno_id);
      
      if (alunoIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', alunoIds);

        if (profilesError) {
          console.error('Erro ao buscar profiles dos alunos:', profilesError);
        }

        // 3. Combinar dados no frontend
        const alunosComDados = alunosData.map(aluno => ({
          ...aluno,
          aluno_profile: profilesData?.find(profile => profile.id === aluno.aluno_id) || {
            id: aluno.aluno_id,
            nome: 'Aluno não encontrado',
            email: ''
          }
        }));

        setAlunos(alunosComDados);
      } else {
        setAlunos(alunosData);
      }

    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setAlunos([]); // Importante: definir array vazio em caso de erro
    }
  };

  const handleCreateAula = async () => {
    if (!newAula.aluno_id || !newAula.assunto) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Usuário não autenticado');

      const dataHora = new Date(`${newAula.data}T${newAula.hora}:00`);

      const { error } = await supabase
        .from('aulas')
        .insert({
          professor_id: currentUser.user.id,
          aluno_id: newAula.aluno_id,
          data_hora: dataHora.toISOString(),
          duracao: newAula.duracao,
          assunto: newAula.assunto,
          observacoes: newAula.observacoes,
          status: 'agendada'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aula marcada com sucesso!"
      });

      setNewAula({
        aluno_id: '',
        data: format(new Date(), 'yyyy-MM-dd'),
        hora: '09:00',
        duracao: 60,
        assunto: '',
        observacoes: ''
      });
      
      fetchAulas(); // Recarregar aulas
      return true;
      
    } catch (error) {
      console.error('Erro ao criar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a aula",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAula = async (aulaId: string) => {
    try {
      const { error } = await supabase
        .from('aulas')
        .delete()
        .eq('id', aulaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aula desmarcada com sucesso!"
      });

      fetchAulas(); // Recarregar aulas
      
    } catch (error) {
      console.error('Erro ao deletar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desmarcar a aula",
        variant: "destructive"
      });
    }
  };

  return {
    aulas: aulas || [], // Garantir que sempre retorna array
    alunos: alunos || [], // Garantir que sempre retorna array
    loading,
    newAula,
    setNewAula,
    handleCreateAula,
    handleDeleteAula
  };
};
