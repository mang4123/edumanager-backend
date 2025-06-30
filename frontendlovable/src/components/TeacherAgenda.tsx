
import { useState } from 'react';
import { AgendaCalendar } from './agenda/AgendaCalendar';
import { ClassForm } from './agenda/ClassForm';
import { ClassList } from './agenda/ClassList';
import { useTeacherAgenda } from '@/hooks/useTeacherAgenda';

const TeacherAgenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    aulas,
    alunos,
    loading,
    newAula,
    setNewAula,
    handleCreateAula,
    handleDeleteAula
  } = useTeacherAgenda();

  const handleFormSubmit = async () => {
    const success = await handleCreateAula();
    if (success) {
      setIsDialogOpen(false);
    }
    return success;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AgendaCalendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        aulas={aulas}
      >
        <ClassForm
          newAula={newAula}
          setNewAula={setNewAula}
          alunos={alunos}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => setIsDialogOpen(false)}
        />
      </AgendaCalendar>

      <ClassList
        selectedDate={selectedDate}
        aulas={aulas}
        onDeleteClass={handleDeleteAula}
      />
    </div>
  );
};

export default TeacherAgenda;
