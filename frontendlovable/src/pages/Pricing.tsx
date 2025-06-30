
import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ArrowLeft, Check, Star, Video } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Básico",
      price: 0,
      period: "Sempre grátis",
      description: "Perfeito para começar",
      features: [
        "Até 10 alunos",
        "Agenda de aulas",
        "Gestão de alunos",
        "Envio de materiais",
        "Sistema de dúvidas",
        "Controle financeiro básico",
        "Suporte por email"
      ],
      highlighted: false,
      cta: "Começar Grátis"
    },
    {
      name: "Profissional",
      price: isAnnual ? 19 : 24,
      period: isAnnual ? "/mês (anual)" : "/mês",
      originalPrice: isAnnual ? 24 : null,
      description: "Para professores estabelecidos",
      features: [
        "Alunos ilimitados",
        "Todas as funcionalidades do Básico",
        "Relatórios avançados",
        "Links de pagamento integrados",
        "Notificações automáticas",
        "Backup automático",
        "Suporte prioritário",
        "Personalização da marca"
      ],
      highlighted: true,
      cta: "Começar Teste Grátis"
    },
    {
      name: "Premium",
      price: isAnnual ? 39 : 49,
      period: isAnnual ? "/mês (anual)" : "/mês",
      originalPrice: isAnnual ? 49 : null,
      description: "Máximo desempenho",
      features: [
        "Todas as funcionalidades do Profissional",
        "Gravação de aulas em HD",
        "100GB de armazenamento",
        "Transmissão ao vivo",
        "API para integrações",
        "Analytics avançados",
        "Suporte via WhatsApp",
        "Consultoria personalizada"
      ],
      highlighted: false,
      cta: "Começar Teste Grátis"
    }
  ];

  const features = [
    {
      category: "Gestão de Aulas",
      items: [
        { name: "Agenda interativa", basic: true, pro: true, premium: true },
        { name: "Notificações automáticas", basic: false, pro: true, premium: true },
        { name: "Reagendamento fácil", basic: true, pro: true, premium: true },
        { name: "Histórico completo", basic: true, pro: true, premium: true }
      ]
    },
    {
      category: "Alunos",
      items: [
        { name: "Até 10 alunos", basic: true, pro: false, premium: false },
        { name: "Alunos ilimitados", basic: false, pro: true, premium: true },
        { name: "Perfis detalhados", basic: true, pro: true, premium: true },
        { name: "Sistema de convites", basic: true, pro: true, premium: true }
      ]
    },
    {
      category: "Conteúdo",
      items: [
        { name: "Envio de materiais", basic: true, pro: true, premium: true },
        { name: "Sistema de dúvidas", basic: true, pro: true, premium: true },
        { name: "Gravação de aulas", basic: false, pro: false, premium: true },
        { name: "Armazenamento 100GB", basic: false, pro: false, premium: true }
      ]
    },
    {
      category: "Financeiro",
      items: [
        { name: "Controle básico", basic: true, pro: false, premium: false },
        { name: "Links de pagamento", basic: false, pro: true, premium: true },
        { name: "Relatórios avançados", basic: false, pro: true, premium: true },
        { name: "Analytics detalhados", basic: false, pro: false, premium: true }
      ]
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
            Planos que crescem
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500"> com você</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comece gratuitamente e evolua conforme sua necessidade. 
            Todos os planos incluem 14 dias de teste grátis.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Anual
            </span>
            {isAnnual && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                20% OFF
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative ${
                plan.highlighted 
                  ? 'border-primary-500 border-2 shadow-xl scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Mais Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Grátis' : `R$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 ml-1">/mês</span>
                    )}
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-400 line-through">
                      R${plan.originalPrice}/mês
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">{plan.period}</div>
                </div>
                <p className="text-gray-600 mt-4">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/register">
                  <Button 
                    className={`w-full h-12 ${
                      plan.highlighted 
                        ? 'gradient-primary text-white' 
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Compare todos os recursos
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Recursos</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Básico</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 bg-primary-50">Profissional</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((category, categoryIndex) => (
                    <Fragment key={categoryIndex}>
                      <tr className="bg-gray-100">
                        <td colSpan={4} className="py-3 px-6 font-semibold text-gray-800 text-sm">
                          {category.category}
                        </td>
                      </tr>
                      {category.items.map((item, itemIndex) => (
                        <tr key={itemIndex} className="border-t border-gray-100">
                          <td className="py-3 px-6 text-gray-700">{item.name}</td>
                          <td className="py-3 px-6 text-center">
                            {item.basic ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-center bg-primary-50">
                            {item.pro ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-center">
                            {item.premium ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas sobre os planos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Posso mudar de plano a qualquer momento?
                </h3>
                <p className="text-gray-600">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  Ajustaremos o valor na próxima cobrança.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  O teste grátis é realmente grátis?
                </h3>
                <p className="text-gray-600">
                  Sim! 14 dias completos sem nenhuma cobrança. Você pode cancelar a qualquer 
                  momento durante o período de teste.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Como funciona o plano Básico gratuito?
                </h3>
                <p className="text-gray-600">
                  O plano Básico é realmente gratuito para sempre! Perfeito para professores 
                  que estão começando ou têm poucos alunos.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Qual a diferença no suporte?
                </h3>
                <p className="text-gray-600">
                  Plano Básico: email | Profissional: email prioritário | 
                  Premium: email, chat e WhatsApp com consultoria.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para escolher seu plano?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comece gratuitamente ou teste qualquer plano por 14 dias
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary-500 hover:bg-gray-100 px-8 py-3">
                Começar Grátis
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-500 px-8 py-3">
                Falar com Vendas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
