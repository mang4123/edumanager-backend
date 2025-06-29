import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Lista de exercícios em memória
let exerciciosMemoria: any[] = [
  {
    id: 1,
    titulo: 'Equações do 2º grau',
    descricao: 'Resolva as equações propostas e justifique sua resposta',
    materia: 'Matemática',
    dificuldade: 'médio',
    prazo: '2024-01-25',
    status: 'enviado',
    dataEnvio: '2024-01-18',
    alunos: [
      { id: 1, nome: 'João Silva', status: 'pendente' },
      { id: 2, nome: 'Maria Santos', status: 'entregue' }
    ],
    pontuacao: 10,
    tipo: 'lista'
  },
  {
    id: 2,
    titulo: 'Leis de Newton',
    descricao: 'Questões sobre as três leis de Newton',
    materia: 'Física',
    dificuldade: 'fácil',
    prazo: '2024-01-22',
    status: 'corrigido',
    dataEnvio: '2024-01-15',
    alunos: [
      { id: 2, nome: 'Maria Santos', status: 'corrigido', nota: 9.0 }
    ],
    pontuacao: 8,
    tipo: 'questões'
  }
];

// Listar exercícios
router.get('/', (req, res) => {
  console.log('=== LISTAR EXERCÍCIOS ===');
  console.log('Total de exercícios em memória:', exerciciosMemoria.length);
  
  res.json({ 
    message: 'Lista de exercícios',
    data: exerciciosMemoria
  });
});

// Detalhes de um exercício específico
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: 'Detalhes do exercício',
    data: {
      id: parseInt(id),
      titulo: 'Equações do 2º grau',
      descricao: 'Resolva as equações propostas e justifique sua resposta',
      materia: 'Matemática',
      dificuldade: 'médio',
      prazo: '2024-01-25',
      status: 'enviado',
      dataEnvio: '2024-01-18',
      pontuacao: 10,
      tipo: 'lista',
      questoes: [
        {
          numero: 1,
          enunciado: 'Resolva: x² - 5x + 6 = 0',
          tipo: 'calculo'
        },
        {
          numero: 2,
          enunciado: 'Encontre as raízes de: 2x² + 3x - 2 = 0',
          tipo: 'calculo'
        }
      ],
      material: ['Livro cap. 8', 'Videoaula #15'],
      observacoes: 'Foquem na demonstração do cálculo'
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
        prazo: '2024-01-25',
        status: 'pendente',
        nota: null
      },
      {
        id: 2,
        titulo: 'Leis de Newton',
        materia: 'Física',
        prazo: '2024-01-22',
        status: 'corrigido',
        nota: 9.0
      }
    ]
  });
});

// Criar exercício (apenas professor)
router.post('/', (req, res) => {
  console.log('=== CRIAR EXERCÍCIO ===');
  console.log('Dados recebidos:', req.body);
  
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
  
  console.log('✅ Exercício criado e adicionado! Total:', exerciciosMemoria.length);
  console.log('Novo exercício:', novoExercicio);
  
  res.json({ 
    message: 'Exercício criado',
    data: novoExercicio
  });
});

// Enviar exercício para aluno
router.post('/:id/enviar', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: 'Exercício enviado',
    data: {
      exercicioId: parseInt(id),
      alunosIds: req.body.alunosIds || [],
      dataEnvio: new Date().toISOString(),
      prazo: req.body.prazo,
      status: 'enviado'
    }
  });
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
// Upload de material por professor
router.post('/:id/upload-material', (req, res) => {
  const { id } = req.params;
  const { arquivos, links, tipoMaterial = 'complementar', descricao } = req.body;
  
  console.log('=== UPLOAD MATERIAL (PROFESSOR) ===');
  console.log('Exercício ID:', id);
  console.log('Tipo:', tipoMaterial);
  console.log('Arquivos:', arquivos?.length || 0);
  console.log('Links:', links?.length || 0);
  
  const uploadId = Math.random().toString(36).substr(2, 9);
  
  res.json({
    message: 'Material enviado com sucesso',
    data: {
      uploadId,
      exercicioId: parseInt(id),
      materiaisEnviados: {
        arquivos: arquivos || [
          {
            nome: 'lista_exercicios.pdf',
            tamanho: '1.8MB',
            tipo: 'application/pdf',
            url: `/uploads/professor/${uploadId}/lista_exercicios.pdf`
          },
          {
            nome: 'exemplo_resolvido.jpg',
            tamanho: '650KB',
            tipo: 'image/jpeg',
            url: `/uploads/professor/${uploadId}/exemplo_resolvido.jpg`
          }
        ],
        links: links || [
          {
            titulo: 'Vídeo explicativo - Khan Academy',
            url: 'https://www.khanacademy.org/math/algebra',
            tipo: 'video'
          },
          {
            titulo: 'Exercícios online',
            url: 'https://www.matemática.com/exercicios',
            tipo: 'exercicios'
          }
        ]
      },
      tipoMaterial,
      descricao: descricao || 'Material complementar do exercício',
      dataEnvio: new Date().toISOString(),
      alunosNotificados: ['João Silva', 'Maria Santos']
    }
  });
});

// Listar materiais de um exercício
router.get('/:id/materiais', (req, res) => {
  const { id } = req.params;
  
  console.log('=== LISTAR MATERIAIS EXERCÍCIO ===');
  console.log('Exercício ID:', id);
  
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
  console.log('=== TIPOS ARQUIVO PERMITIDOS ===');
  
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

// Deletar material
router.delete('/:exercicioId/material/:materialId', (req, res) => {
  const { exercicioId, materialId } = req.params;
  
  console.log('=== DELETAR MATERIAL ===');
  console.log('Exercício ID:', exercicioId);
  console.log('Material ID:', materialId);
  
  res.json({
    message: 'Material removido com sucesso',
    data: {
      exercicioId: parseInt(exercicioId),
      materialId: parseInt(materialId),
      dataRemocao: new Date().toISOString(),
      alunosNotificados: true
    }
  });
});

export { router as exercicioRoutes }; 