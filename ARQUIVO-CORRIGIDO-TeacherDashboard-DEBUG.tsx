import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsOverview from '@/components/dashboard/StatsOverview';
import QuickActions from '@/components/dashboard/QuickActions';
import StudentsGrid from '@/components/dashboard/StudentsGrid';
import RecentActivity from '@/components/dashboard/RecentActivity';
import FinancialSection from '@/components/dashboard/FinancialSection';
import MaterialsSection from '@/components/dashboard/MaterialsSection';

const TeacherDashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboardReady, setDashboardReady] = useState(false);

  console.log('🏫 [DEBUG] TeacherDashboard render - Estado:', {
    hasUser: !!user,
    userName: user?.name,
    userType: user?.type,
    loading: loading,
    isAuthenticated: isAuthenticated,
    dashboardReady: dashboardReady
  });

  useEffect(() => {
    console.log('🔄 [DEBUG] TeacherDashboard useEffect disparado');
    console.log('📊 [DEBUG] Valores atuais:', {
      loading,
      isAuthenticated,
      userType: user?.type,
      hasUser: !!user
    });

    if (!loading) {
      console.log('✅ [DEBUG] Loading finalizado, verificando autenticação...');
      
      if (!isAuthenticated) {
        console.log('❌ [DEBUG] Não autenticado, redirecionando para login');
        navigate('/login');
        return;
      }

      if (user?.type !== 'teacher') {
        console.log('⚠️ [DEBUG] Usuário não é professor, tipo:', user?.type);
        if (user?.type === 'student') {
          console.log('🔄 [DEBUG] Redirecionando para dashboard do aluno');
          navigate('/student-dashboard');
        } else {
          console.log('🔄 [DEBUG] Tipo desconhecido, redirecionando para login');
          navigate('/login');
        }
        return;
      }

      console.log('🎯 [DEBUG] Usuário é professor válido, preparando dashboard');
      setDashboardReady(true);
    } else {
      console.log('⏳ [DEBUG] Ainda carregando autenticação...');
    }
  }, [loading, isAuthenticated, user?.type, navigate]);

  // Loading state
  if (loading) {
    console.log('⏳ [DEBUG] Renderizando loading screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">🔄 [DEBUG] Carregando dashboard do professor...</p>
          <p className="text-sm text-gray-400 mt-2">
            Loading: {loading ? 'true' : 'false'} | 
            User: {user?.name || 'null'} | 
            Type: {user?.type || 'null'}
          </p>
        </div>
      </div>
    );
  }

  // Not ready state
  if (!dashboardReady) {
    console.log('⚠️ [DEBUG] Dashboard não está pronto ainda');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">🎯 [DEBUG] Preparando dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">
            Auth: {isAuthenticated ? 'true' : 'false'} | 
            Ready: {dashboardReady ? 'true' : 'false'}
          </p>
        </div>
      </div>
    );
  }

  console.log('🎉 [DEBUG] Renderizando dashboard completo do professor');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com debug */}
        <div className="mb-8">
          <DashboardHeader />
          <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-800">
            🎉 [DEBUG] Dashboard carregado com sucesso! 
            Professor: {user?.name} | Área: {user?.area || 'N/A'}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Students */}
          <div className="lg:col-span-2">
            <StudentsGrid />
          </div>

          {/* Right Column - Recent Activity */}
          <div>
            <RecentActivity />
          </div>
        </div>

        {/* Financial Section */}
        <div className="mb-8">
          <FinancialSection />
        </div>

        {/* Materials Section */}
        <div>
          <MaterialsSection />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 