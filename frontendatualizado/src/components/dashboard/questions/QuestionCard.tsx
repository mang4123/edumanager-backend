
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageSquare, Send } from 'lucide-react';

interface Question {
  id: string;
  pergunta: string;
  resposta: string;
  data_pergunta: string;
  data_resposta: string;
  respondida: boolean;
}

interface QuestionCardProps {
  question: Question;
  onRespond: (question: Question) => void;
}

const QuestionCard = ({ question, onRespond }: QuestionCardProps) => {
  return (
    <div
      className={`p-4 rounded-lg border ${
        question.respondida ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-gray-900 mb-1">
            {question.pergunta}
          </p>
          <p className="text-sm text-gray-500">
            Pergunta feita em: {new Date(question.data_pergunta).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Badge variant={question.respondida ? 'default' : 'secondary'}>
          {question.respondida ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <MessageSquare className="w-3 h-3 mr-1" />
          )}
          {question.respondida ? 'Respondida' : 'Pendente'}
        </Badge>
      </div>

      {question.respondida && question.resposta && (
        <div className="mt-3 p-3 bg-white rounded border">
          <p className="text-sm text-gray-700 mb-1">
            <strong>Sua resposta:</strong> {question.resposta}
          </p>
          <p className="text-xs text-gray-500">
            Respondida em: {new Date(question.data_resposta).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}

      {!question.respondida && (
        <div className="mt-3">
          <Button
            size="sm"
            onClick={() => onRespond(question)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Send className="w-3 h-3 mr-1" />
            Responder
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
