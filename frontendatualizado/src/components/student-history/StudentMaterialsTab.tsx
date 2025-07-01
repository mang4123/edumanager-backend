
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface Material {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  created_at: string;
}

interface StudentMaterialsTabProps {
  materiais: Material[];
}

const StudentMaterialsTab = ({ materiais }: StudentMaterialsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materiais Enviados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {materiais.map((material) => (
            <div key={material.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{material.titulo}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Tipo: {material.tipo} | Enviado em: {new Date(material.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  {material.descricao && (
                    <p className="text-sm text-gray-600">{material.descricao}</p>
                  )}
                </div>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
          {materiais.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum material enviado</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentMaterialsTab;
