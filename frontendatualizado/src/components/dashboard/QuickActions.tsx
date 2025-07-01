import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Users, FileText, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import InviteStudentModal from './InviteStudentModal';
import NewClassModal from './NewClassModal';

const QuickActions = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newClassModalOpen, setNewClassModalOpen] = useState(false);
  const [newMaterialModalOpen, setNewMaterialModalOpen] = useState(false);
  const [materialFormData, setMaterialFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let anexoUrl = '';
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `materiais/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('exercicios')
          .upload(filePath, selectedFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('exercicios')
            .getPublicUrl(filePath);
          anexoUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('exercicios')
        .insert({
          professor_id: user.id,
          titulo: materialFormData.titulo,
          descricao: materialFormData.descricao,
          tipo: materialFormData.tipo,
          anexo_url: anexoUrl
        });

      if (error) throw error;

      toast({
        title: "Material criado com sucesso!",
        description: "O material foi salvo e está disponível para seus alunos."
      });

      setMaterialFormData({ titulo: '', descricao: '', tipo: '' });
      setSelectedFile(null);
      setNewMaterialModalOpen(false);

    } catch (error: any) {
      toast({
        title: "Erro ao criar material",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 flex-col space-y-2 gradient-primary text-white"
              onClick={() => setNewClassModalOpen(true)}
            >
              <Plus className="w-6 h-6" />
              <span>Nova Aula</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setInviteModalOpen(true)}
            >
              <Users className="w-6 h-6" />
              <span>Convidar Aluno</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setNewMaterialModalOpen(true)}
            >
              <FileText className="w-6 h-6" />
              <span>Novo Material</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <InviteStudentModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen} 
      />

      <NewClassModal 
        open={newClassModalOpen} 
        onOpenChange={setNewClassModalOpen} 
      />

      <Dialog open={newMaterialModalOpen} onOpenChange={setNewMaterialModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Novo Material
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleMaterialSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Material</Label>
              <Input
                id="titulo"
                value={materialFormData.titulo}
                onChange={(e) => setMaterialFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Lista de Exercícios - Matemática"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Material</Label>
              <Select value={materialFormData.tipo} onValueChange={(value) => setMaterialFormData(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exercicio">Exercício</SelectItem>
                  <SelectItem value="apostila">Apostila</SelectItem>
                  <SelectItem value="video">Vídeo Aula</SelectItem>
                  <SelectItem value="prova">Prova</SelectItem>
                  <SelectItem value="material_apoio">Material de Apoio</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={materialFormData.descricao}
                onChange={(e) => setMaterialFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o conteúdo do material..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo">Anexar Arquivo (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="arquivo"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mp3"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('arquivo')?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {selectedFile ? selectedFile.name : 'Selecionar arquivo'}
                </Button>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewMaterialModalOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !materialFormData.titulo}
                className="gradient-accent text-white"
              >
                {loading ? 'Salvando...' : 'Criar Material'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;