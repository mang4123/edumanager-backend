import { supabaseAdmin } from '../config/supabase';

export async function syncTeacherProfiles() {
  try {
    console.log('🔄 Iniciando sincronização de perfis de professores...');

    // 1. Buscar todos os usuários do Supabase Auth que são professores
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Erro ao buscar usuários: ${authError.message}`);
    }

    const teachers = authUsers.users.filter(user => 
      user.user_metadata?.user_type === 'teacher' || 
      !user.user_metadata?.user_type // assume professor se não especificado
    );

    console.log(`📊 Encontrados ${teachers.length} professores para sincronizar`);

    // 2. Para cada professor, criar/atualizar perfil
    for (const teacher of teachers) {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', teacher.id)
        .single();

      if (!existingProfile) {
        console.log(`➕ Criando perfil para professor: ${teacher.email}`);
        
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: teacher.id,
            nome: teacher.user_metadata?.name || teacher.email?.split('@')[0] || 'Professor',
            email: teacher.email,
            tipo: 'professor',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`❌ Erro ao criar perfil para ${teacher.email}:`, insertError);
        } else {
          console.log(`✅ Perfil criado com sucesso para ${teacher.email}`);
        }
      } else {
        console.log(`✅ Perfil já existe para: ${teacher.email}`);
      }
    }

    console.log('✅ Sincronização concluída com sucesso!');
    return { success: true, teachersProcessed: teachers.length };

  } catch (error) {
    console.error('💥 Erro na sincronização:', error);
    return { success: false, error };
  }
} 