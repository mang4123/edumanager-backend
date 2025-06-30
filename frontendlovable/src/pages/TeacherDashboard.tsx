import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeacherAgenda from '@/components/TeacherAgenda';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentClasses from '@/components/dashboard/RecentClasses';
import StudentsGrid from '@/components/dashboard/StudentsGrid';
import MaterialsSection from '@/components/dashboard/MaterialsSection';
import FinancialSection from '@/components/dashboard/FinancialSection';
import RecordingsSection from '@/components/dashboard/RecordingsSection';
import InvitesList from '@/components/dashboard/InvitesList';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Star
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Aulas este mês',
      value: '32',
      change: '+12%',
      icon: <Calendar className="w-5 h-5 text-primary-500" />
    },
    {
      title: 'Alunos ativos',
      value: '18',
      change: '+3',
      icon: <Users className="w-5 h-5 text-secondary-500" />
    },
    {
      title: 'Receita mensal',
      value: 'R$ 2.840',
      change: '+18%',
      icon: <DollarSign className="w-5 h-5 text-accent-500" />
    },
    {
      title: 'Avaliação média',
      value: '4.9',
      change: '+0.2',
      icon: <Star className="w-5 h-5 text-yellow-500" />
    }
  ];

  const recentClasses = [
    {
      id: 1,
      student: 'Ana Silva',
      subject: 'Inglês Básico',
      time: '09:00',
      date: 'Hoje',
      status: 'confirmed'
    },
    {
      id: 2,
      student: 'Carlos Santos',
      subject: 'Matemática',
      time: '14:30',
      date: 'Hoje',
      status: 'confirmed'
    },
    {
      id: 3,
      student: 'Maria Oliveira',
      subject: 'Inglês Intermediário',
      time: '16:00',
      date: 'Amanhã',
      status: 'pending'
    }
  ];

  const students = [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Ana Silva',
      subject: 'Inglês',
      level: 'Básico',
      nextClass: '2024-12-24 09:00',
      totalClasses: 12,
      questions: 2
    },
    {
      id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
      name: 'Carlos Santos',
      subject: 'Matemática',
      level: 'Intermediário',
      nextClass: '2024-12-24 14:30',
      totalClasses: 8,
      questions: 0
    },
    {
      id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
      name: 'Maria Oliveira',
      subject: 'Inglês',
      level: 'Intermediário',
      nextClass: '2024-12-25 16:00',
      totalClasses: 15,
      questions: 1
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user} 
        logout={logout} 
        title="EduManager" 
        subtitle="Painel do Professor" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="materials">Exercícios</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="recordings">Gravações ⭐</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsCards stats={stats} />
            <QuickActions />
            <RecentClasses classes={recentClasses} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Agenda de Aulas</h2>
            </div>
            <TeacherAgenda />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <StudentsGrid students={students} />
            <InvitesList />
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <MaterialsSection />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialSection />
          </TabsContent>

          <TabsContent value="recordings" className="space-y-6">
            <RecordingsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
