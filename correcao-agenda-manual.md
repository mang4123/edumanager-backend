# CORREÇÃO MANUAL - ABA AGENDA

## PROBLEMA
A aba AGENDA não carrega alunos e dá erro de "Cannot read properties of undefined"

## LOCALIZAÇÃO DO ARQUIVO
Procure no projeto por arquivos com nomes:
- `Calendar.tsx`
- `Agenda.tsx` 
- `CalendarView.tsx`
- Ou qualquer arquivo na pasta `components` que contenha "calendar", "agenda", "schedule"

## CORREÇÕES ESPECÍFICAS

### 1. ENCONTRE LINHAS COMO ESTAS:
```javascript
// ❌ PROBLEMÁTICAS
students.map(student => ...)
aulas.map(aula => ...)
events.map(event => ...)
data[0].something
students[0].name
```

### 2. SUBSTITUA POR:
```javascript
// ✅ CORRIGIDAS
(students || []).map(student => ...)
(aulas || []).map(aula => ...)
(events || []).map(event => ...)
data?.[0]?.something
students?.[0]?.name
```

### 3. NO INÍCIO DA FUNÇÃO DO COMPONENTE, ADICIONE:
```javascript
// Logo após os imports e antes do return
const safeStudents = students || [];
const safeAulas = aulas || [];
const safeEvents = events || [];

// Use safeStudents, safeAulas, etc. no lugar dos originais
```

### 4. SE HOUVER USEEFFECT COM FETCH, ADICIONE:
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/professor/alunos');
      const data = await response.json();
      setStudents(data || []); // ← IMPORTANTE: || []
    } catch (error) {
      setStudents([]); // ← IMPORTANTE: array vazio em caso de erro
    }
  };
}, []);
```

### 5. PADRÃO UNIVERSAL
Em QUALQUER lugar que use .map() ou [0], mude para:
- `array.map()` → `(array || []).map()`
- `array[0]` → `array?.[0]`
- `array.length` → `(array || []).length`

## ARQUIVOS MAIS PROVÁVEIS
- `src/components/Calendar.tsx`
- `src/components/AgendaView.tsx`
- `src/pages/Calendar.tsx`
- `src/components/dashboard/CalendarSection.tsx` 