
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, DollarSign, Clock, TrendingUp } from 'lucide-react';

const FinancialSection = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Controle Financeiro</h2>
        <Button className="gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Recebimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-500">Receita este mês</p>
            <p className="text-2xl font-bold text-gray-900">R$ 2.840</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-sm text-gray-500">Pagamentos pendentes</p>
            <p className="text-2xl font-bold text-gray-900">R$ 480</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-500">Média por aula</p>
            <p className="text-2xl font-bold text-gray-900">R$ 89</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Recebimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum recebimento registrado ainda</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default FinancialSection;
