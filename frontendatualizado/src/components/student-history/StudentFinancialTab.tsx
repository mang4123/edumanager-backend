
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Financeiro {
  id: string;
  valor: number;
  descricao: string;
  data_vencimento: string;
  data_pagamento: string;
  status: string;
  metodo_pagamento: string;
}

interface StudentFinancialTabProps {
  financeiro: Financeiro[];
}

const StudentFinancialTab = ({ financeiro }: StudentFinancialTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {financeiro.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{item.descricao}</h3>
                  <p className="text-lg font-bold text-gray-900">R$ {item.valor}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.status === 'pago' ? 'bg-green-100 text-green-800' :
                  item.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                <p>Vencimento: {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}</p>
                {item.data_pagamento && (
                  <p>Pagamento: {new Date(item.data_pagamento).toLocaleDateString('pt-BR')}</p>
                )}
                {item.metodo_pagamento && (
                  <p>Método: {item.metodo_pagamento}</p>
                )}
              </div>
            </div>
          ))}
          {financeiro.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum registro financeiro</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentFinancialTab;
