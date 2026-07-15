export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          cliente_id: string
          comentario: string | null
          created_at: string
          id: string
          nota: number
          produto_id: string
        }
        Insert: {
          cliente_id: string
          comentario?: string | null
          created_at?: string
          id?: string
          nota: number
          produto_id: string
        }
        Update: {
          cliente_id?: string
          comentario?: string | null
          created_at?: string
          id?: string
          nota?: number
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: string
          codigo_rastreio: string | null
          created_at: string
          desconto: number
          endereco_entrega: Json
          frete: number
          id: string
          metodo_pagamento:
            | Database["public"]["Enums"]["metodo_pagamento"]
            | null
          observacoes: string | null
          pagamento_id: string | null
          preference_id: string | null
          produtos: Json
          status: Database["public"]["Enums"]["status_pedido"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          cliente_id: string
          codigo_rastreio?: string | null
          created_at?: string
          desconto?: number
          endereco_entrega: Json
          frete?: number
          id?: string
          metodo_pagamento?:
            | Database["public"]["Enums"]["metodo_pagamento"]
            | null
          observacoes?: string | null
          pagamento_id?: string | null
          preference_id?: string | null
          produtos: Json
          status?: Database["public"]["Enums"]["status_pedido"]
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          codigo_rastreio?: string | null
          created_at?: string
          desconto?: number
          endereco_entrega?: Json
          frete?: number
          id?: string
          metodo_pagamento?:
            | Database["public"]["Enums"]["metodo_pagamento"]
            | null
          observacoes?: string | null
          pagamento_id?: string | null
          preference_id?: string | null
          produtos?: Json
          status?: Database["public"]["Enums"]["status_pedido"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria: Database["public"]["Enums"]["categoria_produto"]
          cores: string[] | null
          created_at: string
          descricao: string | null
          destaque: boolean
          estoque: number
          id: string
          imagem_url: string | null
          imagens: string[] | null
          nome: string
          ordem: number
          preco: number
          preco_promocional: number | null
          sabores: string[] | null
          slug: string | null
          tamanhos: string[] | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria: Database["public"]["Enums"]["categoria_produto"]
          cores?: string[] | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          estoque?: number
          id?: string
          imagem_url?: string | null
          imagens?: string[] | null
          nome: string
          ordem?: number
          preco: number
          preco_promocional?: number | null
          sabores?: string[] | null
          slug?: string | null
          tamanhos?: string[] | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: Database["public"]["Enums"]["categoria_produto"]
          cores?: string[] | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          estoque?: number
          id?: string
          imagem_url?: string | null
          imagens?: string[] | null
          nome?: string
          ordem?: number
          preco?: number
          preco_promocional?: number | null
          sabores?: string[] | null
          slug?: string | null
          tamanhos?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          endereco: Json | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          endereco?: Json | null
          id: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          endereco?: Json | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      uploads_estampa: {
        Row: {
          arquivo_path: string
          arquivo_tipo: string | null
          arquivo_url: string
          cliente_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["status_upload"]
          tamanho_mb: number | null
        }
        Insert: {
          arquivo_path: string
          arquivo_tipo?: string | null
          arquivo_url: string
          cliente_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["status_upload"]
          tamanho_mb?: number | null
        }
        Update: {
          arquivo_path?: string
          arquivo_tipo?: string | null
          arquivo_url?: string
          cliente_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["status_upload"]
          tamanho_mb?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cliente"
      categoria_produto: "vapes" | "estamparia" | "perfumes"
      metodo_pagamento: "pix" | "cartao" | "boleto"
      status_pedido: "pendente" | "pago" | "enviado" | "entregue" | "cancelado"
      status_upload: "pendente" | "aprovado" | "rejeitado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "cliente"],
      categoria_produto: ["vapes", "estamparia", "perfumes"],
      metodo_pagamento: ["pix", "cartao", "boleto"],
      status_pedido: ["pendente", "pago", "enviado", "entregue", "cancelado"],
      status_upload: ["pendente", "aprovado", "rejeitado"],
    },
  },
} as const
