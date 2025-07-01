# 🔍 VERIFICAÇÃO COMPLETA - Outros Possíveis Loops

## 1. ❌ URLS RELATIVAS (CAUSA PRINCIPAL)

Verifique se NÃO há estas URLs problemáticas:

```tsx
❌ fetch('/api/aluno/profile')      // URL relativa
❌ fetch('/api/aluno/stats')        // URL relativa  
❌ fetch('/api/professor/alunos')   // URL relativa
```

## 2. ✅ URLS CORRETAS (devem estar assim):

```tsx
✅ const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://edumanager-backend-5olt.onrender.com';
✅ fetch(`${backendUrl}/api/aluno/profile`)
✅ fetch(`${backendUrl}/api/aluno/stats`)
✅ fetch(`${backendUrl}/api/professor/alunos`)
```

## 3. 🔄 useEffect SEM PROTEÇÃO

Procure por useEffect que podem loopear:

```tsx
❌ useEffect(() => {
    fetchData(); // SEMPRE executa
}, [data]); // 'data' muda toda vez

✅ useEffect(() => {
    if (user?.id && session && !hasChecked) {
        fetchData();
        setHasChecked(true); // PROTEÇÃO
    }
}, [user?.id, session, hasChecked]);
```

## 4. 📂 ARQUIVOS A VERIFICAR NA LOVABLE:

1. **src/components/student-dashboard/WelcomeCard.tsx** ⭐
2. **src/components/student-dashboard/StatsOverview.tsx** ⭐
3. **src/components/dashboard/StudentsGrid.tsx**
4. **src/components/dashboard/MaterialsSection.tsx**
5. **src/components/student-dashboard/MaterialsGrid.tsx**
6. **src/components/student-dashboard/QuestionsSection.tsx**

## 5. 🚨 SINAIS DE LOOP INFINITO:

- Loading infinito na tela
- Console com muitos logs repetidos
- Rede no F12 com muitas requests 404
- Browser travando/lento

## 6. 🔧 CORREÇÃO UNIVERSAL:

Para QUALQUER fetch no projeto, use este padrão:

```tsx
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://edumanager-backend-5olt.onrender.com';
const token = await getAuthToken();

fetch(`${backendUrl}/api/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 7. 🎯 TESTE FINAL:

1. Substitua os 2 arquivos principais
2. Verifique se não há mais fetch('/api/...') 
3. Teste login como aluno
4. Dashboard deve carregar sem loop 