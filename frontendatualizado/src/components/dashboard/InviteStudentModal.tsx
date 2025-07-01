import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';

interface InviteStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteCreated?: () => Promise<void>;
}

const InviteStudentModal = ({ open, onOpenChange, onInviteCreated }: InviteStudentModalProps) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [valorAula, setValorAula] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCreated, setInviteCreated] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    if (!nome.trim() || !email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Gerar token único para o convite
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

      const conviteData = {
        professor_id: user.id,
        nome: nome.trim(),
        email: email.trim(),
        token,
        valor_aula: valorAula ? parseFloat(valorAula) : null,
        data_vencimento: dataVencimento || null,
        observacoes: observacoes.trim() || null,
        expires_at: expiresAt.toISOString(),
        status: 'pendente'
      };

      const { error } = await supabase
        .from('convites')
        .insert([conviteData]);

      if (error) {
        console.error('Erro ao criar convite:', error);
        throw error;
      }

      // Gerar link do convite
      const link = `${window.location.origin}/register?invite=${token}`;
      setInviteLink(link);
      setInviteCreated(true);

      toast({
        title: "Convite criado com sucesso!",
        description: "O link do convite foi gerado. Copie e envie para o aluno.",
      });

      // ✨ CORREÇÃO: Chamar callback se fornecido
      if (onInviteCreated) {
        await onInviteCreated();
      }

    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao criar convite",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link do convite foi copiado para a área de transferência",
      });
      
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    // Limpar formulário
    setNome('');
    setEmail('');
    setObservacoes('');
    setValorAula('');
    setDataVencimento('');
    setInviteCreated(false);
    setInviteLink('');
    setLinkCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {inviteCreated ? 'Convite Criado!' : 'Convidar Novo Aluno'}
          </DialogTitle>
          <DialogDescription>
            {inviteCreated 
              ? 'Copie o link abaixo e envie para o aluno se cadastrar na plataforma.'
              : 'Preencha os dados para gerar um link de convite para o aluno.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {!inviteCreated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Aluno *</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorAula">Valor da Aula (R$)</Label>
                <Input
                  id="valorAula"
                  type="number"
                  value={valorAula}
                  onChange={(e) => setValorAula(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais sobre o aluno, metodologia, horários preferidos..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Gerando Convite...' : 'Gerar Convite'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Convite criado com sucesso!</span>
              </div>
              <p className="text-sm text-green-700">
                O link do convite expira em 7 dias. O aluno poderá se cadastrar usando este link.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Link do Convite</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyInviteLink}
                  disabled={linkCopied}
                >
                  {linkCopied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dados do Convite</Label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                <p><strong>Nome:</strong> {nome}</p>
                <p><strong>Email:</strong> {email}</p>
                {valorAula && <p><strong>Valor da aula:</strong> R$ {valorAula}</p>}
                {dataVencimento && <p><strong>Vencimento:</strong> {new Date(dataVencimento).toLocaleDateString('pt-BR')}</p>}
                {observacoes && <p><strong>Observações:</strong> {observacoes}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Fechar e Enviar Link
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteStudentModal;