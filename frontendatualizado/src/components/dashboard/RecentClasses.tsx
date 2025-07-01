
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

interface ClassItem {
  id: number;
  student: string;
  subject: string;
  time: string;
  date: string;
  status: string;
}

interface RecentClassesProps {
  classes: ClassItem[];
}

const RecentClasses = ({ classes }: RecentClassesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Aulas</CardTitle>
        <CardDescription>Suas aulas agendadas para hoje e amanhã</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.map((class_) => (
            <div key={class_.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{class_.student}</p>
                  <p className="text-sm text-gray-500">{class_.subject}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{class_.time}</p>
                <p className="text-xs text-gray-500">{class_.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentClasses;
