
export interface Aula {
  id: string;
  aluno_id: string;
  data_hora: string;
  duracao: number;
  assunto: string;
  status: string;
  observacoes?: string;
  aluno?: {
    profiles: {
      name: string;
    }[];
  };
}

export interface Aluno {
  id: string;
  profiles: {
    name: string;
  }[];
}

export interface NewAula {
  aluno_id: string;
  data: string;
  hora: string;
  duracao: number;
  assunto: string;
  observacoes: string;
}
