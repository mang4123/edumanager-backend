
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface WelcomeCardProps {
  userName: string;
}

const WelcomeCard = ({ userName }: WelcomeCardProps) => {
  return (
    <>
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Olá, {userName}! 👋</h2>
              <p className="text-gray-600 mt-1">Você tem 2 aulas esta semana</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Próxima aula em</p>
              <p className="text-xl font-bold text-primary-600">45 minutos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Aula começando em 1 hora!</p>
              <p className="text-sm text-orange-700">Inglês Básico com Prof. Maria Silva às 09:00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default WelcomeCard;
