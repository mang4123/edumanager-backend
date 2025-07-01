import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Trash2, BookOpen, Target, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Material {
  id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: 'fácil' | 'médio' | 'difícil';
  prazo: string;
  status: 'criado' | 'enviado' | 'corrigido' | 'arquivado';
  pontuacao: number;
  questoes: any[];
  created_at: string;
  professor_id: string;
}

interface Aluno {
  id: string;
  aluno_id: string;
  aluno_profile: {
    nome: string;
    email: string;
  };
}

const MaterialsSection = () => {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [novoMaterial, setNovoMaterial] = useState({
    titulo: '',
    descricao: '',
    materia: '',
    dificuldade: 'médio' as 'fácil' | 'médio' | 'difícil',
    prazo: '',
    pontuacao: 10
  });

  useEffect(() => {
    fetchMateriais();
    fetchAlunos();
  }, []);

  const fetchMateriais = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .eq('professor_id', currentUser.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMateriais(data || []);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      toast({
        title: "Informação",
        description: "Nenhum exercício encontrado ainda"
      });
      setMateriais([]);
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

  const handleSubmit = async () => {
    if (!novoMaterial.titulo || !novoMaterial.descricao) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos título e descrição",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Usuário não autenticado');

      // Preparar data de prazo se fornecida
      const prazoFormatado = novoMaterial.prazo 
        ? novoMaterial.prazo
        : null;

      const { error } = await supabase
        .from('exercicios')
        .insert({
          professor_id: currentUser.user.id,
          titulo: novoMaterial.titulo,
          descricao: novoMaterial.descricao,
          materia: novoMaterial.materia || 'Geral',
          dificuldade: novoMaterial.dificuldade,
          prazo: prazoFormatado,
          status: 'criado',
          pontuacao: novoMaterial.pontuacao,
          questoes: []
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Exercício criado com sucesso!"
      });

      setNovoMaterial({
        titulo: '',
        descricao: '',
        materia: '',
        dificuldade: 'médio',
        prazo: '',
        pontuacao: 10
      });
      
      setIsDialogOpen(false);
      fetchMateriais();
      
    } catch (error) {
      console.error('Erro ao criar material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o exercício",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from('exercicios')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Exercício excluído com sucesso!"
      });

      fetchMateriais();
    } catch (error) {
      console.error('Erro ao deletar material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o exercício",
        variant: "destructive"
      });
    }
  };

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'fácil': return 'text-green-600 bg-green-100';
      case 'médio': return 'text-yellow-600 bg-yellow-100';
      case 'difícil': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'criado': return 'text-blue-600 bg-blue-100';
      case 'enviado': return 'text-orange-600 bg-orange-100';
      case 'corrigido': return 'text-green-600 bg-green-100';
      case 'arquivado': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Exercícios e Materiais</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-accent text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Exercício
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Exercício</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={novoMaterial.titulo}
                  onChange={(e) => setNovoMaterial({...novoMaterial, titulo: e.target.value})}
                  placeholder="Ex: Exercícios de Álgebra Linear"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materia">Matéria</Label>
                  <Input
                    id="materia"
                    value={novoMaterial.materia}
                    onChange={(e) => setNovoMaterial({...novoMaterial, materia: e.target.value})}
                    placeholder="Ex: Matemática, Física..."
                  />
                </div>
                <div>
                  <Label htmlFor="dificuldade">Dificuldade</Label>
                  <Select value={novoMaterial.dificuldade} onValueChange={(value: any) => 
                    setNovoMaterial({...novoMaterial, dificuldade: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fácil">🟢 Fácil</SelectItem>
                      <SelectItem value="médio">🟡 Médio</SelectItem>
                      <SelectItem value="difícil">🔴 Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prazo">Prazo (Opcional)</Label>
                  <Input
                    id="prazo"
                    type="date"
                    value={novoMaterial.prazo}
                    onChange={(e) => setNovoMaterial({...novoMaterial, prazo: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="pontuacao">Pontuação</Label>
                  <Input
                    id="pontuacao"
                    type="number"
                    min="1"
                    max="100"
                    value={novoMaterial.pontuacao}
                    onChange={(e) => setNovoMaterial({...novoMaterial, pontuacao: parseInt(e.target.value) || 10})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novoMaterial.descricao}
                  onChange={(e) => setNovoMaterial({...novoMaterial, descricao: e.target.value})}
                  placeholder="Descreva o que será abordado no exercício..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full gradient-accent text-white"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Exercício'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {materiais.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exercício criado ainda</h3>
            <p className="text-gray-500 mb-6">Comece criando exercícios para seus alunos</p>
            <Button 
              className="gradient-accent text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Exercício
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiais.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg line-clamp-1">{material.titulo}</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(material.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3 line-clamp-2">{material.descricao}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Matéria:</span>
                    <span className="text-sm font-medium">{material.materia}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Dificuldade:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDificuldadeColor(material.dificuldade)}`}>
                      {material.dificuldade}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(material.status)}`}>
                      {material.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Pontuação:</span>
                    <span className="text-sm font-medium flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      {material.pontuacao} pts
                    </span>
                  </div>

                  {material.prazo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Prazo:</span>
                      <span className="text-sm font-medium flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(material.prazo), "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 border-t pt-2">
                  Criado em {format(new Date(material.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default MaterialsSection;