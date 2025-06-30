
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Eye, EyeOff, ArrowLeft, CheckCircle, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InviteData {
  id: string;
  nome: string;
  email: string;
  professor_id: string;
  valor_aula: number | null;
  observacoes: string | null;
  status: string;
  expires_at: string;
}

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'teacher' | 'student'>('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    area: '',
    customArea: ''
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const inviteToken = searchParams.get('invite');

  const teachingAreas = [
    'Reforço Escolar',
    'Inglês',
    'Espanhol',
    'Francês',
    'Alemão',
    'Português',
    'Matemática',
    'Física',
    'Química',
    'Biologia',
    'História',
    'Geografia',
    'Música - Piano',
    'Música - Violão',
    'Música - Bateria',
    'Música - Canto',
    'Personal Trainer',
    'Yoga',
    'Pilates',
    'Dança',
    'Artes',
    'Informática',
    'Programação',
    'Design',
    'Outro'
  ];

  // Carregar dados do convite se existir token
  useEffect(() => {
    if (inviteToken) {
      loadInviteData();
    }
  }, [inviteToken]);

  const loadInviteData = async () => {
    if (!inviteToken) return;

    setLoadingInvite(true);
    try {
      const { data, error } = await supabase
        .from('convites')
        .select('*')
        .eq('token', inviteToken)
        .eq('status', 'pendente')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        toast({
          title: "Convite inválido",
          description: "O convite não foi encontrado ou expirou. Entre em contato com o professor.",
          variant: "destructive",
        });
        return;
      }

      setInviteData(data);
      setUserType('student');
      setFormData(prev => ({
        ...prev,
        name: data.nome,
        email: data.email
      }));

      toast({
        title: "Convite encontrado!",
        description: `Você foi convidado por um professor. Complete seu cadastro para começar.`,
      });

    } catch (error) {
      console.error('Erro ao carregar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o convite.",
        variant: "destructive",
      });
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validações
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro no cadastro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: userType,
        area: formData.area === 'Outro' ? formData.customArea : formData.area,
        password: formData.password
      };

      const success = await register(userData);
      
      if (success) {
        // Se tem convite, aceitar o convite
        if (inviteToken && inviteData) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data, error } = await supabase.rpc('accept_invite', {
                invite_token: inviteToken,
                user_id: user.id
              });

              if (error) {
                console.error('Erro ao aceitar convite:', error);
                // Não falhar o registro por causa disso
              } else {
                toast({
                  title: "Cadastro realizado com sucesso!",
                  description: `Bem-vindo(a), ${formData.name}! Você foi vinculado ao seu professor.`,
                });
              }
            }
          } catch (error) {
            console.error('Erro ao processar convite:', error);
          }
        } else {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: `Bem-vindo(a) à plataforma, ${formData.name}!`,
          });
        }
        
        // Redirect based on user type
        if (userType === 'teacher') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '' };
    if (password.length < 6) return { strength: 1, text: 'Fraca', color: 'text-red-500' };
    if (password.length < 8) return { strength: 2, text: 'Média', color: 'text-yellow-500' };
    return { strength: 3, text: 'Forte', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  if (loadingInvite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando convite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-primary-500 hover:text-primary-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para home
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">EduManager</h1>
          </div>
          
          {inviteData ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Você foi convidado!</span>
              </div>
              <p className="text-blue-700 text-sm">
                Complete seu cadastro para começar suas aulas
              </p>
            </div>
          ) : (
            <p className="text-gray-600">Crie sua conta gratuitamente</p>
          )}
        </div>

        <Card className="shadow-medium animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {inviteData ? 'Complete seu Cadastro' : 'Cadastro'}
            </CardTitle>
            <CardDescription className="text-center">
              {inviteData 
                ? 'Preencha os dados para finalizar seu cadastro'
                : 'Preencha os dados para criar sua conta'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!inviteData && (
              <Tabs value={userType} onValueChange={(value) => setUserType(value as 'teacher' | 'student')} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="teacher" className="text-sm">👨‍🏫 Professor</TabsTrigger>
                  <TabsTrigger value="student" className="text-sm">🧑‍🎓 Aluno</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                  disabled={!!inviteData}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                  disabled={!!inviteData}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-12"
                />
              </div>

              {userType === 'teacher' && !inviteData && (
                <div className="space-y-2">
                  <Label htmlFor="area">Área de atuação</Label>
                  <Select value={formData.area} onValueChange={(value) => setFormData({...formData, area: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione sua área" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachingAreas.map((area) => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {formData.area === 'Outro' && (
                    <Input
                      name="customArea"
                      type="text"
                      placeholder="Descreva sua área de atuação"
                      value={formData.customArea}
                      onChange={handleInputChange}
                      required
                      className="h-12 mt-2"
                    />
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all ${
                          passwordStrength.strength === 1 ? 'bg-red-500 w-1/3' :
                          passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/3' :
                          passwordStrength.strength === 3 ? 'bg-green-500 w-full' : 'w-0'
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Senhas coincidem</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" required className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">
                  Aceito os{' '}
                  <Link to="#" className="text-primary-500 hover:text-primary-600">
                    termos de uso
                  </Link>{' '}
                  e{' '}
                  <Link to="#" className="text-primary-500 hover:text-primary-600">
                    política de privacidade
                  </Link>
                </span>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
