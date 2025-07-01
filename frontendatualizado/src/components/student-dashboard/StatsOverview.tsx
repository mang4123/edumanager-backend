import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  aulasRealizadas: number;
  materiaisRecebidos: number;
  duvidasPendentes: number;
  exerciciosPendentes: number;
}

const StatsOverview = () => {
  const { user, session } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    aulasRealizadas: 0,
    materiaisRecebidos: 0,
    duvidasPendentes: 0,
    exerciciosPendentes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && session) {
      fetchStats();
    }
  }, [user, session]);

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
      setLoading(true);
      
      // CORREÇÃO: Obter token corretamente
      const token = await getAuthToken();
      
      if (!token) {
        console.error('Token não encontrado');
        setLoading(false);
        return;
      }

      // CORREÇÃO: URL completa do backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://edumanager-backend-5olt.onrender.com';

      const response = await fetch(`${backendUrl}/api/aluno/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Estatísticas do aluno:', result);
        
        if (result.success && result.data) {
          setStats(result.data);
        } else if (result.data) {
          // Fallback caso não tenha 'success' mas tenha dados
          setStats(result.data);
        }
      } else {
        console.error('Erro ao buscar estatísticas:', response.status, response.statusText);
        // Fallback: tentar buscar dados do Supabase diretamente
        await fetchStatsFromSupabase();
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Fallback: tentar buscar dados do Supabase diretamente
      await fetchStatsFromSupabase();
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsFromSupabase = async () => {
    try {
      console.log('🔄 Buscando estatísticas via Supabase fallback...');
      
      // Buscar dados básicos de materiais, dúvidas, etc.
      const [materiaisResult, duvidasResult] = await Promise.all([
        supabase
          .from('materiais')
          .select('id')
          .eq('aluno_id', user?.id),
        supabase
          .from('duvidas')
          .select('id')
          .eq('aluno_id', user?.id)
          .eq('status', 'pendente')
      ]);

      const statsFromSupabase = {
        aulasRealizadas: 0, // TODO: implementar quando tivermos tabela de aulas
        materiaisRecebidos: materiaisResult.data?.length || 0,
        duvidasPendentes: duvidasResult.data?.length || 0,
        exerciciosPendentes: 0 // TODO: implementar quando tivermos tabela de exercícios
      };

      setStats(statsFromSupabase);
      console.log('✅ Estatísticas carregadas via Supabase:', statsFromSupabase);
    } catch (error) {
      console.error('❌ Erro no fallback Supabase:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary-500" />
              <p className="text-sm text-gray-500">Aulas realizadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aulasRealizadas}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <FileText className="w-8 h-8 mx-auto mb-2 text-secondary-500" />
              <p className="text-sm text-gray-500">Materiais recebidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.materiaisRecebidos}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-accent-500" />
              <p className="text-sm text-gray-500">Dúvidas pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.duvidasPendentes}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm text-gray-500">Exercícios pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.exerciciosPendentes}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;