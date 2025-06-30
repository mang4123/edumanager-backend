import express from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Listar exercícios do professor
router.get('/exercicios', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id;

        const { data: exercicios, error } = await supabaseAdmin
            .from('exercicios')
            .select('*')
            .eq('professor_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: exercicios || []
        });

    } catch (error: any) {
        console.error('Erro ao buscar exercícios:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Criar novo exercício
router.post('/exercicios', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id;
        const { titulo, descricao, tipo, anexo_url } = req.body;

        if (!titulo) {
            return res.status(400).json({
                success: false,
                message: 'Título é obrigatório'
            });
        }

        const { data: exercicio, error } = await supabaseAdmin
            .from('exercicios')
            .insert({
                professor_id: userId,
                titulo,
                descricao,
                tipo,
                anexo_url
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Exercício criado com sucesso!',
            data: exercicio
        });

    } catch (error: any) {
        console.error('Erro ao criar exercício:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Atualizar exercício
router.put('/exercicios/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { titulo, descricao, tipo, anexo_url } = req.body;

        const { data: exercicio, error } = await supabaseAdmin
            .from('exercicios')
            .update({
                titulo,
                descricao,
                tipo,
                anexo_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('professor_id', userId)
            .select()
            .single();

        if (error) throw error;

        if (!exercicio) {
            return res.status(404).json({
                success: false,
                message: 'Exercício não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Exercício atualizado com sucesso!',
            data: exercicio
        });

    } catch (error: any) {
        console.error('Erro ao atualizar exercício:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Deletar exercício
router.delete('/exercicios/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('exercicios')
            .delete()
            .eq('id', id)
            .eq('professor_id', userId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Exercício deletado com sucesso!'
        });

    } catch (error: any) {
        console.error('Erro ao deletar exercício:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Rota para inicializar tabela exercicios (apenas para setup)
router.post('/setup-table', async (req, res) => {
    try {
        console.log('🔧 Iniciando setup da tabela exercicios...');

        // Verificar se tabela já existe
        const { data: existing, error: checkError } = await supabaseAdmin
            .from('exercicios')
            .select('id')
            .limit(1);

        if (!checkError) {
            return res.json({
                success: true,
                message: 'Tabela exercicios já existe e está funcionando!'
            });
        }

        // Se chegou aqui, tabela não existe - criar via SQL
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS exercicios (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                titulo VARCHAR(255) NOT NULL,
                descricao TEXT,
                tipo VARCHAR(50),
                anexo_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_exercicios_professor_id ON exercicios(professor_id);
            
            ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Professores podem gerenciar próprios exercícios" ON exercicios
                FOR ALL USING (professor_id = 'e650f5ee-747b-4574-9bfa-8e2d411c4974'::uuid);
        `;

        const { error: createError } = await supabaseAdmin.rpc('exec_sql', { 
            sql: createTableSQL 
        });

        if (createError) {
            console.error('Erro ao criar tabela:', createError);
            throw createError;
        }

        res.json({
            success: true,
            message: 'Tabela exercicios criada com sucesso!'
        });

    } catch (error: any) {
        console.error('Erro no setup:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao configurar tabela',
            error: error.message
        });
    }
});

export default router; 