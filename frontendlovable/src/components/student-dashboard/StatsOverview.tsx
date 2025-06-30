
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, MessageSquare } from 'lucide-react';

const StatsOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-primary-500" />
          <p className="text-sm text-gray-500">Aulas realizadas</p>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-secondary-500" />
          <p className="text-sm text-gray-500">Materiais recebidos</p>
          <p className="text-2xl font-bold text-gray-900">8</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-accent-500" />
          <p className="text-sm text-gray-500">Dúvidas pendentes</p>
          <p className="text-2xl font-bold text-gray-900">1</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
