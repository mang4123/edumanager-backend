
import QuestionCard from './QuestionCard';

interface Question {
  id: string;
  pergunta: string;
  resposta: string;
  data_pergunta: string;
  data_resposta: string;
  respondida: boolean;
}

interface QuestionsListProps {
  questions: Question[];
  onRespond: (question: Question) => void;
}

const QuestionsList = ({ questions, onRespond }: QuestionsListProps) => {
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onRespond={onRespond}
        />
      ))}
    </div>
  );
};

export default QuestionsList;
