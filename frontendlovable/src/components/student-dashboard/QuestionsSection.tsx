
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  date: string;
  answered: boolean;
  answer?: string;
}

const QuestionsSection = () => {
  const [newQuestion, setNewQuestion] = useState('');

  const questions: Question[] = [
    {
      id: 1,
      question: 'Como usar "do" e "does" em perguntas?',
      date: '2024-12-22',
      answered: false
    },
    {
      id: 2,
      question: 'Qual a diferença entre "there is" e "there are"?',
      date: '2024-12-20',
      answered: true,
      answer: 'Respondido na aula de hoje!'
    }
  ];

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      console.log('Nova pergunta:', newQuestion);
      setNewQuestion('');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Fazer uma Pergunta</CardTitle>
          <CardDescription>
            Registre suas dúvidas e elas serão respondidas na próxima aula
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <Textarea
              placeholder="Digite sua dúvida aqui..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" className="gradient-primary text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar Pergunta
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suas Dúvidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className={`p-4 rounded-lg border ${
                question.answered ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{question.question}</p>
                    <p className="text-sm text-gray-500 mt-1">Enviada em {question.date}</p>
                    {question.answered && question.answer && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-sm text-green-800">
                          <strong>Resposta:</strong> {question.answer}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    question.answered 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {question.answered ? 'Respondida' : 'Pendente'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default QuestionsSection;
