import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText } from 'lucide-react';

interface QuickActionsStudentProps {
  onNavigateToTab?: (tab: string) => void;
}

const QuickActionsStudent = ({ onNavigateToTab }: QuickActionsStudentProps) => {
  
  const handleFazerPergunta = () => {
    console.log('🎯 [AÇÃO] Usuário clicou em "Fazer Pergunta"');
    if (onNavigateToTab) {
      onNavigateToTab('questions');
    } else {
      // Fallback: rolar para seção de dúvidas se existir
      const questionsSection = document.querySelector('[data-section="questions"]');
      if (questionsSection) {
        questionsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleVerMateriais = () => {
    console.log('🎯 [AÇÃO] Usuário clicou em "Ver Materiais"');
    if (onNavigateToTab) {
      onNavigateToTab('materials');
    } else {
      // Fallback: rolar para seção de materiais se existir
      const materialsSection = document.querySelector('[data-section="materials"]');
      if (materialsSection) {
        materialsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            className="h-20 flex-col space-y-2 gradient-primary text-white hover:scale-105 transition-transform"
            onClick={handleFazerPergunta}
          >
            <MessageSquare className="w-6 h-6" />
            <span>Fazer Pergunta</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col space-y-2 hover:scale-105 transition-transform"
            onClick={handleVerMateriais}
          >
            <FileText className="w-6 h-6" />
            <span>Ver Materiais</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsStudent; 