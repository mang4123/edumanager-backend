import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const StatsOverview = () => {
  const { user, session } = useAuth();
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalQuestions: 0,
    totalClasses: 0,
    studyHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // PROTEÇÃO ANTI-LOOP: só executa se tem user, session e ainda não checou
    if (user?.id && session && !hasChecked) {
      fetchStats();
    }
  }, [user?.id, session, hasChecked]);

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

  const fetchStats = async () => {
    try {
      console.log('📊 [StatsOverview] Buscando estatísticas do aluno:', user?.id);
      setHasChecked(true); // PROTEÇÃO: marca que já tentou buscar
      
      // CORREÇÃO: Obter token corretamente
      const token = await getAuthToken();
      
      if (!token) {
        console.error('[StatsOverview] Token não encontrado');
        setLoading(false);
        return;
      }

      // CORREÇÃO: URL ABSOLUTA obrigatória - NUNCA relativa
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://edumanager-backend-5olt.onrender.com';
      const fullUrl = `${backendUrl}/api/aluno/stats`;
      
      console.log('🌐 [StatsOverview] Fazendo fetch para:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 [StatsOverview] Status da resposta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 [StatsOverview] Estatísticas recebidas:', data);
        
        // CORREÇÃO: Verificar estrutura de dados
        if (data.success && data.data) {
          setStats(data.data);
        } else if (data.stats) {
          setStats(data.stats);
        } else if (typeof data === 'object') {
          // Fallback direto
          setStats(data);
        }
      } else {
        console.error('[StatsOverview] Erro na resposta:', response.status, response.statusText);
        // Manter stats padrão em caso de erro
      }
      
    } catch (error) {
      console.error('💥 [StatsOverview] Erro ao buscar estatísticas:', error);
      // Manter stats padrão em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Materiais Recebidos',
      value: stats.totalMaterials,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Perguntas Enviadas',
      value: stats.totalQuestions,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Aulas Agendadas',
      value: stats.totalClasses,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Horas de Estudo',
      value: stats.studyHours,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsOverview; 