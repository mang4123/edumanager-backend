
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';

const MaterialsSection = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Exercícios e Materiais</h2>
        <Button className="gradient-accent text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Material
        </Button>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum material enviado ainda</h3>
          <p className="text-gray-500 mb-6">Comece enviando materiais para seus alunos</p>
          <Button className="gradient-accent text-white">
            <Plus className="w-4 h-4 mr-2" />
            Enviar Primeiro Material
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default MaterialsSection;
