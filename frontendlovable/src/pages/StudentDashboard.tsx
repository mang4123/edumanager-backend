
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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
            <WelcomeCard userName={user?.name || ''} />
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
