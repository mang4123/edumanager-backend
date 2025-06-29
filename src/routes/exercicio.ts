import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Lista de exercícios em memória - DATAS ATUALIZADAS E SEM QUESTÕES FIXAS
let exerciciosMemoria: any[] = [
  {
    id: 1,
    titulo: 'Equações do 2º grau',
    descricao: 'Resolva as equações propostas e justifique sua resposta',
    materia: 'Matemática',
    dificuldade: 'médio',
    prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias a partir de hoje
    status: 'enviado',
    dataEnvio: new Date().toISOString().split('T')[0], // Data de hoje
    alunos: [
      { id: 1, nome: 'João Silva', status: 'pendente' },
      { id: 2, nome: 'Maria Santos', status: 'entregue' }
    ],
    pontuacao: 10,
    tipo: 'lista',
    questoes: [] // Questões serão adicionadas dinamicamente
  },
  {
    id: 2,
    titulo: 'Leis de Newton',
    descricao: 'Questões sobre as três leis de Newton',
    materia: 'Física',
    dificuldade: 'fácil',
    prazo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 dias a partir de hoje
    status: 'corrigido',
    dataEnvio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias atrás
    alunos: [
      { id: 2, nome: 'Maria Santos', status: 'corrigido', nota: 9.0 }
    ],
    pontuacao: 8,
    tipo: 'questões',
    questoes: [] // Questões serão criadas dinamicamente
  }
];

// Listar exercícios
router.get('/', (req, res) => {
  res.json({ 
    message: 'Lista de exercícios',
    data: exerciciosMemoria
  });
});

// Detalhes de um exercício específico - SEM QUESTÕES PRÉ-DEFINIDAS
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const exercicio = exerciciosMemoria.find(ex => ex.id === parseInt(id));
  
  if (!exercicio) {
    return res.status(404).json({
      message: 'Exercício não encontrado'
    });
  }
  
  return res.json({
    message: 'Detalhes do exercício',
    data: {
      id: parseInt(id),
      titulo: exercicio.titulo,
      descricao: exercicio.descricao,
      materia: exercicio.materia,
      dificuldade: exercicio.dificuldade,
      prazo: exercicio.prazo,
      status: exercicio.status,
      dataEnvio: exercicio.dataEnvio,
      pontuacao: exercicio.pontuacao,
      tipo: exercicio.tipo,
      questoes: exercicio.questoes || [], // Questões vazias por padrão - professor pode adicionar
      material: ['Consulte o material da disciplina'],
      observacoes: 'Exercício criado dinamicamente',
      instrucoes: 'As questões podem ser adicionadas pelo professor através do sistema',
      permiteEdicao: true
    }
  });
});

// Exercícios por aluno
router.get('/aluno/:alunoId', (req, res) => {
  const { alunoId } = req.params;
  res.json({
    message: 'Exercícios do aluno',
    data: [
      {
        id: 1,
        titulo: 'Equações do 2º grau',
        materia: 'Matemática',
        prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias a partir de hoje
        status: 'pendente',
        nota: null
      },
      {
        id: 2,
        titulo: 'Leis de Newton',
        materia: 'Física',
        prazo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias a partir de hoje
        status: 'corrigido',
        nota: 9.0
      }
    ]
  });
});

// Criar exercício (apenas professor)
router.post('/', (req, res) => {
  const { titulo, descricao, materia, prazo, dificuldade, alunos } = req.body;
  
  const novoExercicio = {
    id: Math.floor(Math.random() * 1000) + 100,
    titulo,
    descricao,
    materia,
    dificuldade: dificuldade || 'médio',
    prazo,
    status: 'criado',
    dataCriacao: new Date().toISOString(),
    alunos: alunos || [],
    pontuacao: 10,
    tipo: 'exercício'
  };
  
  // Adicionar à lista em memória
  exerciciosMemoria.push(novoExercicio);
  
  res.json({ 
    message: 'Exercício criado',
    data: novoExercicio
  });
});

// Enviar exercício para alunos específicos
router.post('/:id/enviar', (req: any, res) => {
  try {
    const { id } = req.params;
    const { alunosIds = [], prazo, titulo, descricao, materia } = req.body;
    const professorId = req.user?.id || 'professor-default';
    
    console.log('=== ENVIAR EXERCÍCIO ===');
    console.log('ID:', id);
    console.log('Body:', req.body);
    console.log('ProfessorId:', professorId);
    
    // Buscar exercício (aceita ID numérico ou string)
    const exercicioId = isNaN(parseInt(id)) ? id : parseInt(id);
    let exercicio = exerciciosMemoria.find(ex => ex.id === exercicioId);
    
    // Se não encontrou, criar exercício dinamicamente
    if (!exercicio) {
      exercicio = {
        id: exercicioId,
        titulo: titulo || `Exercício ${id}`,
        descricao: descricao || `Exercício de demonstração criado automaticamente`,
        materia: materia || 'Geral',
        dificuldade: 'médio',
        prazo: prazo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'criado',
        dataEnvio: new Date().toISOString().split('T')[0],
        alunos: [],
        pontuacao: 10,
        tipo: 'exercício',
        questoes: []
      };
      
      // Adicionar à lista
      exerciciosMemoria.push(exercicio);
      console.log('✅ Exercício criado dinamicamente:', exercicio);
    }
  
    // Criar registro do exercício enviado no estado global (se disponível)
    const exercicioEnviado = {
      id: Date.now(),
      exercicioId: exercicioId,
      professorId: professorId,
      alunosIds: alunosIds,
      titulo: exercicio.titulo,
      descricao: exercicio.descricao,
      materia: exercicio.materia,
      prazo: prazo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dataEnvio: new Date().toISOString(),
      status: 'enviado' as const
    };
    
    // Só adiciona ao estado global se existe
    if (req.estadoGlobal?.exerciciosEnviados) {
      req.estadoGlobal.exerciciosEnviados.push(exercicioEnviado);
      console.log('✅ Exercício adicionado ao estado global');
    }
    
    // Criar notificações para cada aluno (se disponível)
    if (alunosIds && alunosIds.length > 0) {
      alunosIds.forEach((alunoId: number) => {
        const alunoIdString = alunoId === 1 ? '725be6a4-addf-4e19-b866-496093537918' : `aluno-${alunoId}`;
        
        // Criar notificação para o aluno (se função disponível)
        if (req.estadoGlobal?.criarNotificacao) {
          req.estadoGlobal.criarNotificacao(
            alunoIdString,
            'exercicio',
            `Novo exercício: ${exercicio.titulo}`,
            `Você recebeu um novo exercício de ${exercicio.materia}. Prazo: ${prazo}`,
            'normal',
            {
              tipo: 'redirect',
              url: `/aluno/materiais/${id}`,
              dados: { exercicioId: id, prazo }
            }
          );
        }
        
        // Enviar notificação por email (se função disponível)  
        if (req.estadoGlobal?.enviarNotificacaoEmail) {
          const emailAluno = `aluno${alunoId}@email.com`;
          req.estadoGlobal.enviarNotificacaoEmail(
            emailAluno,
            `Novo Exercício: ${exercicio.titulo}`,
            `Olá! Você recebeu um novo exercício de ${exercicio.materia}. Acesse sua área do aluno para visualizar. Prazo: ${prazo}`
          );
        }
      });
      console.log('✅ Notificações criadas para', alunosIds.length, 'alunos');
    }
    
    return res.json({
      message: 'Exercício enviado com sucesso',
      data: {
        exercicioEnviado,
        alunosNotificados: alunosIds.length,
        notificacaoEmail: true,
        totalExerciciosEnviados: req.estadoGlobal?.exerciciosEnviados?.length || 0
      }
    });
    
  } catch (error) {
    console.error('❌ ERRO ao enviar exercício:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor ao enviar exercício',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Responder exercício (apenas aluno)
router.post('/:id/resposta', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: 'Resposta enviada',
    data: {
      exercicioId: parseInt(id),
      respostas: req.body.respostas || [],
      dataEntrega: new Date().toISOString(),
      status: 'entregue',
      observacoes: req.body.observacoes || ''
    }
  });
});

// Corrigir exercício (apenas professor)
router.post('/:id/correcao', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: 'Exercício corrigido',
    data: {
      exercicioId: parseInt(id),
      alunoId: req.body.alunoId,
      nota: req.body.nota,
      feedback: req.body.feedback || '',
      dataCorrecao: new Date().toISOString(),
      status: 'corrigido'
    }
  });
});

// Relatório de exercícios
router.get('/relatorio', (req, res) => {
  res.json({
    message: 'Relatório de exercícios',
    data: {
      totalExercicios: 15,
      exerciciosEnviados: 12,
      exerciciosCorrigidos: 8,
      mediaNotas: 8.2,
      estatisticas: {
        facil: 5,
        medio: 7,
        dificil: 3
      },
      materias: {
        'Matemática': 8,
        'Física': 4,
        'Química': 3
      }
    }
  });
});

// Banco de questões
router.get('/questoes', (req, res) => {
  res.json({
    message: 'Banco de questões',
    data: [
      {
        id: 1,
        enunciado: 'Resolva: x² - 5x + 6 = 0',
        materia: 'Matemática',
        dificuldade: 'médio',
        tipo: 'calculo',
        tags: ['equação', 'segundo grau']
      },
      {
        id: 2,
        enunciado: 'Explique a primeira lei de Newton',
        materia: 'Física',
        dificuldade: 'fácil',
        tipo: 'teórica',
        tags: ['newton', 'leis']
      }
    ]
  });
});

// === SISTEMA DE UPLOAD DE MATERIAIS PARA PROFESSORES ===
// Upload de material para exercício
router.post('/:id/upload', (req, res) => {
  const { id } = req.params;
  const { tipoMaterial, arquivos, links } = req.body;
  
  res.json({
    message: 'Material adicionado ao exercício',
    data: {
      exercicioId: parseInt(id),
      materiaisAdicionados: {
        arquivos: arquivos?.length || 0,
        links: links?.length || 0,
        tipoMaterial
      },
      proximosPassos: [
        'Enviar exercício para alunos',
        'Definir prazo de entrega',
        'Configurar notificações'
      ]
    }
  });
});

// Listar materiais de um exercício
router.get('/:id/materiais', (req, res) => {
  const { id } = req.params;
  
  res.json({
    message: 'Materiais do exercício',
    data: {
      exercicioId: parseInt(id),
      arquivos: [
        {
          id: 1,
          nome: 'lista_principal.pdf',
          tamanho: '2.1MB',
          tipo: 'application/pdf',
          url: `/materiais/exercicio_${id}_lista_principal.pdf`,
          dataUpload: '2024-01-18T10:00:00Z',
          downloads: 5
        },
        {
          id: 2,
          nome: 'gabarito.pdf',
          tamanho: '890KB',
          tipo: 'application/pdf',
          url: `/materiais/exercicio_${id}_gabarito.pdf`,
          dataUpload: '2024-01-18T10:05:00Z',
          downloads: 3
        }
      ],
      links: [
        {
          id: 1,
          titulo: 'Vídeo Aula - Equações do 2º Grau',
          url: 'https://youtube.com/watch?v=exemplo',
          tipo: 'video',
          dataAdicao: '2024-01-18T10:10:00Z',
          cliques: 8
        }
      ],
      estatisticas: {
        totalMateriais: 3,
        totalDownloads: 8,
        totalCliques: 8,
        materialMaisAcessado: 'lista_principal.pdf'
      }
    }
  });
});

// === TIPOS DE ARQUIVO PERMITIDOS ===
// Verificar tipos de arquivo permitidos
router.get('/upload/tipos-permitidos', (req, res) => {
  res.json({
    message: 'Tipos de arquivo permitidos',
    data: {
      documentos: {
        tipos: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
        tamanhoMaximo: '10MB',
        descricao: 'Documentos de texto e exercícios'
      },
      imagens: {
        tipos: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
        tamanhoMaximo: '5MB',
        descricao: 'Imagens e figuras explicativas'
      },
      planilhas: {
        tipos: ['.xls', '.xlsx', '.csv'],
        tamanhoMaximo: '8MB',
        descricao: 'Planilhas e dados'
      },
      apresentacoes: {
        tipos: ['.ppt', '.pptx'],
        tamanhoMaximo: '15MB',
        descricao: 'Apresentações e slides'
      },
      audio: {
        tipos: ['.mp3', '.wav', '.m4a'],
        tamanhoMaximo: '20MB',
        descricao: 'Áudios explicativos'
      },
      video: {
        tipos: ['.mp4', '.mov', '.avi'],
        tamanhoMaximo: '50MB',
        descricao: 'Vídeos curtos (recomendado usar links)'
      },
      limitesGerais: {
        arquivosPorUpload: 5,
        tamanhoTotalMaximo: '50MB',
        linksPorExercicio: 10
      }
    }
  });
});

// Deletar material de exercício
router.delete('/:exercicioId/materiais/:materialId', (req, res) => {
  const { exercicioId, materialId } = req.params;
  
  res.json({
    message: 'Material removido com sucesso',
    data: {
      exercicioId: parseInt(exercicioId),
      materialRemovidoId: parseInt(materialId),
      materiaisRestantes: 2,
      statusLimpeza: 'arquivo_removido_servidor'
    }
  });
});

// === GERENCIAMENTO DINÂMICO DE QUESTÕES ===
// Adicionar questão a um exercício
router.post('/:id/questoes', (req, res) => {
  const { id } = req.params;
  const { enunciado, tipo, alternativas, resposta, pontuacao } = req.body;
  
  const exercicio = exerciciosMemoria.find(ex => ex.id === parseInt(id));
  
  if (!exercicio) {
    return res.status(404).json({
      message: 'Exercício não encontrado'
    });
  }
  
  if (!enunciado || !tipo) {
    return res.status(400).json({
      message: 'Enunciado e tipo são obrigatórios'
    });
  }
  
  // Inicializar array de questões se não existir
  if (!exercicio.questoes) {
    exercicio.questoes = [];
  }
  
  const novaQuestao = {
    id: Date.now() + Math.random(),
    numero: exercicio.questoes.length + 1,
    enunciado,
    tipo: tipo || 'dissertativa', // dissertativa, multipla_escolha, verdadeiro_falso, calculo
    alternativas: alternativas || [],
    resposta: resposta || '',
    pontuacao: pontuacao || 1,
    dataCriacao: new Date().toISOString()
  };
  
  exercicio.questoes.push(novaQuestao);
  
  return res.status(201).json({
    message: 'Questão adicionada com sucesso',
    data: {
      questao: novaQuestao,
      totalQuestoes: exercicio.questoes.length,
      exercicio: {
        id: exercicio.id,
        titulo: exercicio.titulo,
        totalPontuacao: exercicio.questoes.reduce((total: number, q: any) => total + q.pontuacao, 0)
      }
    }
  });
});

// Editar questão de um exercício
router.put('/:exercicioId/questoes/:questaoId', (req, res) => {
  const { exercicioId, questaoId } = req.params;
  const { enunciado, tipo, alternativas, resposta, pontuacao } = req.body;
  
  const exercicio = exerciciosMemoria.find(ex => ex.id === parseInt(exercicioId));
  
  if (!exercicio) {
    return res.status(404).json({
      message: 'Exercício não encontrado'
    });
  }
  
  if (!exercicio.questoes) {
    return res.status(404).json({
      message: 'Nenhuma questão encontrada neste exercício'
    });
  }
  
  const questao = exercicio.questoes.find((q: any) => q.id == questaoId);
  
  if (!questao) {
    return res.status(404).json({
      message: 'Questão não encontrada'
    });
  }
  
  // Atualizar questão
  if (enunciado) questao.enunciado = enunciado;
  if (tipo) questao.tipo = tipo;
  if (alternativas) questao.alternativas = alternativas;
  if (resposta !== undefined) questao.resposta = resposta;
  if (pontuacao) questao.pontuacao = pontuacao;
  questao.dataModificacao = new Date().toISOString();
  
  return res.json({
    message: 'Questão atualizada com sucesso',
    data: {
      questao,
      exercicio: {
        id: exercicio.id,
        titulo: exercicio.titulo,
        totalQuestoes: exercicio.questoes.length
      }
    }
  });
});

// Remover questão de um exercício
router.delete('/:exercicioId/questoes/:questaoId', (req, res) => {
  const { exercicioId, questaoId } = req.params;
  
  const exercicio = exerciciosMemoria.find(ex => ex.id === parseInt(exercicioId));
  
  if (!exercicio) {
    return res.status(404).json({
      message: 'Exercício não encontrado'
    });
  }
  
  if (!exercicio.questoes) {
    return res.status(404).json({
      message: 'Nenhuma questão encontrada neste exercício'
    });
  }
  
  const questaoIndex = exercicio.questoes.findIndex((q: any) => q.id == questaoId);
  
  if (questaoIndex === -1) {
    return res.status(404).json({
      message: 'Questão não encontrada'
    });
  }
  
  const questaoRemovida = exercicio.questoes.splice(questaoIndex, 1)[0];
  
  // Renumerar questões
  exercicio.questoes.forEach((q: any, index: number) => {
    q.numero = index + 1;
  });
  
  return res.json({
    message: 'Questão removida com sucesso',
    data: {
      questaoRemovida,
      totalQuestoes: exercicio.questoes.length,
      exercicio: {
        id: exercicio.id,
        titulo: exercicio.titulo
      }
    }
  });
});

// Obter templates de questões para facilitar criação
router.get('/templates/questoes', (req, res) => {
  res.json({
    message: 'Templates de questões disponíveis',
    data: {
      tipos: [
        {
          tipo: 'dissertativa',
          nome: 'Questão Dissertativa',
          exemplo: 'Explique o conceito de...',
          campos: ['enunciado', 'pontuacao']
        },
        {
          tipo: 'multipla_escolha',
          nome: 'Múltipla Escolha',
          exemplo: 'Qual é a resposta correta?',
          campos: ['enunciado', 'alternativas', 'resposta', 'pontuacao']
        },
        {
          tipo: 'verdadeiro_falso',
          nome: 'Verdadeiro ou Falso',
          exemplo: 'A afirmação X é verdadeira',
          campos: ['enunciado', 'resposta', 'pontuacao']
        },
        {
          tipo: 'calculo',
          nome: 'Exercício de Cálculo',
          exemplo: 'Resolva: 2x + 5 = 13',
          campos: ['enunciado', 'resposta', 'pontuacao']
        }
      ],
      materias: ['Matemática', 'Física', 'Química', 'Português', 'História', 'Geografia', 'Biologia', 'Inglês'],
      dificuldades: ['fácil', 'médio', 'difícil']
    }
  });
});

export { router as exercicioRoutes }; 