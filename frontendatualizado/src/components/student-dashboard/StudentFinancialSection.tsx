import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ItemFinanceiro {
  id: string;
  valor: number;
  descricao?: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'vencido';
  metodo_pagamento?: string;
  observacoes?: string;
  created_at: string;
}

const StudentFinancialSection = () => {
  const [itensFinanceiros, setItensFinanceiros] = useState<ItemFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [professorInfo, setProfessorInfo] = useState<{nome: string} | null>(null);
  const [resumo, setResumo] = useState({
    totalPendente: 0,
    totalPago: 0,
    itensPendentes: 0,
    itensPagos: 0
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchDadosFinanceiros();
    }
  }, [user?.id]);

  const fetchDadosFinanceiros = async () => {
    try {
      setLoading(true);

      // 1. Buscar professor vinculado ao aluno
      const { data: alunoRelacao, error: alunoError } = await supabase
        .from('alunos')
        .select(`
          professor_id,
          profiles!alunos_professor_id_fkey(nome)
        `)
        .eq('aluno_id', user?.id)
        .eq('ativo', true)
        .single();

      if (alunoError || !alunoRelacao) {
        console.log('Aluno não vinculado a nenhum professor ainda');
        setLoading(false);
        return;
      }

      const professorId = alunoRelacao.professor_id;
      setProfessorInfo({
        nome: (alunoRelacao as any).profiles?.nome || 'Professor'
      });

      // 2. Buscar dados financeiros deste aluno com este professor
      const { data: financeiroData, error: financeiroError } = await supabase
        .from('financeiro')
        .select('*')
        .eq('aluno_id', user?.id)
        .eq('professor_id', professorId)
        .order('data_vencimento', { ascending: false });

      if (financeiroError) {
        console.log('Tabela financeiro pode não existir ainda:', financeiroError);
        setItensFinanceiros([]);
      } else {
        const itens = financeiroData || [];
        setItensFinanceiros(itens);

        // Calcular resumo
        const totalPendente = itens
          .filter(item => item.status === 'pendente')
          .reduce((acc, item) => acc + (item.valor || 0), 0);

        const totalPago = itens
          .filter(item => item.status === 'pago')
          .reduce((acc, item) => acc + (item.valor || 0), 0);

        setResumo({
          totalPendente,
          totalPago,
          itensPendentes: itens.filter(item => item.status === 'pendente').length,
          itensPagos: itens.filter(item => item.status === 'pago').length
        });
      }

    } catch (error: any) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast({
        title: "Erro ao carregar dados financeiros",
        description: "Não foi possível carregar as informações de pagamento",
        variant: "destructive",
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
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="w-4 h-4" />;
      case 'vencido':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pendente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(resumo.totalPendente)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pago</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(resumo.totalPago)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">A Pagar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resumo.itensPendentes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Geral</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(resumo.totalPendente + resumo.totalPago)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          {professorInfo && (
            <p className="text-sm text-gray-600">
              Pagamentos para {professorInfo.nome}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {itensFinanceiros.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum pagamento registrado
              </h3>
              <p className="text-gray-500">
                {professorInfo 
                  ? `${professorInfo.nome} ainda não criou nenhuma cobrança para você.`
                  : 'Você ainda não está vinculado a nenhum professor.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {itensFinanceiros.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.status === 'pago' ? 'bg-green-100' : 
                      item.status === 'vencido' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {getStatusIcon(item.status)}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.descricao || 'Pagamento de aulas'}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Vencimento: {formatarData(item.data_vencimento)}</span>
                        {item.data_pagamento && (
                          <span>• Pago em: {formatarData(item.data_pagamento)}</span>
                        )}
                      </div>
                      {item.observacoes && (
                        <p className="text-sm text-gray-600 mt-1">{item.observacoes}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      {formatarMoeda(item.valor)}
                    </p>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status === 'pago' ? 'Pago' : 
                       item.status === 'vencido' ? 'Vencido' : 'Pendente'}
                    </Badge>
                    {item.metodo_pagamento && (
                      <p className="text-xs text-gray-500 mt-1">
                        via {item.metodo_pagamento}
                      </p>
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