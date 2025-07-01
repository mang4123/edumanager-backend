import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, User, BookOpen, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  user: any;
  logout: () => void;
  title: string;
  subtitle: string;
}

const DashboardHeader = ({ user, logout, title, subtitle }: DashboardHeaderProps) => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'aula',
      title: 'Nova aula agendada',
      description: 'Aula de matemática às 14:00',
      time: '5 min atrás',
      read: false
    },
    {
      id: 2,
      type: 'pagamento',
      title: 'Pagamento recebido',
      description: 'R$ 150,00 de João Silva',
      time: '2 horas atrás',
      read: true
    }
  ]);

  const { toast } = useToast();

  const handleLogout = () => {
    try {
      logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Houve um problema ao desconectar",
        variant: "destructive"
      });
    }
  };

  const handleProfileClick = () => {
    toast({
      title: "Perfil",
      description: "Funcionalidade de perfil em breve",
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">EduManager</h1>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dropdown de Notificações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                      <div className="flex items-center justify-between w-full">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{notification.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem>
                    <p className="text-sm text-gray-500">Nenhuma notificação</p>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dropdown do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                    <p className="text-xs text-gray-500">{user?.area || 'Professor'}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleProfileClick}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
