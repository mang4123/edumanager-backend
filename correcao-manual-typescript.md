# CORREÇÃO MANUAL - ERRO TYPESCRIPT

## PROBLEMA
```
Property 'profiles' is missing in type 'Student' but required in type '{ profiles: { name: string; }[]; nivel: string; }'
```

## SOLUÇÃO MANUAL

### 1. ABRIR O ARQUIVO
- Vá em `src/pages/StudentHistory.tsx`
- Procure pela linha 210 ou próximo

### 2. ENCONTRAR O ERRO
Procure por algo assim:
```typescript
// ❌ PROBLEMA - pode estar assim:
student.profiles.name
student.profiles[0].name
{ profiles: { name: string; }[]; nivel: string; }
```

### 3. CORRIGIR - SUBSTITUA POR:
```typescript
// ✅ SOLUÇÃO - mude para:
student.name
// ou se não existir, use:
student.nome
```

### 4. CORREÇÕES ESPECÍFICAS POSSÍVEIS:

**Se encontrar isto:**
```typescript
const studentData = {
  profiles: { name: string; }[],
  nivel: string
}
```

**Mude para:**
```typescript
const studentData = {
  name: string,
  nivel: string
}
```

**Se encontrar isto:**
```typescript
student.profiles.name
```

**Mude para:**
```typescript
student.name || student.nome
```

### 5. TIPO Student
Se houver definição de tipo, mude:

**❌ ANTES:**
```typescript
interface Student {
  profiles: { name: string }[];
  nivel: string;
}
```

**✅ DEPOIS:**
```typescript
interface Student {
  name?: string;
  nome?: string;
  nivel: string;
}
```

### 6. TESTE RÁPIDO
Salve o arquivo e veja se o erro sumiu. Se ainda der erro, me mande a mensagem exata que aparece. 