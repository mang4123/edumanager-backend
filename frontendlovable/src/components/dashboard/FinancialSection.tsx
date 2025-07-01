import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const FinancialSection = () => {
  const [financialData, setFinancialData] = useState({
    receitaMensal: 0,
    pagamentosPendentes: 0,
    mediaPorAula: 0,
    historico: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchFinancialData();
    }
  }, [user?.id]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      const { data: financeiro, error } = await supabase
        .from('financeiro')
        .select(`
          *,
          profiles!financeiro_aluno_id_fkey(nome)
        `)
        .eq('professor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalRecebido = financeiro?.filter(f => f.status === 'pago').reduce((sum, f) => sum + f.valor, 0) || 0;
      const totalPendente = financeiro?.filter(f => f.status === 'pendente').reduce((sum, f) => sum + f.valor, 0) || 0;
      const totalItens = financeiro?.length || 0;
      const mediaPorAula = totalItens > 0 ? totalRecebido / totalItens : 0;

      const historico = financeiro?.slice(0, 10).map(f => ({
        id: f.id,
        aluno: f.profiles?.nome || 'Aluno',
        valor: f.valor,
        data: new Date(f.created_at).toLocaleDateString('pt-BR'),
        status: f.status
      })) || [];

      setFinancialData({
        receitaMensal: totalRecebido,
        pagamentosPendentes: totalPendente,
        mediaPorAula,
        historico
      });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            <p className="text-2xl font-bold text-gray-900">R$ {financialData.receitaMensal.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-sm text-gray-500">Pagamentos pendentes</p>
            <p className="text-2xl font-bold text-gray-900">R$ {financialData.pagamentosPendentes.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-500">Média por aula</p>
            <p className="text-2xl font-bold text-gray-900">R$ {financialData.mediaPorAula.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Recebimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {financialData.historico.length > 0 ? (
            <div className="space-y-4">
              {financialData.historico.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.aluno}</p>
                    <p className="text-sm text-gray-500">{item.data}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {item.valor.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum recebimento registrado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default FinancialSection;
