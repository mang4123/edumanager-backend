export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alunos: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nivel: string | null
          observacoes: string | null
          professor_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id: string
          nivel?: string | null
          observacoes?: string | null
          professor_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nivel?: string | null
          observacoes?: string | null
          professor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas: {
        Row: {
          aluno_id: string
          assunto: string | null
          created_at: string
          data_hora: string
          duracao: number
          id: string
          link_reuniao: string | null
          observacoes: string | null
          professor_id: string
          status: Database["public"]["Enums"]["aula_status"]
          updated_at: string
        }
        Insert: {
          aluno_id: string
          assunto?: string | null
          created_at?: string
          data_hora: string
          duracao?: number
          id?: string
          link_reuniao?: string | null
          observacoes?: string | null
          professor_id: string
          status?: Database["public"]["Enums"]["aula_status"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          assunto?: string | null
          created_at?: string
          data_hora?: string
          duracao?: number
          id?: string
          link_reuniao?: string | null
          observacoes?: string | null
          professor_id?: string
          status?: Database["public"]["Enums"]["aula_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      convites: {
        Row: {
          aceito: boolean | null
          created_at: string
          data_aceite: string | null
          data_vencimento: string | null
          disciplina: string | null
          duracao_aula: number | null
          email: string
          expires_at: string
          id: string
          mensagem: string | null
          modalidade: string | null
          nivel: string | null
          nome: string
          observacoes: string | null
          professor_id: string
          status: Database["public"]["Enums"]["convite_status"] | null
          tipo_aula: string | null
          token: string | null
          usado_em: string | null
          valor_aula: number | null
        }
        Insert: {
          aceito?: boolean | null
          created_at?: string
          data_aceite?: string | null
          data_vencimento?: string | null
          disciplina?: string | null
          duracao_aula?: number | null
          email: string
          expires_at: string
          id?: string
          mensagem?: string | null
          modalidade?: string | null
          nivel?: string | null
          nome: string
          observacoes?: string | null
          professor_id: string
          status?: Database["public"]["Enums"]["convite_status"] | null
          tipo_aula?: string | null
          token?: string | null
          usado_em?: string | null
          valor_aula?: number | null
        }
        Update: {
          aceito?: boolean | null
          created_at?: string
          data_aceite?: string | null
          data_vencimento?: string | null
          disciplina?: string | null
          duracao_aula?: number | null
          email?: string
          expires_at?: string
          id?: string
          mensagem?: string | null
          modalidade?: string | null
          nivel?: string | null
          nome?: string
          observacoes?: string | null
          professor_id?: string
          status?: Database["public"]["Enums"]["convite_status"] | null
          tipo_aula?: string | null
          token?: string | null
          usado_em?: string | null
          valor_aula?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      duvidas: {
        Row: {
          aluno_id: string
          created_at: string
          data_resposta: string | null
          id: string
          pergunta: string
          professor_id: string
          respondida: boolean
          resposta: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_resposta?: string | null
          id?: string
          pergunta: string
          professor_id: string
          respondida?: boolean
          resposta?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_resposta?: string | null
          id?: string
          pergunta?: string
          professor_id?: string
          respondida?: boolean
          resposta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duvidas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duvidas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro: {
        Row: {
          aluno_id: string
          aula_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          id: string
          metodo_pagamento: string | null
          observacoes: string | null
          professor_id: string
          status: Database["public"]["Enums"]["pagamento_status"]
          valor: number
        }
        Insert: {
          aluno_id: string
          aula_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          professor_id: string
          status?: Database["public"]["Enums"]["pagamento_status"]
          valor: number
        }
        Update: {
          aluno_id?: string
          aula_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          professor_id?: string
          status?: Database["public"]["Enums"]["pagamento_status"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          aluno_id: string | null
          arquivo_nome: string | null
          arquivo_tamanho: number | null
          arquivo_url: string | null
          created_at: string
          descricao: string | null
          id: string
          professor_id: string
          tipo: Database["public"]["Enums"]["material_type"]
          titulo: string
        }
        Insert: {
          aluno_id?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          professor_id: string
          tipo: Database["public"]["Enums"]["material_type"]
          titulo: string
        }
        Update: {
          aluno_id?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          professor_id?: string
          tipo?: Database["public"]["Enums"]["material_type"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          area: string
          ativo: boolean
          bio: string | null
          created_at: string
          id: string
          preco_hora: number | null
        }
        Insert: {
          area: string
          ativo?: boolean
          bio?: string | null
          created_at?: string
          id: string
          preco_hora?: number | null
        }
        Update: {
          area?: string
          ativo?: boolean
          bio?: string | null
          created_at?: string
          id?: string
          preco_hora?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professores_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          especialidade: string | null
          id: string
          name: string | null
          nome: string | null
          password_hash: string | null
          professor_id: string | null
          telefone: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          especialidade?: string | null
          id: string
          name?: string | null
          nome?: string | null
          password_hash?: string | null
          professor_id?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          especialidade?: string | null
          id?: string
          name?: string | null
          nome?: string | null
          password_hash?: string | null
          professor_id?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: {
        Args: { invite_token: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      aula_status: "agendada" | "confirmada" | "realizada" | "cancelada"
      convite_status: "pendente" | "aceito" | "expirado"
      material_type: "pdf" | "link" | "imagem" | "video"
      pagamento_status: "pendente" | "pago" | "atrasado" | "cancelado"
      user_type: "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      aula_status: ["agendada", "confirmada", "realizada", "cancelada"],
      convite_status: ["pendente", "aceito", "expirado"],
      material_type: ["pdf", "link", "imagem", "video"],
      pagamento_status: ["pendente", "pago", "atrasado", "cancelado"],
      user_type: ["teacher", "student"],
    },
  },
} as const
