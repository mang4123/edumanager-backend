import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Duvida {
  id: string;
  pergunta: string;
  resposta: string;
  created_at: string;
  data_resposta: string;
  respondida: boolean;
}

interface StudentQuestionsTabProps {
  duvidas: Duvida[];
}

const StudentQuestionsTab = ({ duvidas }: StudentQuestionsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dúvidas do Aluno</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {duvidas.map((duvida) => (
            <div key={duvida.id} className={`p-4 rounded-lg border ${
              duvida.respondida ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{duvida.pergunta}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  duvida.respondida ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {duvida.respondida ? 'Respondida' : 'Pendente'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Pergunta em: {new Date(duvida.created_at).toLocaleDateString('pt-BR')}
              </p>
              {duvida.respondida && duvida.resposta && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Resposta:</strong> {duvida.resposta}
                  </p>
                  <p className="text-xs text-gray-500">
                    Respondida em: {new Date(duvida.data_resposta).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          ))}
          {duvidas.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma dúvida registrada</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentQuestionsTab;
