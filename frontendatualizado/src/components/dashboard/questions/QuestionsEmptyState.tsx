
import { MessageSquare } from 'lucide-react';

const QuestionsEmptyState = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
      <p>Nenhuma dúvida encontrada</p>
    </div>
  );
};

export default QuestionsEmptyState;
