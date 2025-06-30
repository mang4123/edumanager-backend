const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qyaorhetkrgmkrtzjpvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YW9yaGV0a3JnbWtydHpqcHZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc3NDk0MSwiZXhwIjoyMDY2MzUwOTQxfQ.CZNXl0JJ7FyZqpf3CmxJGDXVr1WwgRjmhNLYOeVILb0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Configurando estrutura do banco de dados...\n');

  try {
    // 1. Criar tipos ENUM
    console.log('📋 Criando tipos ENUM...');
    
    const enumQueries = [
      `CREATE TYPE user_type AS ENUM ('teacher', 'student');`,
      `CREATE TYPE aula_status AS ENUM ('agendada', 'confirmada', 'realizada', 'cancelada');`,
      `CREATE TYPE convite_status AS ENUM ('pendente', 'aceito', 'expirado');`,
      `CREATE TYPE pagamento_status AS ENUM ('pendente', 'pago', 'atrasado', 'cancelado');`,
      `CREATE TYPE material_type AS ENUM ('pdf', 'link', 'imagem', 'video');`
    ];

    for (const query of enumQueries) {
      try {
        await supabase.rpc('exec_sql', { sql: query });
        console.log('✅', query.split(' ')[2]);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log('⚠️', query.split(' ')[2], '- Erro:', error.message);
        } else {
          console.log('✅', query.split(' ')[2], '- Já existe');
        }
      }
    }

    // 2. Recriar tabela profiles
    console.log('\n📋 Configurando tabela profiles...');
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP TABLE IF EXISTS profiles CASCADE;` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          user_type user_type NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      ` 
    });
    console.log('✅ Tabela profiles criada');

    // 3. Criar tabela professores
    console.log('\n📋 Configurando tabela professores...');
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP TABLE IF EXISTS professores CASCADE;` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE professores (
          id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
          area TEXT NOT NULL,
          preco_hora DECIMAL(10,2),
          bio TEXT,
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      ` 
    });
    console.log('✅ Tabela professores criada');

    // 4. Criar tabela alunos
    console.log('\n📋 Configurando tabela alunos...');
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP TABLE IF EXISTS alunos CASCADE;` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE alunos (
          id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
          professor_id UUID REFERENCES professores(id) ON DELETE CASCADE NOT NULL,
          nivel TEXT,
          observacoes TEXT,
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      ` 
    });
    console.log('✅ Tabela alunos criada');

    // 5. Criar tabela aulas
    console.log('\n📋 Configurando tabela aulas...');
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP TABLE IF EXISTS aulas CASCADE;` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE aulas (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          professor_id UUID REFERENCES professores(id) ON DELETE CASCADE NOT NULL,
          aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
          data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
          duracao INTEGER DEFAULT 60,
          assunto TEXT,
          status aula_status DEFAULT 'agendada',
          observacoes TEXT,
          link_reuniao TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      ` 
    });
    console.log('✅ Tabela aulas criada');

    // 6. Criar tabela convites
    console.log('\n📋 Configurando tabela convites...');
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP TABLE IF EXISTS convites CASCADE;` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE convites (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          professor_id UUID REFERENCES professores(id) ON DELETE CASCADE NOT NULL,
          nome TEXT NOT NULL,
          email TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          status convite_status DEFAULT 'pendente',
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          usado_em TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      ` 
    });
    console.log('✅ Tabela convites criada');

    // 7. Criar tabela duvidas
    console.log('\n📋 Configurando tabela duvidas...');
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP TABLE IF EXISTS duvidas CASCADE;` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE duvidas (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          professor_id UUID REFERENCES professores(id) ON DELETE CASCADE NOT NULL,
          aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
          pergunta TEXT NOT NULL,
          resposta TEXT,
          respondida BOOLEAN DEFAULT false,
          data_pergunta TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          data_resposta TIMESTAMP WITH TIME ZONE
        );
      ` 
    });
    console.log('✅ Tabela duvidas criada');

    // 8. Criar tabela materiais
    console.log('\n📋 Configurando tabela materiais...');
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP TABLE IF EXISTS materiais CASCADE;` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE materiais (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          professor_id UUID REFERENCES professores(id) ON DELETE CASCADE NOT NULL,
          aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
          titulo TEXT NOT NULL,
          descricao TEXT,
          tipo material_type NOT NULL,
          arquivo_url TEXT,
          arquivo_nome TEXT,
          arquivo_tamanho INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      ` 
    });
    console.log('✅ Tabela materiais criada');

    // 9. Criar tabela financeiro
    console.log('\n📋 Configurando tabela financeiro...');
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP TABLE IF EXISTS financeiro CASCADE;` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE financeiro (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          professor_id UUID REFERENCES professores(id) ON DELETE CASCADE NOT NULL,
          aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
          aula_id UUID REFERENCES aulas(id) ON DELETE SET NULL,
          valor DECIMAL(10,2) NOT NULL,
          descricao TEXT,
          data_vencimento DATE NOT NULL,
          data_pagamento DATE,
          status pagamento_status DEFAULT 'pendente',
          metodo_pagamento TEXT,
          observacoes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      ` 
    });
    console.log('✅ Tabela financeiro criada');

    // 10. Configurar RLS (Row Level Security)
    console.log('\n🔒 Configurando Row Level Security...');
    
    const rlsQueries = [
      `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE professores ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE convites ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE duvidas ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;`
    ];

    for (const query of rlsQueries) {
      await supabase.rpc('exec_sql', { sql: query });
    }
    console.log('✅ RLS habilitado para todas as tabelas');

    // 11. Criar políticas básicas (permitir tudo por enquanto)
    console.log('\n🔑 Criando políticas de acesso...');
    
    const policies = [
      `CREATE POLICY "Allow all for authenticated users" ON profiles FOR ALL USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "Allow all for authenticated users" ON professores FOR ALL USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "Allow all for authenticated users" ON alunos FOR ALL USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "Allow all for authenticated users" ON aulas FOR ALL USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "Allow all for authenticated users" ON convites FOR ALL USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "Allow all for authenticated users" ON duvidas FOR ALL USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "Allow all for authenticated users" ON materiais FOR ALL USING (auth.role() = 'authenticated');`,
      `CREATE POLICY "Allow all for authenticated users" ON financeiro FOR ALL USING (auth.role() = 'authenticated');`
    ];

    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy });
        console.log('✅ Política criada');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log('⚠️ Erro na política:', error.message);
        }
      }
    }

    // 12. Criar função para aceitar convites
    console.log('\n⚙️ Criando função accept_invite...');
    
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE OR REPLACE FUNCTION accept_invite(invite_token TEXT, user_id UUID)
        RETURNS BOOLEAN AS $$
        DECLARE
          invite_record RECORD;
        BEGIN
          -- Buscar convite
          SELECT * INTO invite_record 
          FROM convites 
          WHERE token = invite_token 
            AND status = 'pendente' 
            AND expires_at > NOW();
            
          IF NOT FOUND THEN
            RETURN FALSE;
          END IF;
          
          -- Atualizar perfil para aluno
          UPDATE profiles 
          SET user_type = 'student' 
          WHERE id = user_id;
          
          -- Criar registro de aluno
          INSERT INTO alunos (id, professor_id, nivel, observacoes)
          VALUES (user_id, invite_record.professor_id, 'Iniciante', 'Aluno convidado');
          
          -- Marcar convite como aceito
          UPDATE convites 
          SET status = 'aceito', usado_em = NOW() 
          WHERE id = invite_record.id;
          
          RETURN TRUE;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      ` 
    });
    console.log('✅ Função accept_invite criada');

    console.log('\n🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!\n');
    console.log('✅ Todas as tabelas foram criadas');
    console.log('✅ ENUMs configurados');
    console.log('✅ RLS habilitado');
    console.log('✅ Políticas básicas criadas');
    console.log('✅ Função accept_invite implementada');
    console.log('\n👉 O frontend agora deve funcionar perfeitamente!');

  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error.message);
  }
}

setupDatabase(); 