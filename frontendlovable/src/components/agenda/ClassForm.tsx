
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NewAula, Aluno } from '@/types/agenda';

interface ClassFormProps {
  newAula: NewAula;
  setNewAula: (aula: NewAula) => void;
  alunos: Aluno[];
  loading: boolean;
  onSubmit: () => Promise<boolean>;
  onClose: () => void;
}

export const ClassForm = ({ newAula, setNewAula, alunos, loading, onSubmit, onClose }: ClassFormProps) => {
  const handleSubmit = async () => {
    const success = await onSubmit();
    if (success) {
      onClose();
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Marcar Nova Aula</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="aluno">Aluno</Label>
          <Select value={newAula.aluno_id} onValueChange={(value) => 
            setNewAula({...newAula, aluno_id: value})
          }>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um aluno" />
            </SelectTrigger>
            <SelectContent>
              {alunos.map((aluno) => (
                <SelectItem key={aluno.id} value={aluno.aluno_id}>
                  {aluno.aluno_profile?.nome || 'Aluno sem nome'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={newAula.data}
              onChange={(e) => setNewAula({...newAula, data: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="hora">Horário</Label>
            <Input
              id="hora"
              type="time"
              value={newAula.hora}
              onChange={(e) => setNewAula({...newAula, hora: e.target.value})}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="duracao">Duração (minutos)</Label>
          <Input
            id="duracao"
            type="number"
            value={newAula.duracao}
            onChange={(e) => setNewAula({...newAula, duracao: parseInt(e.target.value)})}
          />
        </div>

        <div>
          <Label htmlFor="assunto">Assunto</Label>
          <Input
            id="assunto"
            value={newAula.assunto}
            onChange={(e) => setNewAula({...newAula, assunto: e.target.value})}
            placeholder="Ex: Revisão de Present Perfect"
          />
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={newAula.observacoes}
            onChange={(e) => setNewAula({...newAula, observacoes: e.target.value})}
            placeholder="Observações adicionais..."
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full gradient-primary text-white"
          disabled={loading}
        >
          {loading ? 'Marcando...' : 'Marcar Aula'}
        </Button>
      </div>
    </DialogContent>
  );
};
