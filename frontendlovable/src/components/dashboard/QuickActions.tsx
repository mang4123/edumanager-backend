
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, FileText } from 'lucide-react';
import InviteStudentModal from './InviteStudentModal';
import NewClassModal from './NewClassModal';

const QuickActions = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newClassModalOpen, setNewClassModalOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 flex-col space-y-2 gradient-primary text-white"
              onClick={() => setNewClassModalOpen(true)}
            >
              <Plus className="w-6 h-6" />
              <span>Nova Aula</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setInviteModalOpen(true)}
            >
              <Users className="w-6 h-6" />
              <span>Convidar Aluno</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="w-6 h-6" />
              <span>Novo Material</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <InviteStudentModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen} 
      />

      <NewClassModal 
        open={newClassModalOpen} 
        onOpenChange={setNewClassModalOpen} 
      />
    </>
  );
};

export default QuickActions;
