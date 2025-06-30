
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare } from 'lucide-react';
import QuestionsLoadingState from './questions/QuestionsLoadingState';
import QuestionsEmptyState from './questions/QuestionsEmptyState';
import QuestionsList from './questions/QuestionsList';
import QuestionResponseForm from './questions/QuestionResponseForm';

interface Question {
  id: string;
  pergunta: string;
  resposta: string;
  data_pergunta: string;
  data_resposta: string;
  respondida: boolean;
}

interface StudentQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string | null;
  studentName: string;
}

const StudentQuestionsModal = ({ open, onOpenChange, studentId, studentName }: StudentQuestionsModalProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [resposta, setResposta] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open && studentId) {
      fetchQuestions();
    }
  }, [open, studentId]);

  const fetchQuestions = async () => {
    if (!studentId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('duvidas')
        .select('*')
        .eq('aluno_id', studentId)
        .eq('professor_id', user.id)
        .order('data_pergunta', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Erro ao buscar dúvidas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as dúvidas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (question: Question) => {
    setSelectedQuestion(question);
    setResposta(question.resposta || '');
  };

  const handleSendResponse = async () => {
    if (!selectedQuestion || !resposta.trim()) return;

    setSendingResponse(true);
    try {
      const { error } = await supabase
        .from('duvidas')
        .update({
          resposta: resposta.trim(),
          data_resposta: new Date().toISOString(),
          respondida: true
        })
        .eq('id', selectedQuestion.id);

      if (error) throw error;

      toast({
        title: "Resposta enviada!",
        description: "A resposta foi enviada para o aluno",
      });

      handleCancel();
      fetchQuestions();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta",
        variant: "destructive",
      });
    } finally {
      setSendingResponse(false);
    }
  };

  const handleCancel = () => {
    setSelectedQuestion(null);
    setResposta('');
  };

  const handleClose = () => {
    handleCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Dúvidas - {studentName}</span>
          </DialogTitle>
          <DialogDescription>
            Gerencie as dúvidas do aluno e envie suas respostas.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <QuestionsLoadingState />
        ) : (
          <>
            {questions.length === 0 ? (
              <QuestionsEmptyState />
            ) : (
              <QuestionsList questions={questions} onRespond={handleRespond} />
            )}
          </>
        )}

        {selectedQuestion && (
          <QuestionResponseForm
            selectedQuestion={selectedQuestion}
            resposta={resposta}
            sendingResponse={sendingResponse}
            onRespostaChange={setResposta}
            onSendResponse={handleSendResponse}
            onCancel={handleCancel}
          />
        )}

        {!selectedQuestion && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentQuestionsModal;
