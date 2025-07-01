
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Aula {
  id: string;
  data_hora: string;
  duracao: number;
  assunto: string;
  status: string;
  observacoes: string;
}

interface StudentClassesTabProps {
  aulas: Aula[];
}

const StudentClassesTab = ({ aulas }: StudentClassesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Aulas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {aulas.map((aula) => (
            <div key={aula.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">{aula.assunto}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  aula.status === 'realizada' ? 'bg-green-100 text-green-800' :
                  aula.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {aula.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {new Date(aula.data_hora).toLocaleString('pt-BR')} - {aula.duracao} minutos
              </p>
              {aula.observacoes && (
                <p className="text-sm text-gray-600">{aula.observacoes}</p>
              )}
            </div>
          ))}
          {aulas.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma aula registrada</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentClassesTab;
