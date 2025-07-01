import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  pergunta: string;
  resposta?: string;
  respondida: boolean;
  data_pergunta: string;
  data_resposta?: string;
  professor_id: string;
  aluno_id: string;
}

const QuestionsSection = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionSubject, setQuestionSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [professorInfo, setProfessorInfo] = useState<{id: string, nome: string} | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchQuestions();
    }
  }, [user?.id]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      // 1. Primeiro, descobrir qual professor está vinculado a este aluno
      const { data: alunoRelacao, error: alunoError } = await supabase
        .from('alunos')
        .select(`
          professor_id,
          profiles!alunos_professor_id_fkey(nome)
        `)
        .eq('aluno_id', user?.id)
        .eq('ativo', true)
        .single();

      if (alunoError || !alunoRelacao) {
        console.log('Aluno não vinculado a nenhum professor ainda');
        setQuestions([]);
        setLoading(false);
        return;
      }

      const professorId = alunoRelacao.professor_id;
      setProfessorInfo({
        id: professorId,
        nome: (alunoRelacao as any).profiles?.nome || 'Professor'
      });

      // 2. Buscar dúvidas deste aluno com este professor
      const { data: duvidasData, error: duvidasError } = await supabase
        .from('duvidas')
        .select('*')
        .eq('aluno_id', user?.id)
        .eq('professor_id', professorId)
        .order('data_pergunta', { ascending: false });

      if (duvidasError) {
        // Se a tabela não existir ou der erro, continua sem dúvidas
        console.log('Tabela duvidas pode não existir ainda:', duvidasError);
        setQuestions([]);
      } else {
        setQuestions(duvidasData || []);
      }

    } catch (error: any) {
      console.error('Erro ao buscar dúvidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) {
      toast({
        title: "Pergunta obrigatória",
        description: "Digite sua dúvida antes de enviar",
        variant: "destructive",
      });
      return;
    }

    if (!professorInfo) {
      toast({
        title: "Professor não encontrado",
        description: "Você precisa estar vinculado a um professor para enviar dúvidas",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('duvidas')
        .insert([{
          aluno_id: user?.id,
          professor_id: professorInfo.id,
          pergunta: newQuestion.trim(),
          respondida: false,
          data_pergunta: new Date().toISOString()
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Dúvida enviada!",
        description: `Sua pergunta foi enviada para ${professorInfo.nome}`,
      });

      // Limpar formulário e recarregar dúvidas
      setNewQuestion('');
      setQuestionSubject('');
      await fetchQuestions();

    } catch (error: any) {
      console.error('Erro ao enviar dúvida:', error);
      toast({
        title: "Erro ao enviar dúvida",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Fazer uma Pergunta</CardTitle>
          <CardDescription>
            {professorInfo 
              ? `Envie suas dúvidas para ${professorInfo.nome} e elas serão respondidas`
              : 'Você precisa estar vinculado a um professor para enviar dúvidas'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Assunto (opcional)</Label>
              <Input
                id="subject"
                placeholder="Ex: Matemática, Português, etc."
                value={questionSubject}
                onChange={(e) => setQuestionSubject(e.target.value)}
                disabled={!professorInfo || submitting}
              />
            </div>
            
            <div>
              <Label htmlFor="question">Sua Dúvida</Label>
              <Textarea
                id="question"
                placeholder="Digite sua dúvida detalhadamente..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="min-h-[100px]"
                disabled={!professorInfo || submitting}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="gradient-primary text-white"
              disabled={!professorInfo || submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Pergunta
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suas Dúvidas</CardTitle>
          <CardDescription>
            {questions.length > 0 
              ? `${questions.length} pergunta(s) registrada(s)` 
              : 'Nenhuma dúvida enviada ainda'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {professorInfo 
                  ? 'Você ainda não enviou nenhuma dúvida. Use o formulário acima para fazer sua primeira pergunta!'
                  : 'Vincule-se a um professor para começar a enviar dúvidas.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className={`p-4 rounded-lg border ${
                  question.respondida ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">{question.pergunta}</p>
                      <p className="text-sm text-gray-500">
                        Enviada em {new Date(question.data_pergunta).toLocaleDateString('pt-BR')} às {new Date(question.data_pergunta).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      
                      {question.respondida && question.resposta && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm text-green-800 mb-1">
                            <strong>Resposta de {professorInfo?.nome || 'Professor'}:</strong>
                          </p>
                          <p className="text-sm text-gray-700">{question.resposta}</p>
                          {question.data_resposta && (
                            <p className="text-xs text-gray-500 mt-2">
                              Respondida em {new Date(question.data_resposta).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      question.respondida 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {question.respondida ? 'Respondida' : 'Pendente'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default QuestionsSection;