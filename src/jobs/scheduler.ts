import { syncTeacherProfiles } from './sync-teacher-profiles';

// Intervalo de sincronização (5 minutos)
const SYNC_INTERVAL = 5 * 60 * 1000;

export function startJobScheduler() {
  console.log('🚀 Iniciando scheduler de jobs...');

  // Executar imediatamente na primeira vez
  syncTeacherProfiles().catch(error => {
    console.error('❌ Erro na primeira sincronização:', error);
  });

  // Agendar execuções periódicas
  setInterval(async () => {
    try {
      await syncTeacherProfiles();
    } catch (error) {
      console.error('❌ Erro na sincronização agendada:', error);
    }
  }, SYNC_INTERVAL);

  console.log(`✅ Scheduler iniciado! Próxima sincronização em ${SYNC_INTERVAL/1000} segundos`);
} 