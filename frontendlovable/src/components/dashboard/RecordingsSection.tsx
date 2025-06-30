
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video } from 'lucide-react';

const RecordingsSection = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gravação de Aulas</h2>
          <p className="text-gray-500">Recurso Premium</p>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-accent-50 to-accent-100 border-accent-200">
        <CardContent className="p-8 text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-accent-500" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Grave suas aulas e compartilhe com os alunos
          </h3>
          <p className="text-gray-600 mb-6">
            Com o plano premium, você pode gravar suas aulas e disponibilizar para revisão dos alunos
          </p>
          <Button className="gradient-accent text-white text-lg px-8 py-3">
            Fazer Upgrade para Premium
          </Button>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Gravação HD</h4>
              <p className="text-sm text-gray-600">Qualidade profissional</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Armazenamento</h4>
              <p className="text-sm text-gray-600">100GB na nuvem</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Compartilhamento</h4>
              <p className="text-sm text-gray-600">Links privados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default RecordingsSection;
