import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NewClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewClassModal = ({ open, onOpenChange }: NewClassModalProps) => {
  const [alunoId, setAlunoId] = useState('');
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hora, setHora] = useState('09:00');
  const [duracao, setDuracao] = useState(60);
  const [assunto, setAssunto] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar alunos quando o modal abrir
  useEffect(() => {
    if (open) {
      fetchAlunos();
    }
  }, [open]);

  const fetchAlunos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          id,
          profiles!inner(nome)
        `)
        .eq('professor_id', user.id)
        .eq('ativo', true);

      if (error) throw error;
      setAlunos(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    if (!alunoId || !assunto) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const dataHora = new Date(`${data}T${hora}:00`);

      const { error } = await supabase
        .from('aulas')
        .insert({
          professor_id: user.id,
          aluno_id: alunoId,
          data_hora: dataHora.toISOString(),
          duracao,
          assunto,
          observacoes,
          status: 'agendada'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aula marcada com sucesso!"
      });

      // Limpar formulário
      setAlunoId('');
      setData(format(new Date(), 'yyyy-MM-dd'));
      setHora('09:00');
      setDuracao(60);
      setAssunto('');
      setObservacoes('');
      onOpenChange(false);

    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao marcar aula",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Marcar Nova Aula</DialogTitle>
          <DialogDescription>
            Agende uma nova aula com um dos seus alunos.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aluno">Aluno *</Label>
            <Select value={alunoId} onValueChange={setAlunoId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos.map((aluno) => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.profiles?.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Horário *</Label>
              <Input
                id="hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracao">Duração (minutos)</Label>
            <Input
              id="duracao"
              type="number"
              value={duracao}
              onChange={(e) => setDuracao(parseInt(e.target.value))}
              min="15"
              step="15"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto *</Label>
            <Input
              id="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Ex: Revisão de Present Perfect"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais sobre a aula..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Marcando...' : 'Marcar Aula'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewClassModal;