
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Calendar, Clock, CreditCard } from 'lucide-react';

interface FinanceiroItem {
  id: string;
  valor: number;
  descricao: string;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  metodo_pagamento: string | null;
}

const StudentFinancialSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [financeiro, setFinanceiro] = useState<FinanceiroItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchFinancialData();
    }
  }, [user?.id]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financeiro')
        .select('*')
        .eq('aluno_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching financial data:', error);
        throw error;
      }

      setFinanceiro(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'atrasado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPendente = financeiro
    .filter(item => item.status === 'pendente')
    .reduce((sum, item) => sum + item.valor, 0);

  const totalPago = financeiro
    .filter(item => item.status === 'pago')
    .reduce((sum, item) => sum + item.valor, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-500">Total Pago</p>
            <p className="text-2xl font-bold text-gray-900">R$ {totalPago.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-sm text-gray-500">Pendente</p>
            <p className="text-2xl font-bold text-gray-900">R$ {totalPendente.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-500">Total de Registros</p>
            <p className="text-2xl font-bold text-gray-900">{financeiro.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          {financeiro.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro financeiro encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {financeiro.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.descricao}</h3>
                      <p className="text-lg font-bold text-gray-900">R$ {item.valor.toFixed(2)}</p>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Vencimento: {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {item.data_pagamento && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Pagamento: {new Date(item.data_pagamento).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {item.metodo_pagamento && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Método: {item.metodo_pagamento}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentFinancialSection;
