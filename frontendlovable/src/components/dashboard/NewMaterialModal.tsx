import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NewMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewMaterialModal = ({ open, onOpenChange }: NewMaterialModalProps) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    conteudo: '',
    anexo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let anexoUrl = formData.anexo_url;

      // Upload do arquivo se selecionado
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `materiais/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('exercicios')
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer upload do arquivo. Salvando sem anexo.",
            variant: "destructive",
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('exercicios')
            .getPublicUrl(filePath);
          anexoUrl = publicUrl;
        }
      }

      // Salvar no banco de dados
      const { error } = await supabase
        .from('exercicios')
        .insert({
          professor_id: user.id,
          titulo: formData.titulo,
          descricao: formData.descricao,
          tipo: formData.tipo,
          anexo_url: anexoUrl,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Material criado com sucesso!",
        description: "O material foi salvo e está disponível para seus alunos.",
      });

      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        tipo: '',
        conteudo: '',
        anexo_url: ''
      });
      setSelectedFile(null);
      onOpenChange(false);

    } catch (error: any) {
      console.error('Erro ao criar material:', error);
      toast({
        title: "Erro ao criar material",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Novo Material
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Material</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Lista de Exercícios - Matemática"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Material</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
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
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
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
                  onClick={removeFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Formatos aceitos: PDF, DOC, TXT, imagens, vídeos
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.titulo}
              className="gradient-accent text-white"
            >
              {loading ? 'Salvando...' : 'Criar Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewMaterialModal; 