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
      console.log('🔍 Buscando aulas...');
      
      // Primeiro, buscar aulas simples
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .order('data_hora', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar aulas:', error);
        throw error;
      }

      console.log('✅ Aulas encontradas:', data?.length || 0);
      setAulas(data || []);
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aulas",
        variant: "destructive"
      });
    }
  };

  const fetchAlunos = async () => {
    try {
      console.log('🔍 Buscando alunos...');
      
      // Primeiro, buscar alunos simples
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('ativo', true);

      if (error) {
        console.error('❌ Erro ao buscar alunos:', error);
        throw error;
      }

      console.log('✅ Alunos encontrados:', data?.length || 0);
      setAlunos(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos",
        variant: "destructive"
      });
    }
  };

  const handleCreateAula = async () => {
    if (!newAula.aluno_id || !newAula.assunto) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
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
      fetchAulas();
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

      fetchAulas();
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
    aulas,
    alunos,
    loading,
    newAula,
    setNewAula,
    handleCreateAula,
    handleDeleteAula
  };
}; 