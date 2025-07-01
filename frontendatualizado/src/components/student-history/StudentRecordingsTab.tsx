
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

const StudentRecordingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gravações de Aulas</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-12">
        <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Recurso Premium
        </h3>
        <p className="text-gray-500 mb-6">
          As gravações de aulas estão disponíveis no plano premium
        </p>
        <Button className="gradient-accent text-white">
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentRecordingsTab;
