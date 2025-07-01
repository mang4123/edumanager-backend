import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Clock, TrendingUp, Trash2, Calendar, User, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Recebimento {
  id: string;
  professor_id: string;
  aluno_id: string;
  aula_id?: string;
  tipo: 'aula' | 'mensalidade' | 'material' | 'outros';
  descricao: string;
  valor: number;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  data_vencimento: string;
  data_pagamento?: string;
  metodo_pagamento?: string;
  observacoes?: string;
  created_at: string;
  aluno_profile?: {
    nome: string;
    email: string;
  };
}

interface Aluno {
  id: string;
  aluno_id: string;
  aluno_profile: {
    nome: string;
    email: string;
  };
}

interface Estatisticas {
  receitaMes: number;
  pagamentosPendentes: number;
  mediaPorAula: number;
  totalRecebimentos: number;
}

const FinancialSection = () => {
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    receitaMes: 0,
    pagamentosPendentes: 0,
    mediaPorAula: 0,
    totalRecebimentos: 0
  });
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [novoRecebimento, setNovoRecebimento] = useState({
    aluno_id: '',
    tipo: 'aula' as 'aula' | 'mensalidade' | 'material' | 'outros',
    descricao: '',
    valor: '',
    data_vencimento: '',
    metodo_pagamento: '',
    observacoes: ''
  });

  useEffect(() => {
    fetchRecebimentos();
    fetchAlunos();
  }, []);

  useEffect(() => {
    calcularEstatisticas();
  }, [recebimentos]);

  const fetchRecebimentos = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      // 1. Buscar recebimentos
      const { data: recebimentosData, error: recebimentosError } = await supabase
        .from('financeiro')
        .select('*')
        .eq('professor_id', currentUser.user.id)
        .order('created_at', { ascending: false });

      if (recebimentosError) throw recebimentosError;

      if (!recebimentosData || recebimentosData.length === 0) {
        setRecebimentos([]);
        return;
      }

      // 2. Buscar profiles dos alunos
      const alunoIds = [...new Set(recebimentosData.map(r => r.aluno_id))];
      
      if (alunoIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', alunoIds);

        if (profilesError) {
          console.error('Erro ao buscar profiles:', profilesError);
        }

        // 3. Combinar dados
        const recebimentosComDados = recebimentosData.map(recebimento => ({
          ...recebimento,
          aluno_profile: profilesData?.find(profile => profile.id === recebimento.aluno_id) || {
            nome: 'Aluno não encontrado',
            email: ''
          }
        }));

        setRecebimentos(recebimentosComDados);
      } else {
        setRecebimentos(recebimentosData);
      }

    } catch (error) {
      console.error('Erro ao buscar recebimentos:', error);
      setRecebimentos([]);
    }
  };

  const fetchAlunos = async () => {
    try {
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('id, aluno_id, ativo')
        .eq('ativo', true);

      if (alunosError) throw alunosError;

      if (!alunosData || alunosData.length === 0) {
        setAlunos([]);
        return;
      }

      const alunoIds = alunosData.map(aluno => aluno.aluno_id);
      
      if (alunoIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', alunoIds);

        if (profilesError) {
          console.error('Erro ao buscar profiles dos alunos:', profilesError);
        }

        const alunosComDados = alunosData.map(aluno => ({
          ...aluno,
          aluno_profile: profilesData?.find(profile => profile.id === aluno.aluno_id) || {
            nome: 'Aluno não encontrado',
            email: ''
          }
        }));

        setAlunos(alunosComDados);
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setAlunos([]);
    }
  };

  const calcularEstatisticas = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    // CORREÇÃO: Receita deste mês (pagamentos confirmados)
    const receitaMes = recebimentos
      .filter(r => r.status === 'pago' && r.data_pagamento)
      .filter(r => {
        // Corrigir parsing da data para evitar problemas de fuso horário
        const dataPagamento = new Date(r.data_pagamento + 'T12:00:00');
        return dataPagamento >= inicioMes && dataPagamento <= fimMes;
      })
      .reduce((total, r) => total + Number(r.valor), 0);

    // Pagamentos pendentes
    const pagamentosPendentes = recebimentos
      .filter(r => r.status === 'pendente')
      .reduce((total, r) => total + Number(r.valor), 0);

    // Média por aula (apenas aulas pagas)
    const aulaspagas = recebimentos.filter(r => r.tipo === 'aula' && r.status === 'pago');
    const mediaPorAula = aulaspagas.length > 0 
      ? aulaspagas.reduce((total, r) => total + Number(r.valor), 0) / aulaspagas.length 
      : 0;

    setEstatisticas({
      receitaMes,
      pagamentosPendentes,
      mediaPorAula,
      totalRecebimentos: recebimentos.length
    });
  };

  const handleSubmit = async () => {
    if (!novoRecebimento.aluno_id || !novoRecebimento.descricao || !novoRecebimento.valor) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('financeiro')
        .insert({
          professor_id: currentUser.user.id,
          aluno_id: novoRecebimento.aluno_id,
          tipo: novoRecebimento.tipo,
          descricao: novoRecebimento.descricao,
          valor: parseFloat(novoRecebimento.valor),
          status: 'pendente',
          data_vencimento: novoRecebimento.data_vencimento || new Date().toISOString().split('T')[0],
          metodo_pagamento: novoRecebimento.metodo_pagamento,
          observacoes: novoRecebimento.observacoes
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Recebimento criado com sucesso!"
      });

      setNovoRecebimento({
        aluno_id: '',
        tipo: 'aula',
        descricao: '',
        valor: '',
        data_vencimento: '',
        metodo_pagamento: '',
        observacoes: ''
      });
      
      setIsDialogOpen(false);
      fetchRecebimentos();
      
    } catch (error) {
      console.error('Erro ao criar recebimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o recebimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recebimentoId: string) => {
    try {
      const { error } = await supabase
        .from('financeiro')
        .delete()
        .eq('id', recebimentoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Recebimento excluído com sucesso!"
      });

      fetchRecebimentos();
    } catch (error) {
      console.error('Erro ao deletar recebimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o recebimento",
        variant: "destructive"
      });
    }
  };

  const marcarComoPago = async (recebimentoId: string) => {
    try {
      const { error } = await supabase
        .from('financeiro')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', recebimentoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento confirmado!"
      });

      fetchRecebimentos();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o pagamento",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pendente': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'vencido': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'cancelado': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'text-green-600 bg-green-100';
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      case 'vencido': return 'text-red-600 bg-red-100';
      case 'cancelado': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'aula': return '👨‍🏫';
      case 'mensalidade': return '📅';
      case 'material': return '📚';
      case 'outros': return '💰';
      default: return '💰';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Controle Financeiro</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Recebimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Recebimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="aluno">Aluno</Label>
                <Select value={novoRecebimento.aluno_id} onValueChange={(value) => 
                  setNovoRecebimento({...novoRecebimento, aluno_id: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {(alunos || []).map((aluno) => (
                      <SelectItem key={aluno.id} value={aluno.aluno_id}>
                        {aluno.aluno_profile?.nome || 'Aluno sem nome'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={novoRecebimento.tipo} onValueChange={(value: any) => 
                    setNovoRecebimento({...novoRecebimento, tipo: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aula">👨‍🏫 Aula Avulsa</SelectItem>
                      <SelectItem value="mensalidade">📅 Mensalidade</SelectItem>
                      <SelectItem value="material">📚 Material</SelectItem>
                      <SelectItem value="outros">💰 Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoRecebimento.valor}
                    onChange={(e) => setNovoRecebimento({...novoRecebimento, valor: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={novoRecebimento.descricao}
                  onChange={(e) => setNovoRecebimento({...novoRecebimento, descricao: e.target.value})}
                  placeholder="Ex: Aula de Matemática - Janeiro 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={novoRecebimento.data_vencimento}
                    onChange={(e) => setNovoRecebimento({...novoRecebimento, data_vencimento: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="metodo_pagamento">Forma de Pagamento</Label>
                  <Input
                    id="metodo_pagamento"
                    value={novoRecebimento.metodo_pagamento}
                    onChange={(e) => setNovoRecebimento({...novoRecebimento, metodo_pagamento: e.target.value})}
                    placeholder="Ex: PIX, Cartão, Dinheiro"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações (Opcional)</Label>
                <Textarea
                  id="observacoes"
                  value={novoRecebimento.observacoes}
                  onChange={(e) => setNovoRecebimento({...novoRecebimento, observacoes: e.target.value})}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full gradient-primary text-white"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Recebimento'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-500">Receita este mês</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {estatisticas.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-sm text-gray-500">Pagamentos pendentes</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {estatisticas.pagamentosPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-500">Média por aula</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {estatisticas.mediaPorAula.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Recebimentos ({recebimentos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {recebimentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum recebimento registrado ainda</p>
              <Button 
                className="mt-4 gradient-primary text-white"
                onClick={() => setIsDialogOpen(true)}
              >
                Criar Primeiro Recebimento
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recebimentos.map((recebimento) => (
                <div key={recebimento.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getTipoIcon(recebimento.tipo)}</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(recebimento.status)}
                          <span className="font-medium">{recebimento.descricao}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(recebimento.status)}`}>
                            {recebimento.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{recebimento.aluno_profile?.nome || 'Aluno não encontrado'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-medium text-green-600">
                            R$ {Number(recebimento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Venc: {format(new Date(recebimento.data_vencimento), "dd/MM/yyyy")}</span>
                        </div>
                        {recebimento.metodo_pagamento && (
                          <div className="text-xs text-gray-500">
                            {recebimento.metodo_pagamento}
                          </div>
                        )}
                      </div>

                      {recebimento.observacoes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{recebimento.observacoes}</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {recebimento.status === 'pendente' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => marcarComoPago(recebimento.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Pago
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(recebimento.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default FinancialSection;