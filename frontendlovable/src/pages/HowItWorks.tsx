
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ArrowLeft, Users, Calendar, MessageSquare, DollarSign, Video, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Cadastre-se como Professor",
      description: "Crie sua conta em minutos informando sua área de atuação",
      icon: <Users className="w-8 h-8 text-primary-500" />,
      details: [
        "Cadastro simples e rápido",
        "Escolha sua área de ensino",
        "Configuração do perfil"
      ]
    },
    {
      number: 2,
      title: "Convide seus Alunos",
      description: "Envie convites privados para seus alunos acessarem a plataforma",
      icon: <MessageSquare className="w-8 h-8 text-secondary-500" />,
      details: [
        "Links de convite exclusivos",
        "Controle total sobre quem acessa",
        "Onboarding automático dos alunos"
      ]
    },
    {
      number: 3,
      title: "Organize sua Agenda",
      description: "Gerencie horários, marque e reagende aulas facilmente",
      icon: <Calendar className="w-8 h-8 text-accent-500" />,
      details: [
        "Calendario interativo",
        "Notificações automáticas",
        "Flexibilidade para mudanças"
      ]
    },
    {
      number: 4,
      title: "Compartilhe Materiais",
      description: "Envie exercícios, responda dúvidas e acompanhe o progresso",
      icon: <BookOpen className="w-8 h-8 text-primary-500" />,
      details: [
        "Upload de PDFs e imagens",
        "Sistema de dúvidas integrado",
        "Acompanhamento personalizado"
      ]
    },
    {
      number: 5,
      title: "Controle Financeiro",
      description: "Gerencie pagamentos e tenha relatórios completos",
      icon: <DollarSign className="w-8 h-8 text-secondary-500" />,
      details: [
        "Links de pagamento automáticos",
        "Histórico de recebimentos",
        "Relatórios financeiros"
      ]
    },
    {
      number: 6,
      title: "Grave suas Aulas (Premium)",
      description: "Disponibilize gravações para revisão dos alunos",
      icon: <Video className="w-8 h-8 text-accent-500" />,
      details: [
        "Gravação em HD",
        "Armazenamento seguro",
        "Compartilhamento privado"
      ]
    }
  ];

  const benefits = [
    "Economia de tempo na organização",
    "Melhor comunicação com alunos",
    "Controle financeiro simplificado",
    "Profissionalização do ensino",
    "Acesso a relatórios detalhados",
    "Suporte técnico especializado"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-primary-500" />
              <span className="text-primary-500 hover:text-primary-600">Voltar</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">EduManager</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Como o EduManager
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500"> Funciona</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma plataforma completa para professores autônomos organizarem suas aulas,
            alunos e finanças em um só lugar.
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simples em 6 passos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={step.number} className="relative hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-4 pt-2">
                    {step.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                  
                  {/* Details */}
                  <ul className="space-y-1">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher o EduManager?
            </h2>
            <p className="text-lg text-gray-600">
              Benefícios que fazem a diferença no seu dia a dia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Veja na prática
          </h2>
          <div className="bg-gray-200 rounded-xl h-64 md:h-96 flex items-center justify-center mb-8">
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Vídeo demonstrativo em breve</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  É gratuito para começar?
                </h3>
                <p className="text-gray-600">
                  Sim! Você pode começar gratuitamente e ter acesso a todas as funcionalidades básicas. 
                  Apenas a gravação de aulas é um recurso premium.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Como os alunos acessam a plataforma?
                </h3>
                <p className="text-gray-600">
                  Apenas através de convites que você envia. Os alunos não podem se cadastrar 
                  sozinhos, garantindo total controle sobre quem acessa suas informações.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Posso usar no celular?
                </h3>
                <p className="text-gray-600">
                  Absolutamente! O EduManager foi desenvolvido com foco mobile-first, 
                  funcionando perfeitamente em qualquer dispositivo.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  E se eu tiver dúvidas?
                </h3>
                <p className="text-gray-600">
                  Oferecemos suporte técnico completo através do chat, email e nossa 
                  base de conhecimento sempre atualizada.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Crie sua conta gratuitamente e transforme sua forma de ensinar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary-500 hover:bg-gray-100 px-8 py-3">
                Criar Conta Grátis
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-500 px-8 py-3">
                Falar com Especialista
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
