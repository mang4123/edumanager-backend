
export interface Aula {
  id: string;
  aluno_id: string;
  data_hora: string;
  duracao: number;
  assunto: string;
  status: string;
  observacoes?: string;
  aluno_profile?: {
    nome: string;
    email: string;
  };
}

export interface Aluno {
  id: string;
  aluno_id: string;
  ativo: boolean;
  aluno_profile?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface NewAula {
  aluno_id: string;
  data: string;
  hora: string;
  duracao: number;
  assunto: string;
  observacoes: string;
}
