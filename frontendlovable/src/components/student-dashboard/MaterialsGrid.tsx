
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Download } from 'lucide-react';

interface Material {
  id: number;
  title: string;
  type: string;
  uploadedAt: string;
  teacher: string;
}

const MaterialsGrid = () => {
  const materials: Material[] = [
    {
      id: 1,
      title: 'Vocabulário - Família',
      type: 'PDF',
      uploadedAt: '2024-12-20',
      teacher: 'Prof. Maria Silva'
    },
    {
      id: 2,
      title: 'Exercícios de Present Simple',
      type: 'PDF',
      uploadedAt: '2024-12-18',
      teacher: 'Prof. Maria Silva'
    },
    {
      id: 3,
      title: 'Pronúncia - Vídeo aula',
      type: 'Link',
      uploadedAt: '2024-12-15',
      teacher: 'Prof. Maria Silva'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <Card key={material.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  {material.type === 'PDF' ? (
                    <FileText className="w-5 h-5 text-secondary-600" />
                  ) : (
                    <ExternalLink className="w-5 h-5 text-secondary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{material.title}</h3>
                  <p className="text-sm text-gray-500">{material.teacher}</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              Enviado em {material.uploadedAt}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              {material.type === 'PDF' ? (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Link
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MaterialsGrid;
