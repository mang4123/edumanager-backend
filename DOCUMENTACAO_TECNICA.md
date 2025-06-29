# 📋 Documentação Técnica - EduManager Backend

## 🏗️ **Estrutura do Projeto**

```
edumanager-backend/
├── 📂 src/
│   ├── 📂 controllers/          # Lógica de negócio
│   │   └── AuthController.ts    # Autenticação
│   ├── 📂 middleware/           # Middlewares
│   │   ├── auth.ts             # Verificação JWT
│   │   └── errorHandler.ts     # Tratamento de erros
│   ├── 📂 routes/              # Rotas da API
│   │   ├── auth.ts             # Rotas de autenticação
│   │   ├── professor.ts        # Rotas do professor
│   │   ├── aluno.ts            # Rotas do aluno
│   │   ├── aula.ts             # Agendamento
│   │   ├── exercicio.ts        # Exercícios
│   │   └── financeiro.ts       # Módulo financeiro
│   ├── 📂 config/              # Configurações
│   │   └── supabase.ts         # Setup Supabase
│   └── 📄 server.ts            # Servidor principal
├── 📄 package.json             # Dependências
├── 📄 tsconfig.json            # Config TypeScript
├── 📄 render.yaml              # Deploy Render
└── 📄 README.md                # Documentação
```

---

## 🔧 **Configuração do Ambiente**

### **Variáveis de Ambiente**

```env
# Supabase
SUPABASE_URL=https://qyaorhetkrgmkrtzjpvm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_123456789

# Server
PORT=3000
NODE_ENV=production
```

### **Instalação Local**

```bash
# 1. Clone o repositório
git clone https://github.com/mang4123/edumanager-backend.git
cd edumanager-backend

# 2. Instale dependências
npm install

# 3. Configure .env (copie as variáveis acima)
cp .env.example .env

# 4. Execute em desenvolvimento
npm run dev

# 5. Execute em produção
npm run build
npm start
```

---

## 🗄️ **Estrutura do Banco de Dados**

### **Tabela: profiles**

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('professor', 'aluno')),
    especialidade TEXT,
    professor_id UUID REFERENCES profiles(id),
    password_hash TEXT NOT NULL,
    convite_token TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabela: aulas**

```sql
CREATE TABLE aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES profiles(id),
    aluno_id UUID NOT NULL REFERENCES profiles(id),
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracao INTEGER DEFAULT 60, -- minutos
    tipo TEXT DEFAULT 'online' CHECK (tipo IN ('online', 'presencial')),
    status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'concluida', 'cancelada', 'reagendada')),
    link_reuniao TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabela: exercicios**

```sql
CREATE TABLE exercicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES profiles(id),
    titulo TEXT NOT NULL,
    descricao TEXT,
    questoes JSONB NOT NULL DEFAULT '[]',
    prazo TIMESTAMP WITH TIME ZONE,
    materia TEXT,
    dificuldade TEXT DEFAULT 'medio' CHECK (dificuldade IN ('facil', 'medio', 'dificil')),
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabela: exercicio_alunos**

```sql
CREATE TABLE exercicio_alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercicio_id UUID NOT NULL REFERENCES exercicios(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES profiles(id),
    respostas JSONB DEFAULT '{}',
    nota DECIMAL(5,2),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'corrigido')),
    enviado_em TIMESTAMP WITH TIME ZONE,
    corrigido_em TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exercicio_id, aluno_id)
);
```

### **Tabela: duvidas**

```sql
CREATE TABLE duvidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES profiles(id),
    professor_id UUID NOT NULL REFERENCES profiles(id),
    titulo TEXT NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT,
    urgencia TEXT DEFAULT 'normal' CHECK (urgencia IN ('baixa', 'normal', 'alta')),
    status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'respondida', 'resolvida')),
    materia TEXT,
    respondida_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabela: financeiro**

```sql
CREATE TABLE financeiro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES profiles(id),
    aluno_id UUID NOT NULL REFERENCES profiles(id),
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('mensalidade', 'aula_avulsa', 'material')),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
    vencimento DATE NOT NULL,
    pago_em TIMESTAMP WITH TIME ZONE,
    metodo_pagamento TEXT CHECK (metodo_pagamento IN ('pix', 'boleto', 'cartao', 'transferencia')),
    dados_pagamento JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabela: notificacoes**

```sql
CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES profiles(id),
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('aula', 'exercicio', 'duvida', 'pagamento', 'geral')),
    lida BOOLEAN DEFAULT FALSE,
    urgencia TEXT DEFAULT 'normal' CHECK (urgencia IN ('baixa', 'normal', 'alta')),
    dados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lida_em TIMESTAMP WITH TIME ZONE
);
```

---

## 🔐 **Sistema de Autenticação**

### **Fluxo JWT**

```typescript
// 1. Geração do Token
const token = jwt.sign(
    { 
        userId: user.id, 
        email: user.email, 
        tipo: user.tipo 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
);

// 2. Verificação do Token
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

// 3. Middleware de Autenticação
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token de acesso requerido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
};
```

### **Middleware de Autorização**

```typescript
export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.tipo)) {
            return res.status(403).json({ error: 'Acesso negado para este tipo de usuário' });
        }
        next();
    };
};

// Uso: requireRole(['professor'])
```

---

## 📡 **Endpoints da API**

### **🔐 Autenticação**

```typescript
POST   /api/auth/register                    // Registro genérico
POST   /api/auth/register/professor          // Registro de professor
POST   /api/auth/register/aluno              // Registro de aluno (com token)
POST   /api/auth/login                       // Login universal
POST   /api/auth/logout                      // Logout
POST   /api/auth/forgot-password             // Recuperação de senha
POST   /api/auth/reset-password              // Reset de senha
GET    /api/auth/verify-token                // Verificar token
```

### **👨‍🏫 Professor**

```typescript
GET    /api/professor/dashboard              // Dashboard principal
GET    /api/professor/profile                // Perfil do professor
PUT    /api/professor/profile                // Atualizar perfil

// Gestão de Alunos
GET    /api/professor/alunos                 // Listar alunos
GET    /api/professor/students               // Alias para alunos
GET    /api/professor/alunos/:id             // Detalhes do aluno
POST   /api/professor/alunos/gerar-token     // Gerar token de convite
DELETE /api/professor/alunos/:id             // Remover aluno

// Aulas
GET    /api/professor/aulas                  // Listar aulas
POST   /api/professor/aulas                  // Agendar aula
PUT    /api/professor/aulas/:id              // Reagendar aula
DELETE /api/professor/aulas/:id              // Cancelar aula

// Exercícios
GET    /api/professor/exercicios             // Listar exercícios
POST   /api/professor/exercicios             // Criar exercício
PUT    /api/professor/exercicios/:id         // Editar exercício
DELETE /api/professor/exercicios/:id         // Deletar exercício
POST   /api/professor/exercicios/:id/enviar  // Enviar para alunos

// Dúvidas
GET    /api/professor/duvidas                // Listar dúvidas
POST   /api/professor/duvidas/:id/responder  // Responder dúvida
PUT    /api/professor/duvidas/:id/resolver   // Marcar como resolvida

// Financeiro
GET    /api/professor/financeiro             // Dados financeiros
POST   /api/professor/financeiro/cobranca    // Criar cobrança
PUT    /api/professor/financeiro/:id         // Atualizar cobrança

// Configurações e Outros
GET    /api/professor/config                 // Configurações
PUT    /api/professor/config                 // Salvar configurações
GET    /api/professor/notificacoes           // Notificações
PUT    /api/professor/notificacoes/:id/lida  // Marcar como lida
GET    /api/professor/stats                  // Estatísticas
```

### **👨‍🎓 Aluno**

```typescript
GET    /api/aluno/profile                    // Perfil do aluno
PUT    /api/aluno/profile                    // Atualizar perfil

// Aulas
GET    /api/aluno/aulas                      // Aulas do aluno
POST   /api/aluno/aulas/:id/reagendar        // Solicitar reagendamento

// Materiais e Exercícios
GET    /api/aluno/materiais                  // Lista de materiais
GET    /api/aluno/materiais/:id              // Detalhes do material
POST   /api/aluno/materiais/:id/responder    // Enviar respostas

// Dúvidas
GET    /api/aluno/duvidas                    // Suas dúvidas
POST   /api/aluno/duvidas                    // Enviar nova dúvida
PUT    /api/aluno/duvidas/:id                // Atualizar dúvida

// Financeiro
GET    /api/aluno/pagamentos                 // Área financeira
POST   /api/aluno/pagamentos/pagar-pix       // Pagamento PIX
POST   /api/aluno/pagamentos/pagar-boleto    // Pagamento Boleto
POST   /api/aluno/pagamentos/pagar-cartao    // Pagamento Cartão

// Notificações
GET    /api/aluno/notificacoes               // Suas notificações
PUT    /api/aluno/notificacoes/:id/lida      // Marcar como lida
```

### **📝 Exercícios**

```typescript
GET    /api/exercicio/                       // Listar exercícios
POST   /api/exercicio/                       // Criar exercício
GET    /api/exercicio/:id                    // Detalhes do exercício
PUT    /api/exercicio/:id                    // Editar exercício
DELETE /api/exercicio/:id                    // Deletar exercício
POST   /api/exercicio/:id/enviar             // Enviar para alunos
GET    /api/exercicio/:id/respostas          // Ver respostas
POST   /api/exercicio/:id/corrigir           // Corrigir respostas
```

### **💰 Financeiro**

```typescript
GET    /api/financeiro/                      // Lista de transações
POST   /api/financeiro/cobranca              // Criar cobrança
GET    /api/financeiro/:id                   // Detalhes da transação
PUT    /api/financeiro/:id                   // Atualizar status
DELETE /api/financeiro/:id                   // Cancelar cobrança
POST   /api/financeiro/pix                   // Gerar PIX
POST   /api/financeiro/boleto                // Gerar Boleto
GET    /api/financeiro/relatorio             // Relatório financeiro
```

### **🔔 Utilitários**

```typescript
GET    /health                               // Health check
GET    /api/stats                            // Estatísticas gerais
POST   /api/upload                           // Upload de arquivos
```

---

## 🔄 **Tratamento de Erros**

### **Middleware de Erro Global**

```typescript
export const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Erro capturado:', error);

    // Erro de validação do Supabase
    if (error.code === '23505') {
        return res.status(400).json({
            error: 'Dados duplicados. Verifique se o email já está cadastrado.'
        });
    }

    // Erro JWT
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }

    // Erro padrão
    res.status(500).json({
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};
```

### **Códigos de Status**

| Código | Significado | Uso |
|--------|-------------|-----|
| **200** | OK | Sucesso geral |
| **201** | Created | Recurso criado |
| **400** | Bad Request | Dados inválidos |
| **401** | Unauthorized | Token ausente/inválido |
| **403** | Forbidden | Sem permissão |
| **404** | Not Found | Recurso não encontrado |
| **409** | Conflict | Conflito (email duplicado) |
| **500** | Internal Error | Erro do servidor |

---

## 🎨 **Estrutura de Resposta da API**

### **Padrão de Sucesso**

```json
{
    "success": true,
    "message": "Operação realizada com sucesso",
    "data": {
        "id": "uuid-aqui",
        "nome": "Dados do usuário"
    },
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Padrão de Erro**

```json
{
    "success": false,
    "error": "Descrição do erro",
    "code": "ERROR_CODE",
    "details": "Detalhes técnicos (só em dev)",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Paginação**

```json
{
    "success": true,
    "data": [...],
    "pagination": {
        "current_page": 1,
        "per_page": 20,
        "total": 150,
        "total_pages": 8,
        "has_next": true,
        "has_prev": false
    }
}
```

---

## 🧪 **Testes**

### **Testando com cURL**

```bash
# 1. Health Check
curl https://edumanager-backend-5olt.onrender.com/health

# 2. Registro de Professor
curl -X POST https://edumanager-backend-5olt.onrender.com/api/auth/register/professor \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "123456",
    "telefone": "11999999999",
    "especialidade": "Matemática"
  }'

# 3. Login
curl -X POST https://edumanager-backend-5olt.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "123456"
  }'

# 4. Dashboard (com token)
curl https://edumanager-backend-5olt.onrender.com/api/professor/dashboard \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### **Testando com Postman**

1. **Crie uma collection** "EduManager API"
2. **Configure variável de ambiente** `{{base_url}}` = `https://edumanager-backend-5olt.onrender.com`
3. **Configure token automático** após login
4. **Importe requests** dos exemplos acima

---

## 🚀 **Deploy e CI/CD**

### **Deploy Automático (Render.com)**

```yaml
# render.yaml
services:
  - type: web
    name: edumanager-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### **Variáveis de Ambiente no Render**

```
SUPABASE_URL=https://qyaorhetkrgmkrtzjpvm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=sua_chave_secreta_super_segura_aqui_123456789
NODE_ENV=production
```

### **Git Workflow**

```bash
# Desenvolvimento
git checkout -b feature/nova-funcionalidade
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade

# Deploy Automático
git checkout main
git merge feature/nova-funcionalidade
git push origin main  # Auto-deploy no Render
```

---

## 📊 **Monitoramento**

### **Health Check Endpoint**

```typescript
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.2.0'
    });
});
```

### **Logs Estruturados**

```typescript
const log = {
    level: 'info',
    message: 'Usuário logou com sucesso',
    userId: 'uuid-here',
    email: 'user@email.com',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
};

console.log(JSON.stringify(log));
```

---

## 🔧 **Troubleshooting**

### **Problemas Comuns**

#### **1. "Token inválido ou expirado"**
- ✅ Verifique se o JWT_SECRET está configurado
- ✅ Confirme que o token não expirou (7 dias)
- ✅ Teste com um novo login

#### **2. "Database error"**
- ✅ Verifique as credenciais do Supabase
- ✅ Confirme que as tabelas existem
- ✅ Verifique Row Level Security (RLS)

#### **3. "CORS Error"**
- ✅ Configure cors() no Express
- ✅ Adicione domínio permitido
- ✅ Verifique headers de requisição

#### **4. "Cannot find module"**
- ✅ Execute `npm install`
- ✅ Verifique imports relativos vs absolutos
- ✅ Confirme tsconfig.json

### **Debug Avançado**

```typescript
// Habilitar logs detalhados
export const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
    console.log('🔍 Request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
    });
}
```

---

## 🎯 **Próximos Passos**

### **Features Planejadas**

- [ ] **WebSocket** para notificações em tempo real
- [ ] **Upload de arquivos** com AWS S3
- [ ] **Sistema de avaliações** e notas
- [ ] **Relatórios em PDF** automáticos
- [ ] **Integração WhatsApp** para notificações
- [ ] **App Mobile** React Native
- [ ] **Dashboard administrativo** completo
- [ ] **Backup automático** dos dados

### **Melhorias Técnicas**

- [ ] **Testes unitários** com Jest
- [ ] **Docker** para containerização
- [ ] **Redis** para cache
- [ ] **Rate limiting** mais sofisticado
- [ ] **Logs centralizados** com ELK Stack
- [ ] **Métricas** com Prometheus
- [ ] **CI/CD** com GitHub Actions

---

**🔧 Documentação mantida por desenvolvedores para desenvolvedores** 