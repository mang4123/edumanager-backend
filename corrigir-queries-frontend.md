# CORREÇÃO DAS CONSULTAS DO FRONTEND

## PROBLEMA IDENTIFICADO
As consultas do frontend estão falhando com erro PGRST201 devido a relacionamentos ambíguos entre `alunos` e `profiles`.

## SOLUÇÃO - CORRIGIR AS QUERIES NO LOVABLE

### 1. LOCALIZAR O ARQUIVO DE QUERIES
No seu projeto Lovable, procure pelo arquivo que contém as consultas (provavelmente em `src/integrations/supabase/` ou similar).

### 2. CORRIGIR A QUERY DE ALUNOS
**PROBLEMA:** Query atual deve estar assim:
```javascript
const { data: alunos } = await supabase
  .from('alunos')
  .select('*, profiles(*)')  // ❌ AMBÍGUO
  .eq('professor_id', user.id);
```

**SOLUÇÃO:** Especificar o relacionamento:
```javascript
const { data: alunos } = await supabase
  .from('alunos')
  .select(`
    *,
    profiles!alunos_aluno_id_fkey(*)
  `)
  .eq('professor_id', user.id);
```

### 3. CORRIGIR A QUERY DE AULAS
**PROBLEMA:** Query atual deve estar assim:
```javascript
const { data: aulas } = await supabase
  .from('aulas')
  .select('*, profiles(*)')  // ❌ AMBÍGUO
  .eq('professor_id', user.id);
```

**SOLUÇÃO:** Especificar o relacionamento:
```javascript
const { data: aulas } = await supabase
  .from('aulas')
  .select(`
    *,
    profiles!aulas_aluno_id_fkey(nome, email)
  `)
  .eq('professor_id', user.id);
```

### 4. ALTERNATIVA MAIS SIMPLES
Se as correções acima não funcionarem, use consultas separadas:

```javascript
// 1. Buscar alunos
const { data: alunos } = await supabase
  .from('alunos')
  .select('*')
  .eq('professor_id', user.id);

// 2. Buscar profiles dos alunos
const alunoIds = alunos.map(a => a.aluno_id);
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .in('id', alunoIds);

// 3. Combinar os dados no frontend
const alunosComDados = alunos.map(aluno => ({
  ...aluno,
  profile: profiles.find(p => p.id === aluno.aluno_id)
}));
```

### 5. ONDE ENCONTRAR NO LOVABLE
Procure por arquivos com:
- `.from('alunos')`
- `.from('aulas')`
- `.select('*, profiles`
- Arquivos em `src/integrations/supabase/`
- Arquivos de queries ou hooks

### 6. EXEMPLO COMPLETO PARA DASHBOARD
```javascript
// No arquivo do dashboard do professor
const buscarDadosDashboard = async () => {
  const user = supabase.auth.getUser();
  
  // Buscar alunos com dados do profile
  const { data: alunos, error: errorAlunos } = await supabase
    .from('alunos')
    .select(`
      id,
      ativo,
      created_at,
      profiles!alunos_aluno_id_fkey(
        id,
        nome,
        email,
        telefone
      )
    `)
    .eq('professor_id', user.id)
    .eq('ativo', true);

  // Buscar aulas próximas
  const { data: aulas, error: errorAulas } = await supabase
    .from('aulas')
    .select(`
      id,
      data_hora,
      duracao,
      assunto,
      materia,
      status,
      profiles!aulas_aluno_id_fkey(
        nome,
        email
      )
    `)
    .eq('professor_id', user.id)
    .gte('data_hora', new Date().toISOString())
    .order('data_hora', { ascending: true })
    .limit(10);

  return { alunos, aulas };
};
```

## PRÓXIMO PASSO
1. Encontre o arquivo com as queries problemáticas no Lovable
2. Aplique uma das correções acima
3. Teste se o erro PGRST201 desaparece
4. Me informe qual correção funcionou

## BACKUP - SE NADA FUNCIONAR
Como última opção, podemos desabilitar o embed e fazer consultas simples:
```javascript
// Consulta super simples - sem joins
const { data: alunos } = await supabase
  .from('alunos')
  .select('*')
  .eq('professor_id', user.id);
``` 