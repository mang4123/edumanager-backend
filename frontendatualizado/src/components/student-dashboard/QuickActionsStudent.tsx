
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText } from 'lucide-react';

const QuickActionsStudent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button className="h-20 flex-col space-y-2 gradient-primary text-white">
            <MessageSquare className="w-6 h-6" />
            <span>Fazer Pergunta</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <FileText className="w-6 h-6" />
            <span>Ver Materiais</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsStudent;
