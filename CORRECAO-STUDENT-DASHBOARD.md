# 🔧 CORREÇÃO: StudentDashboard com Navegação

## 📁 **ARQUIVO:** `src/pages/StudentDashboard.tsx`

### ❌ **PROBLEMA ATUAL:**
QuickActionsStudent não recebe função de navegação

### ✅ **SOLUÇÃO:**
**Localizar linha 67** (aproximadamente) que contém:
```tsx
<QuickActionsStudent />
```

**Substituir por:**
```tsx
{/* 🎯 CORRIGIDO: Passando função de navegação */}
<QuickActionsStudent onNavigateToTab={setActiveTab} />
```

### 🎯 **TAMBÉM ADICIONAR** (se não existir):
No início da função `StudentDashboard`, **adicionar log**:
```tsx
const StudentDashboard = () => {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // 🎯 ADICIONADO: Log para debug de navegação
  const handleNavigateToTab = (tab: string) => {
    console.log('🎯 [NAVEGAÇÃO] Mudando para aba:', tab);
    setActiveTab(tab);
  };
```

**E usar `handleNavigateToTab` em vez de `setActiveTab`:**
```tsx
<QuickActionsStudent onNavigateToTab={handleNavigateToTab} />
```

### 📋 **RESUMO DAS MUDANÇAS:**
1. ✅ Passar prop `onNavigateToTab` para `QuickActionsStudent`
2. ✅ Adicionar logs para debug
3. ✅ Usar função wrapper para melhor controle

### 🧪 **TESTE:**
1. Clicar em "Fazer Pergunta" → Deve mudar para aba "Dúvidas"
2. Clicar em "Ver Materiais" → Deve mudar para aba "Materiais"
3. Console deve mostrar logs das ações 