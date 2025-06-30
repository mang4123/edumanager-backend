
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageSquare, FileText, DollarSign } from 'lucide-react';

interface StudentOverviewTabProps {
  student: {
    observacoes: string;
  };
  aulasCount: number;
  duvidasCount: number;
  materiaisCount: number;
  financeiroCount: number;
}

const StudentOverviewTab = ({ 
  student, 
  aulasCount, 
  duvidasCount, 
  materiaisCount, 
  financeiroCount 
}: StudentOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary-500" />
            <p className="text-sm text-gray-500">Total de aulas</p>
            <p className="text-2xl font-bold text-gray-900">{aulasCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-secondary-500" />
            <p className="text-sm text-gray-500">Dúvidas</p>
            <p className="text-2xl font-bold text-gray-900">{duvidasCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-accent-500" />
            <p className="text-sm text-gray-500">Materiais</p>
            <p className="text-2xl font-bold text-gray-900">{materiaisCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm text-gray-500">Pagamentos</p>
            <p className="text-2xl font-bold text-gray-900">{financeiroCount}</p>
          </CardContent>
        </Card>
      </div>

      {student.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{student.observacoes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentOverviewTab;
