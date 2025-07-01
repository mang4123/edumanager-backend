import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentHeaderProps {
  student: {
    profiles: { nome: string }[];
    nivel: string;
  };
}

const StudentHeader = ({ student }: StudentHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center mb-6">
      <Button
        variant="outline"
        onClick={() => navigate('/teacher-dashboard')}
        className="mr-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {student.profiles[0]?.nome}
          </h1>
          <p className="text-gray-500">Nível: {student.nivel || 'Não informado'}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;
