# EduManager - Backend API

Sistema de Gestão de Professores - API Backend desenvolvida em Node.js + TypeScript + Express + Supabase.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Supabase** - Backend as a Service (Auth + Database)
- **JWT** - Autenticação
- **Cors** - Cross-Origin Resource Sharing
- **Helmet** - Segurança

## 📋 Funcionalidades

### 🔐 Autenticação
- Registro de Professor
- Registro de Aluno (via convite do professor)
- Login/Logout
- Recuperação de senha
- Autenticação JWT

### 👨‍🏫 Professor
- Dashboard personalizado
- Gerenciar alunos
- Agendar aulas
- Criar e enviar exercícios
- Controle financeiro

### 👨‍🎓 Aluno
- Dashboard personalizado
- Visualizar aulas agendadas
- Receber e responder exercícios
- Agenda de aulas

### 📅 Aulas
- Agendamento
- Reagendamento
- Cancelamento
- Controle de presença

### 📝 Exercícios
- Criação (professor)
- Envio para alunos
- Respostas (aluno)
- Correção (professor)

### 💰 Financeiro
- Relatórios financeiros
- Controle de pagamentos
- Geração de cobranças

## ⚙️ Configuração

### 1. Instalar dependências
\`\`\`bash
npm install
\`\`\`

### 2. Configurar variáveis de ambiente
Copie o arquivo \`.env.example\` para \`.env\` e configure:

\`\`\`env
# Supabase Configuration
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
\`\`\`

### 3. Configurar banco de dados Supabase
Você precisará criar as seguintes tabelas no Supabase:

\`\`\`sql
-- Tabela profiles (complementa o auth.users do Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('professor', 'aluno')) NOT NULL,
  telefone TEXT,
  especialidade TEXT, -- apenas para professores
  professor_id UUID REFERENCES profiles(id), -- apenas para alunos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outras tabelas necessárias: aulas, exercicios, pagamentos, etc.
\`\`\`

## 🏃‍♂️ Executar o projeto

### Desenvolvimento
\`\`\`bash
npm run dev
\`\`\`

### Produção
\`\`\`bash
npm run build
npm start
\`\`\`

### Testes
\`\`\`bash
npm test
\`\`\`

## 📡 Endpoints da API

### Autenticação
- \`POST /api/auth/register/professor\` - Registrar professor
- \`POST /api/auth/register/aluno\` - Registrar aluno
- \`POST /api/auth/login\` - Login
- \`POST /api/auth/logout\` - Logout
- \`POST /api/auth/forgot-password\` - Esqueci a senha
- \`POST /api/auth/reset-password\` - Redefinir senha
- \`GET /api/auth/profile\` - Obter perfil

### Professor
- \`GET /api/professor/dashboard\` - Dashboard
- \`GET /api/professor/alunos\` - Listar alunos
- \`POST /api/professor/alunos/convite\` - Enviar convite

### Aluno
- \`GET /api/aluno/dashboard\` - Dashboard
- \`GET /api/aluno/aulas\` - Aulas agendadas
- \`GET /api/aluno/exercicios\` - Exercícios recebidos

### Aulas
- \`GET /api/aula/\` - Listar aulas
- \`POST /api/aula/\` - Agendar aula
- \`PUT /api/aula/:id/reagendar\` - Reagendar aula

### Exercícios
- \`GET /api/exercicio/\` - Listar exercícios
- \`POST /api/exercicio/\` - Criar exercício
- \`POST /api/exercicio/:id/resposta\` - Responder exercício

### Financeiro
- \`GET /api/financeiro/relatorio\` - Relatório financeiro
- \`GET /api/financeiro/pagamentos\` - Listar pagamentos
- \`POST /api/financeiro/pagamentos\` - Registrar pagamento

## 🔍 Health Check

A API possui um endpoint de health check:
\`\`\`
GET /health
\`\`\`

Retorna status 200 se a API estiver funcionando.

## 🤝 Integração com Frontend

Esta API foi projetada para funcionar perfeitamente com o frontend desenvolvido no Lovable (React + TypeScript). 

Para conectar o frontend:
1. Configure a \`FRONTEND_URL\` no arquivo \`.env\`
2. Use os endpoints da API no seu frontend React
3. Inclua o token JWT no header \`Authorization: Bearer <token>\`

## 🔒 Segurança

- **Helmet** para headers de segurança
- **CORS** configurado adequadamente
- **JWT** para autenticação
- **Supabase Auth** para gerenciamento seguro de usuários
- Validação de dados de entrada
- Controle de acesso baseado em roles (professor/aluno)

## 📝 Próximos Passos

1. **Conectar ao Supabase**: Configure suas credenciais no \`.env\`
2. **Criar schema do banco**: Implemente as tabelas necessárias
3. **Implementar controllers**: Adicionar lógica de negócio completa
4. **Adicionar validações**: Usar Zod para validação de dados
5. **Testes**: Adicionar testes unitários e de integração
6. **Deploy**: Configurar para produção

---

**Desenvolvido para o EduManager** 🎓✨ 