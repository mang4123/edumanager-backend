
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import type { Aula } from '@/types/agenda';

interface AgendaCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  aulas: Aula[];
  children: React.ReactNode;
}

export const AgendaCalendar = ({ selectedDate, onDateSelect, aulas, children }: AgendaCalendarProps) => {
  const aulasDoMes = aulas.filter(aula => {
    const aulaDate = new Date(aula.data_hora);
    return aulaDate.getMonth() === selectedDate.getMonth() && 
           aulaDate.getFullYear() === selectedDate.getFullYear();
  });

  const diasComAulas = aulasDoMes.map(aula => new Date(aula.data_hora));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Calendário</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Marcar Aula
              </Button>
            </DialogTrigger>
            {children}
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          locale={ptBR}
          modifiers={{
            hasClass: diasComAulas
          }}
          modifiersStyles={{
            hasClass: { backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%' }
          }}
        />
      </CardContent>
    </Card>
  );
};
