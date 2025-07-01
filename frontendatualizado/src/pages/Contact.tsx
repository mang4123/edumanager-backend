
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, ArrowLeft, Mail, Phone, MessageSquare, Clock, MapPin, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Entraremos em contato em até 24 horas.",
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-primary-500" />,
      title: "Email",
      content: "contato@edumanager.com.br",
      description: "Resposta em até 24h"
    },
    {
      icon: <Phone className="w-6 h-6 text-secondary-500" />,
      title: "Telefone",
      content: "(11) 99999-9999",
      description: "Seg à Sex, 9h às 18h"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-accent-500" />,
      title: "WhatsApp",
      content: "(11) 99999-9999",
      description: "Atendimento rápido"
    },
    {
      icon: <Clock className="w-6 h-6 text-primary-500" />,
      title: "Horário",
      content: "Seg à Sex, 9h às 18h",
      description: "Sábados até 14h"
    }
  ];

  const faqItems = [
    {
      question: "Como posso testar a plataforma?",
      answer: "Você pode criar uma conta gratuita e testar todas as funcionalidades básicas. Para recursos premium, oferecemos 14 dias de teste grátis."
    },
    {
      question: "Preciso de conhecimentos técnicos?",
      answer: "Não! O EduManager foi desenvolvido para ser extremamente intuitivo. Qualquer professor consegue usar facilmente."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim! Utilizamos criptografia de ponta e seguimos todas as normas de proteção de dados (LGPD)."
    },
    {
      question: "Posso importar meus dados?",
      answer: "Sim! Nossa equipe ajuda na migração dos seus dados de outras plataformas ou planilhas."
    },
    {
      question: "Há limite de alunos?",
      answer: "No plano gratuito você pode ter até 10 alunos. Nos planos pagos não há limite."
    },
    {
      question: "Como funciona o suporte?",
      answer: "Oferecemos suporte por email, chat online e WhatsApp (dependendo do plano). Nossa equipe é especializada em educação."
    }
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
            Fale
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500"> Conosco</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aqui para ajudar! Entre em contato e tire todas as suas dúvidas sobre o EduManager.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Envie sua mensagem
                </CardTitle>
                <p className="text-gray-600">
                  Preencha o formulário abaixo e nossa equipe entrará em contato
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="h-12"
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
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone (opcional)</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto</Label>
                      <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Informações gerais</SelectItem>
                          <SelectItem value="support">Suporte técnico</SelectItem>
                          <SelectItem value="sales">Vendas</SelectItem>
                          <SelectItem value="partnership">Parcerias</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Conte-nos como podemos ajudar..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-primary text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {info.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{info.title}</p>
                      <p className="text-sm text-gray-600">{info.content}</p>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nosso Endereço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-primary-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">São Paulo, SP</p>
                    <p className="text-sm text-gray-600">
                      Rua das Flores, 123<br />
                      Vila Madalena<br />
                      CEP: 05417-000
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary-50 to-secondary-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Precisa de ajuda imediata?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Acesse nossa central de ajuda com tutoriais e respostas rápidas
                </p>
                <Button variant="outline" className="w-full">
                  Central de Ajuda
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Nossa equipe está pronta para ajudar você a começar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary-500 hover:bg-gray-100 px-8 py-3">
              Agendar Demonstração
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-500 px-8 py-3">
              Chat Online
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
