import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentAgenda from '@/components/StudentAgenda';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WelcomeCard from '@/components/student-dashboard/WelcomeCard';
import StatsOverview from '@/components/student-dashboard/StatsOverview';
import QuickActionsStudent from '@/components/student-dashboard/QuickActionsStudent';
import MaterialsGrid from '@/components/student-dashboard/MaterialsGrid';
import QuestionsSection from '@/components/student-dashboard/QuestionsSection';
import StudentFinancialSection from '@/components/student-dashboard/StudentFinancialSection';

const StudentDashboard = () => {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ User verification
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user} 
        logout={logout} 
        title="EduManager"
        subtitle="Painel do Aluno"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="questions">Dúvidas</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <WelcomeCard userName={user.name} />
            <StatsOverview />
            <QuickActionsStudent />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Agenda de Aulas</h2>
            </div>
            <StudentAgenda />
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Materiais de Estudo</h2>
            </div>
            <MaterialsGrid />
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Tire suas Dúvidas</h2>
            </div>
            <QuestionsSection />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Controle Financeiro</h2>
            </div>
            <StudentFinancialSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;