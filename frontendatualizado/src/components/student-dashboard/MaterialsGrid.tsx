import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Download, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Material {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  arquivo_url?: string;
  arquivo_nome?: string;
  created_at: string;
  professor_id: string;
  professor?: {
    nome: string;
  };
}

const MaterialsGrid = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [professorInfo, setProfessorInfo] = useState<{id: string, nome: string} | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchMaterials();
    }
  }, [user?.id]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);

      // 1. Buscar professor vinculado ao aluno
      const { data: alunoRelacao, error: alunoError } = await supabase
        .from('alunos')
        .select(`
          professor_id,
          professores(nome)
        `)
        .eq('id', user?.id)
        .eq('ativo', true)
        .single();

      if (alunoError || !alunoRelacao) {
        console.log('Aluno não vinculado a nenhum professor ainda');
        setMaterials([]);
        setLoading(false);
        return;
      }

      const professorId = alunoRelacao.professor_id;
      setProfessorInfo({
        id: professorId,
        nome: (alunoRelacao as any).professores?.nome || 'Professor'
      });

      // 2. Buscar materiais deste professor para este aluno
      const { data: materiaisData, error: materiaisError } = await supabase
        .from('materiais')
        .select('*')
        .eq('professor_id', professorId)
        .or(`aluno_id.eq.${user?.id},aluno_id.is.null`) // Materiais específicos ou gerais
        .order('created_at', { ascending: false });

      if (materiaisError) {
        throw materiaisError;
      }

      setMaterials(materiaisData || []);

    } catch (error: any) {
      console.error('Erro ao buscar materiais:', error);
      toast({
        title: "Erro ao carregar materiais",
        description: "Não foi possível carregar os materiais de estudo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material: Material) => {
    if (material.arquivo_url) {
      try {
        window.open(material.arquivo_url, '_blank');
      } catch (error) {
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar o arquivo",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum material disponível
          </h3>
          <p className="text-gray-500">
            {professorInfo 
              ? `${professorInfo.nome} ainda não enviou materiais de estudo para você.`
              : 'Você ainda não está vinculado a nenhum professor.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <Card key={material.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  {material.tipo === 'pdf' || material.arquivo_url ? (
                    <FileText className="w-5 h-5 text-secondary-600" />
                  ) : (
                    <ExternalLink className="w-5 h-5 text-secondary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{material.titulo}</h3>
                  <p className="text-sm text-gray-500">
                    {professorInfo?.nome || 'Professor'}
                  </p>
                </div>
              </div>
            </div>

            {material.descricao && (
              <p className="text-sm text-gray-600 mb-4">{material.descricao}</p>
            )}

            <div className="text-xs text-gray-500 mb-4">
              Enviado em {new Date(material.created_at).toLocaleDateString('pt-BR')}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleDownload(material)}
              disabled={!material.arquivo_url}
            >
              {material.arquivo_url ? (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar {material.arquivo_nome || 'Material'}
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Material
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MaterialsGrid;