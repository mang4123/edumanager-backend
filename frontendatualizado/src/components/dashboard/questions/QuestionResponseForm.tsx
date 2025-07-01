
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  pergunta: string;
  resposta: string;
  data_pergunta: string;
  data_resposta: string;
  respondida: boolean;
}

interface QuestionResponseFormProps {
  selectedQuestion: Question;
  resposta: string;
  sendingResponse: boolean;
  onRespostaChange: (value: string) => void;
  onSendResponse: () => void;
  onCancel: () => void;
}

const QuestionResponseForm = ({
  selectedQuestion,
  resposta,
  sendingResponse,
  onRespostaChange,
  onSendResponse,
  onCancel
}: QuestionResponseFormProps) => {
  return (
    <div className="border-t pt-4">
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Respondendo à pergunta:</Label>
          <p className="text-sm text-gray-600 italic mt-1">
            "{selectedQuestion.pergunta}"
          </p>
        </div>
        <div>
          <Label htmlFor="resposta">Sua resposta</Label>
          <Textarea
            id="resposta"
            value={resposta}
            onChange={(e) => onRespostaChange(e.target.value)}
            placeholder="Digite sua resposta para o aluno..."
            rows={4}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={onSendResponse}
          disabled={!resposta.trim() || sendingResponse}
        >
          {sendingResponse ? 'Enviando...' : 'Enviar Resposta'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionResponseForm;
