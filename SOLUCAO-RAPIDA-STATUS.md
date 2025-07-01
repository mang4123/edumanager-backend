# 🚨 SOLUÇÃO RÁPIDA - Erro da Coluna Status

## ❌ PROBLEMA
```
Could not find the 'status' column of 'exercicios' in the schema cache
```

## ✅ SOLUÇÃO: Adicionar coluna status na tabela exercicios

### 1. Execute este SQL no Supabase Dashboard:

```sql
-- Adicionar coluna status na tabela exercicios
ALTER TABLE exercicios 
ADD COLUMN status VARCHAR(20) DEFAULT 'criado' 
CHECK (status IN ('criado', 'enviado', 'corrigido', 'arquivado'));

-- Atualizar registros existentes
UPDATE exercicios 
SET status = 'criado' 
WHERE status IS NULL;
```

### 2. Como executar:

1. Abra o Supabase Dashboard
2. Vá em SQL Editor 
3. Cole o código SQL acima
4. Clique em "Run"

### 3. Verificar se funcionou:

```sql
-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'exercicios' 
AND column_name = 'status';
```

## 🎉 RESULTADO
Depois disso, o botão "Novo Material" deve funcionar sem erro!

## 📝 NOTA
A coluna `status` estava definida no arquivo `create-tables.sql` mas não foi criada no banco real. 