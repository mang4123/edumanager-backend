import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, User, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WelcomeCardProps {
  userName: string;
}

const WelcomeCard = ({ userName }: WelcomeCardProps) => {
  const { user, session } = useAuth();
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && session) {
      checkTeacherConnection();
    }
  }, [user?.id, session]);

  // CORREÇÃO: Função para obter token corretamente
  const getAuthToken = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      return currentSession?.access_token;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  };

  const checkTeacherConnection = async () => {
    try {
      console.log('🔍 Verificando vinculação do aluno:', user?.id);
      
      // CORREÇÃO: Obter token corretamente
      const token = await getAuthToken();
      
      if (!token) {
        console.error('Token não encontrado');
        setLoading(false);
        return;
      }

      // CORREÇÃO: URL completa do backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://edumanager-backend-5olt.onrender.com';
      
      const response = await fetch(`${backendUrl}/api/aluno/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Resposta do backend:', data);
        
        // CORREÇÃO: Verificar estrutura de dados correta
        if (data.success && data.data?.professor) {
          setTeacherInfo(data.data.professor);
        } else if (data.data?.professor) {
          // Fallback caso não tenha 'success' mas tenha dados
          setTeacherInfo(data.data.professor);
        }
      } else {
        console.error('Erro na resposta:', response.status, response.statusText);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('💥 Erro ao verificar vinculação:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Olá, {userName}! 👋</h2>
              <p className="text-gray-600 mt-1">Verificando sua vinculação...</p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teacherInfo) {
    // Aluno NÃO está vinculado
    return (
      <Card className="bg-gradient-to-r from-orange-50 to-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <User className="w-12 h-12 text-orange-400" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Olá, {userName}! 👋</h2>
              <p className="text-gray-600 mt-1">Você ainda não está vinculado a nenhum professor.</p>
              <p className="text-sm text-gray-500 mt-2">
                Entre em contato com seu professor para receber o link de convite.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Aluno ESTÁ vinculado
  return (
    <>
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Olá, {userName}! 👋</h2>
              <p className="text-gray-600 mt-1">
                ✅ Vinculado ao professor <strong>{teacherInfo.nome || teacherInfo.name}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {teacherInfo.especialidade || teacherInfo.area || 'Professor'} • Desde hoje
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">🎉 Parabéns!</p>
              <p className="text-sm text-blue-700">
                Agora você pode acessar materiais, fazer perguntas e agendar aulas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default WelcomeCard;