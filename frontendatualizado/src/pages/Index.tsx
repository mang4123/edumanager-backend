import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BookOpen, DollarSign, Video, Menu, X, Star, CheckCircle, ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const steps = [{
    number: 1,
    title: "Cadastre-se como Professor",
    description: "Crie sua conta em minutos informando sua área de atuação",
    icon: <Users className="w-8 h-8 text-primary-500" />,
    details: ["Cadastro simples e rápido", "Escolha sua área de ensino", "Configuração do perfil"]
  }, {
    number: 2,
    title: "Convide seus Alunos",
    description: "Envie convites privados para seus alunos acessarem a plataforma",
    icon: <MessageSquare className="w-8 h-8 text-secondary-500" />,
    details: ["Links de convite exclusivos", "Controle total sobre quem acessa", "Onboarding automático dos alunos"]
  }, {
    number: 3,
    title: "Organize sua Agenda",
    description: "Gerencie horários, marque e reagende aulas facilmente",
    icon: <Calendar className="w-8 h-8 text-accent-500" />,
    details: ["Calendario interativo", "Notificações automáticas", "Flexibilidade para mudanças"]
  }, {
    number: 4,
    title: "Compartilhe Materiais",
    description: "Envie exercícios, responda dúvidas e acompanhe o progresso",
    icon: <BookOpen className="w-8 h-8 text-primary-500" />,
    details: ["Upload de PDFs e imagens", "Sistema de dúvidas integrado", "Acompanhamento personalizado"]
  }, {
    number: 5,
    title: "Controle Financeiro",
    description: "Gerencie pagamentos e tenha relatórios completos",
    icon: <DollarSign className="w-8 h-8 text-secondary-500" />,
    details: ["Links de pagamento automáticos", "Histórico de recebimentos", "Relatórios financeiros"]
  }, {
    number: 6,
    title: "Grave suas Aulas (Premium)",
    description: "Disponibilize gravações para revisão dos alunos",
    icon: <Video className="w-8 h-8 text-accent-500" />,
    details: ["Gravação em HD", "Armazenamento seguro", "Compartilhamento privado"]
  }];
  const benefits = ["Economia de tempo na organização", "Melhor comunicação com alunos", "Controle financeiro simplificado", "Profissionalização do ensino", "Acesso a relatórios detalhados", "Suporte técnico especializado"];
  const testimonials = [{
    name: "Maria Silva",
    role: "Professora de Inglês",
    content: "Revolucionou minha forma de ensinar! Agora tenho tudo organizado em um só lugar.",
    rating: 5
  }, {
    name: "João Santos",
    role: "Personal Trainer",
    content: "Meus alunos adoraram a facilidade para marcar treinos e acompanhar exercícios.",
    rating: 5
  }, {
    name: "Ana Costa",
    role: "Professora de Música",
    content: "Perfeito para professores autônomos. Interface simples e funcional.",
    rating: 5
  }];
  return <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-soft sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">LClass</h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/how-it-works" className="text-gray-600 hover:text-primary-500 transition-colors">
                Como Funciona
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-primary-500 transition-colors">
                Preços
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary-500 transition-colors">
                Contato
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && <div className="md:hidden mt-4 space-y-4 pb-4">
              <Link to="/how-it-works" className="block text-gray-600 hover:text-primary-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Como Funciona
              </Link>
              <Link to="/pricing" className="block text-gray-600 hover:text-primary-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Preços
              </Link>
              <Link to="/contact" className="block text-gray-600 hover:text-primary-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Contato
              </Link>
            </div>}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Comece grátis e organize suas aulas com seus alunos em
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500"> minutos</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Ideal para professores autônomos que querem mais controle e menos bagunça
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto gradient-primary hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-white px-8 py-4 text-lg">
                👨‍🏫 Área do Professor
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary-500 text-primary-500 hover:bg-primary-50 px-8 py-4 text-lg">
                🧑‍🎓 Área do Aluno
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            ✨ Cadastro gratuito • Sem cartão de crédito • Comece em 2 minutos
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simples em 6 passos
            </h2>
            <p className="text-xl text-gray-600">
              Uma plataforma completa para professores autônomos organizarem suas aulas, alunos e finanças em um só lugar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => <Card key={step.number} className="relative hover:shadow-lg transition-shadow">
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
                    {step.details.map((detail, detailIndex) => <li key={detailIndex} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>)}
                  </ul>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher o EduManager?
            </h2>
            <p className="text-lg text-gray-600">
              Benefícios que fazem a diferença no seu dia a dia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>)}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
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
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que dizem nossos professores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <div key={index} className="p-6 bg-gray-50 rounded-2xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para revolucionar suas aulas?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de professores que já transformaram seu ensino
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-white text-primary-500 hover:bg-gray-100 px-8 py-4 text-lg">
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">EduManager</h3>
              </div>
              <p className="text-gray-400">
                A plataforma completa para professores autônomos
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">Como Funciona</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Preços</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contato</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ajuda</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EduManager. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;