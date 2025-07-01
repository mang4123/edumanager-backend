import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Trash2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Aula } from '@/types/agenda';

interface ClassListProps {
  selectedDate: Date;
  aulas: Aula[];
  onDeleteClass: (aulaId: string) => void;
}

export const ClassList = ({ selectedDate, aulas, onDeleteClass }: ClassListProps) => {
  const aulasDoDia = (aulas || []).filter(aula => 
    isSameDay(new Date(aula.data_hora), selectedDate)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Aulas de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {aulasDoDia.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma aula agendada para este dia</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aulasDoDia.map((aula) => (
              <div key={aula.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-primary-600" />
                      <span className="font-medium">
                        {aula.aluno_profile?.nome || 'Aluno não encontrado'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(aula.data_hora), 'HH:mm')}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{aula.assunto}</p>
                    <p className="text-sm text-gray-500">
                      Duração: {aula.duracao} minutos
                    </p>
                    {aula.observacoes && (
                      <p className="text-sm text-gray-600 mt-1">{aula.observacoes}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteClass(aula.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};