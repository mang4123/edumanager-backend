import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Convite {
  id: string;
  nome: string;
  email: string;
  token: string;
  valor_aula: number | null;
  data_vencimento: string | null;
  observacoes: string | null;
  status: 'pendente' | 'aceito' | 'expirado';
  expires_at: string;
  created_at: string;
}

const InvitesList = () => {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConvites();
    }
  }, [user]);

  const fetchConvites = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('convites')
        .select('*')
        .eq('professor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Verificar quais convites deveriam estar aceitos (SEM tentar atualizar)
      const convitesAtualizados = await Promise.all(
        (data || []).map(async (convite) => {
          if (convite.status === 'pendente') {
            // Verificar se existe aluno com este email vinculado ao professor
            const { data: alunoVinculado } = await supabase
              .from('alunos')
              .select('*, profiles!inner(*)')
              .eq('professor_id', user?.id)
              .eq('profiles.email', convite.email)
              .single();

            if (alunoVinculado) {
              // Aluno já está vinculado, marcar como aceito localmente (SEM salvar no DB)
              return { ...convite, status: 'aceito' as const };
            }
          }
          return convite;
        })
      );

      setConvites(convitesAtualizados);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      // REMOVIDO: toast de erro para evitar spam
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyInviteLink = async (token: string, nomeAluno: string) => {
    try {
      const link = `${window.location.origin}/register?invite=${token}`;
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copiado!",
        description: `Link do convite para ${nomeAluno} copiado`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      });
    }
  };

  const deleteInvite = async (id: string, nomeAluno: string) => {
    try {
      const { error } = await supabase
        .from('convites')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setConvites(convites.filter(c => c.id !== id));
      toast({
        title: "Convite removido",
        description: `Convite para ${nomeAluno} foi removido`,
      });
    } catch (error) {
      console.error('Erro ao remover convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o convite",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === 'pendente') {
      return <Badge variant="secondary">Expirado</Badge>;
    }
    
    switch (status) {
      case 'pendente':
        return <Badge variant="outline">Pendente</Badge>;
      case 'aceito':
        return <Badge className="bg-green-500 hover:bg-green-600">Aceito ✓</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Convites Enviados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando convites...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Convites Enviados</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchConvites}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {convites.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">Nenhum convite enviado ainda.</p>
            <p className="text-sm text-muted-foreground">
              Use o botão "Convidar Aluno" para gerar links de convite.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {convites.map((convite) => (
              <div
                key={convite.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{convite.nome}</span>
                      {getStatusBadge(convite.status, convite.expires_at)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{convite.email}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Criado em {new Date(convite.created_at).toLocaleDateString('pt-BR')}</span>
                      <span>Expira em {new Date(convite.expires_at).toLocaleDateString('pt-BR')}</span>
                      {convite.valor_aula && (
                        <span>Valor: {formatCurrency(convite.valor_aula)}</span>
                      )}
                    </div>

                    {convite.observacoes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {convite.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyInviteLink(convite.token, convite.nome)}
                    disabled={convite.status !== 'pendente' || new Date(convite.expires_at) < new Date()}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/register?invite=${convite.token}`, '_blank')}
                    disabled={convite.status !== 'pendente' || new Date(convite.expires_at) < new Date()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteInvite(convite.id, convite.nome)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitesList;