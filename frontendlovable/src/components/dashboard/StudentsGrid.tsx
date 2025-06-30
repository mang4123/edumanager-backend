
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, MessageSquare, Plus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentQuestionsModal from './StudentQuestionsModal';
import InviteStudentModal from './InviteStudentModal';

interface Student {
  id: string; // Changed from number to string for UUID
  name: string;
  subject: string;
  level: string;
  nextClass: string;
  totalClasses: number;
  questions: number;
}

interface StudentsGridProps {
  students: Student[];
}

const StudentsGrid = ({ students }: StudentsGridProps) => {
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const handleViewHistory = (studentId: string) => {
    console.log('Navigating to student history:', studentId);
    navigate(`/student-history/${studentId}`);
  };

  const handleViewQuestions = (studentId: string) => {
    setSelectedStudentId(studentId);
    setQuestionsModalOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Alunos</h2>
        <Button 
          className="gradient-secondary text-white"
          onClick={() => setInviteModalOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Convidar Aluno
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.subject} - {student.level}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Próxima aula:</span>
                  <span className="text-gray-900">24/12 09:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total de aulas:</span>
                  <span className="text-gray-900">{student.totalClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dúvidas pendentes:</span>
                  <span className={`font-medium ${student.questions > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                    {student.questions}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleViewHistory(student.id)}
                >
                  Ver Histórico
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewQuestions(student.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Dúvidas
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <StudentQuestionsModal
        open={questionsModalOpen}
        onOpenChange={setQuestionsModalOpen}
        studentId={selectedStudentId}
        studentName={students.find(s => s.id === selectedStudentId)?.name || ''}
      />

      <InviteStudentModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen} 
      />
    </>
  );
};

export default StudentsGrid;
