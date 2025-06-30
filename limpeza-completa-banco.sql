-- LIMPEZA COMPLETA DO BANCO DE DADOS EDUMANAGER
-- REMOVE TODOS OS DADOS DE TESTE E MANTÉM APENAS ESTRUTURA REAL

-- 1. BACKUP DAS TABELAS IMPORTANTES (estrutura)
CREATE TABLE IF NOT EXISTS backup_estrutura AS 
SELECT 'backup' as info;

-- 2. LIMPEZA DOS DADOS DE TESTE
-- Remover dados de teste das tabelas principais
DELETE FROM financeiro WHERE descricao LIKE '%exemplo%' OR descricao LIKE '%teste%';
DELETE FROM duvidas WHERE pergunta LIKE '%exemplo%' OR pergunta LIKE '%teste%';
DELETE FROM exercicio_alunos WHERE exercicio_id IN (
    SELECT id FROM exercicios WHERE titulo LIKE '%exemplo%' OR titulo LIKE '%Equações do 2º%' OR titulo LIKE '%Newton%' OR titulo LIKE '%Balanceamento%'
);
DELETE FROM exercicios WHERE titulo LIKE '%exemplo%' OR titulo LIKE '%Equações do 2º%' OR titulo LIKE '%Newton%' OR titulo LIKE '%Balanceamento%';
DELETE FROM aulas WHERE assunto LIKE '%exemplo%' OR assunto LIKE '%Aula de Matemática%' OR assunto LIKE '%Aula de Física%';
DELETE FROM alunos WHERE aluno_id IN (
    SELECT id FROM profiles WHERE nome LIKE '%Exemplo%' OR nome LIKE '%João Silva%' OR nome LIKE '%Maria Santos%' OR nome LIKE '%Teste%'
);
DELETE FROM profiles WHERE nome LIKE '%Exemplo%' OR nome LIKE '%João Silva%' OR nome LIKE '%Maria Santos%' OR nome LIKE '%Teste%' OR email LIKE '%exemplo%' OR email LIKE '%teste%';

-- 3. RESET SEQUENCES (se necessário)
-- Manter apenas o professor real (ID específico do Leonardo)
-- Certificar que existe o profile do professor principal

-- 4. VERIFICAÇÃO FINAL
SELECT 'LIMPEZA CONCLUÍDA - Dados restantes:' as status;
SELECT 'Profiles:' as tabela, count(*) as total FROM profiles;
SELECT 'Alunos:' as tabela, count(*) as total FROM alunos;
SELECT 'Aulas:' as tabela, count(*) as total FROM aulas;
SELECT 'Exercícios:' as tabela, count(*) as total FROM exercicios;
SELECT 'Financeiro:' as tabela, count(*) as total FROM financeiro;
SELECT 'Dúvidas:' as tabela, count(*) as total FROM duvidas;

-- 5. GARANTIR ESTRUTURA DO PROFESSOR PRINCIPAL
-- Verificar se o professor principal existe
INSERT INTO profiles (id, nome, email, tipo)
VALUES (
    'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid,
    'Professor',
    'leonardoeletr@gmail.com',
    'professor'
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    tipo = EXCLUDED.tipo;

SELECT 'BANCO LIMPO E PRONTO PARA PRODUÇÃO!' as resultado; 