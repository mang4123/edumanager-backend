# 🔗 Guia de Integração Híbrida: Lovable + Seu Backend

## **📋 Arquitetura Final:**

```
Frontend (Lovable) 
    ↓
    ├─ Supabase Lovable ─── Auth, queries simples, real-time
    └─ Seu Backend Express ─── Lógica complexa, relatórios, validações
```

---

## **🛠️ IMPLEMENTAÇÃO NO LOVABLE:**

### **1. Criar cliente API para seu backend**

**Arquivo:** `src/integrations/api/backend.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = 'https://edumanager-backend-5olt.onrender.com';

export class BackendAPI {
  private async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Métodos da API
  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const backendAPI = new BackendAPI();
```

---

### **2. Usar nos componentes**

**Exemplo:** `src/components/TeacherDashboard.tsx`

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { backendAPI } from '@/integrations/api/backend';

const TeacherDashboard = () => {
  // ✅ Auth via Supabase (mantém o existente)
  const { user } = useAuth();
  
  // ✅ Dados simples via Supabase direto (rápido)
  const { data: aulas } = useQuery({
    queryKey: ['aulas'],
    queryFn: async () => {
      const { data } = await supabase
        .from('aulas')
        .select('*')
        .eq('professor_id', user?.id);
      return data;
    }
  });
  
  // ✅ Dashboard complexo via seu backend
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => backendAPI.get('/api/professor/dashboard')
  });
  
  // ✅ Relatórios via backend
  const gerarRelatorio = useMutation({
    mutationFn: (params: any) => 
      backendAPI.post('/api/professor/relatorio', params),
    onSuccess: (data) => {
      console.log('Relatório gerado:', data);
    }
  });

  return (
    <div>
      <h1>Dashboard do Professor</h1>
      
      {/* Dados do Supabase */}
      <div>
        <h2>Próximas Aulas</h2>
        {aulas?.map(aula => (
          <div key={aula.id}>{aula.titulo}</div>
        ))}
      </div>

      {/* Dados do Backend */}
      <div>
        <h2>Estatísticas</h2>
        <p>Total de alunos: {dashboardStats?.totalAlunos}</p>
        <p>Receita mensal: {dashboardStats?.receitaMensal}</p>
      </div>

      {/* Ações do Backend */}
      <button 
        onClick={() => gerarRelatorio.mutate({ periodo: 'mensal' })}
      >
        Gerar Relatório Mensal
      </button>
    </div>
  );
};
```

---

## **🎯 CASOS DE USO POR TECNOLOGIA:**

### **🔵 Use SUPABASE para:**
- ✅ Autenticação de usuários
- ✅ Queries simples (SELECT, INSERT básicos)
- ✅ Real-time (subscriptions)
- ✅ Storage de arquivos
- ✅ Dados que mudam frequentemente

### **🟢 Use SEU BACKEND para:**
- ✅ Lógica de negócio complexa
- ✅ Cálculos e relatórios
- ✅ Integrações com APIs externas
- ✅ Validações complexas
- ✅ Processamento de dados
- ✅ Envio de emails/notificações

---

## **🚀 ENDPOINTS DISPONÍVEIS NO SEU BACKEND:**

### **Professor (`/api/professor/`):**
- `GET /dashboard` - Stats completas
- `GET /alunos` - Lista de alunos
- `GET /aulas` - Lista de aulas
- `GET /exercicios` - Lista de exercícios
- `GET /financeiro` - Dados financeiros
- `POST /relatorio` - Gerar relatórios
- `GET /stats` - Estatísticas
- `POST /notificar` - Enviar notificações

### **Aluno (`/api/aluno/`):**
- `GET /dashboard` - Dashboard do aluno
- `GET /professores` - Lista de professores
- `GET /aulas` - Aulas do aluno
- `GET /exercicios` - Exercícios atribuídos
- `POST /duvida` - Enviar dúvida

### **Geral:**
- `GET /health` - Status da API
- `GET /api/auth/status` - Status de autenticação
- `GET /api/auth/me` - Dados do usuário atual

---

## **✅ TESTANDO A INTEGRAÇÃO:**

1. **Primeiro, teste seu backend:**
```bash
curl https://edumanager-backend-5olt.onrender.com/health
```

2. **No Lovable, teste a integração:**
```typescript
// Teste no console do navegador
import { backendAPI } from '@/integrations/api/backend';

// Testar conexão
backendAPI.get('/api/auth/status')
  .then(console.log)
  .catch(console.error);
```

3. **Implementar gradualmente:**
   - Comece com uma funcionalidade simples
   - Teste a autenticação
   - Adicione recursos complexos aos poucos

---

## **🔧 PRÓXIMOS PASSOS:**

1. **Copie o código do BackendAPI** para seu projeto Lovable
2. **Implemente em um componente** (ex: Dashboard)
3. **Teste a autenticação** com `/api/auth/me`
4. **Adicione funcionalidades** conforme necessário
5. **Monitore logs** no Render para debug

---

**💡 Dica:** Mantenha sempre o Supabase para auth e queries simples, e use o backend para lógica complexa. Essa combinação oferece o melhor dos dois mundos! 