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
      blinds_levels: {
        Row: {
          ante: number | null
          big_blind: number
          created_at: string | null
          duration_minutes: number
          id: string
          is_break: boolean | null
          level_index: number
          small_blind: number
          tournament_id: string
          updated_at: string | null
        }
        Insert: {
          ante?: number | null
          big_blind: number
          created_at?: string | null
          duration_minutes: number
          id?: string
          is_break?: boolean | null
          level_index: number
          small_blind: number
          tournament_id: string
          updated_at?: string | null
        }
        Update: {
          ante?: number | null
          big_blind?: number
          created_at?: string | null
          duration_minutes?: number
          id?: string
          is_break?: boolean | null
          level_index?: number
          small_blind?: number
          tournament_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blinds_levels_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          buy_ins: number | null
          chips: number | null
          created_at: string
          final_profit: number | null
          game_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          buy_ins?: number | null
          chips?: number | null
          created_at?: string
          final_profit?: number | null
          game_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          buy_ins?: number | null
          chips?: number | null
          created_at?: string
          final_profit?: number | null
          game_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          buy_in_amount: number
          chips_ratio: number
          created_at: string
          id: string
          status: string | null
          type: string | null
        }
        Insert: {
          buy_in_amount: number
          chips_ratio: number
          created_at?: string
          id?: string
          status?: string | null
          type?: string | null
        }
        Update: {
          buy_in_amount?: number
          chips_ratio?: number
          created_at?: string
          id?: string
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      money_transfers: {
        Row: {
          amount: number
          created_at: string
          from_user_id: string | null
          game_id: string | null
          id: string
          to_user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          from_user_id?: string | null
          game_id?: string | null
          id?: string
          to_user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          from_user_id?: string | null
          game_id?: string | null
          id?: string
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "money_transfers_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_transfers_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_transfers_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_statistics: {
        Row: {
          created_at: string
          games_played: number | null
          id: string
          period_date: string
          period_type: string | null
          total_profit: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          games_played?: number | null
          id?: string
          period_date: string
          period_type?: string | null
          total_profit?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          games_played?: number | null
          id?: string
          period_date?: string
          period_type?: string | null
          total_profit?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          addons: number
          buy_ins: number
          created_at: string | null
          current_chips: number | null
          email: string | null
          finish_position: number | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          rebuys: number
          seat_number: number | null
          starting_position: number | null
          status: string
          table_id: string | null
          tournament_id: string
          updated_at: string | null
        }
        Insert: {
          addons?: number
          buy_ins?: number
          created_at?: string | null
          current_chips?: number | null
          email?: string | null
          finish_position?: number | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          rebuys?: number
          seat_number?: number | null
          starting_position?: number | null
          status?: string
          table_id?: string | null
          tournament_id: string
          updated_at?: string | null
        }
        Update: {
          addons?: number
          buy_ins?: number
          created_at?: string | null
          current_chips?: number | null
          email?: string | null
          finish_position?: number | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          rebuys?: number
          seat_number?: number | null
          starting_position?: number | null
          status?: string
          table_id?: string | null
          tournament_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biggest_loss: number | null
          biggest_win: number | null
          created_at: string
          id: string
          total_games: number | null
          total_profit: number | null
          username: string | null
          win_rate: number | null
        }
        Insert: {
          avatar_url?: string | null
          biggest_loss?: number | null
          biggest_win?: number | null
          created_at?: string
          id: string
          total_games?: number | null
          total_profit?: number | null
          username?: string | null
          win_rate?: number | null
        }
        Update: {
          avatar_url?: string | null
          biggest_loss?: number | null
          biggest_win?: number | null
          created_at?: string
          id?: string
          total_games?: number | null
          total_profit?: number | null
          username?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      tables: {
        Row: {
          created_at: string | null
          current_big_blind: number | null
          current_level: number | null
          current_small_blind: number | null
          dealer_name: string | null
          id: string
          max_seats: number
          status: string
          table_number: number
          tournament_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_big_blind?: number | null
          current_level?: number | null
          current_small_blind?: number | null
          dealer_name?: string | null
          id?: string
          max_seats?: number
          status?: string
          table_number: number
          tournament_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_big_blind?: number | null
          current_level?: number | null
          current_small_blind?: number | null
          dealer_name?: string | null
          id?: string
          max_seats?: number
          status?: string
          table_number?: number
          tournament_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          addon_amount: number
          addon_chips: number | null
          allow_addon: boolean | null
          allow_rebuy: boolean | null
          ast_rebuy_level: number | null
          blind_levels: Json | null
          buy_in: number
          chipset: string | null
          created_at: string | null
          desired_duration: number | null
          end_date: string | null
          format: string | null
          house_payment: number | null
          house_rake: number | null
          id: string
          include_ante: boolean | null
          is_house_percentage: boolean | null
          last_addon_level: number | null
          last_rebuy_level: number | null
          max_addons: number | null
          max_rebuys: number | null
          name: string
          no_of_players: number | null
          payout_structure: Json | null
          rebuy_amount: number
          rebuy_chips: number | null
          start_date: string
          starting_chips: number
          status: string
          total_money: number | null
          updated_at: string | null
          user_id: string | null
          winner: string | null
        }
        Insert: {
          addon_amount?: number
          addon_chips?: number | null
          allow_addon?: boolean | null
          allow_rebuy?: boolean | null
          ast_rebuy_level?: number | null
          blind_levels?: Json | null
          buy_in?: number
          chipset?: string | null
          created_at?: string | null
          desired_duration?: number | null
          end_date?: string | null
          format?: string | null
          house_payment?: number | null
          house_rake?: number | null
          id?: string
          include_ante?: boolean | null
          is_house_percentage?: boolean | null
          last_addon_level?: number | null
          last_rebuy_level?: number | null
          max_addons?: number | null
          max_rebuys?: number | null
          name: string
          no_of_players?: number | null
          payout_structure?: Json | null
          rebuy_amount?: number
          rebuy_chips?: number | null
          start_date: string
          starting_chips?: number
          status?: string
          total_money?: number | null
          updated_at?: string | null
          user_id?: string | null
          winner?: string | null
        }
        Update: {
          addon_amount?: number
          addon_chips?: number | null
          allow_addon?: boolean | null
          allow_rebuy?: boolean | null
          ast_rebuy_level?: number | null
          blind_levels?: Json | null
          buy_in?: number
          chipset?: string | null
          created_at?: string | null
          desired_duration?: number | null
          end_date?: string | null
          format?: string | null
          house_payment?: number | null
          house_rake?: number | null
          id?: string
          include_ante?: boolean | null
          is_house_percentage?: boolean | null
          last_addon_level?: number | null
          last_rebuy_level?: number | null
          max_addons?: number | null
          max_rebuys?: number | null
          name?: string
          no_of_players?: number | null
          payout_structure?: Json | null
          rebuy_amount?: number
          rebuy_chips?: number | null
          start_date?: string
          starting_chips?: number
          status?: string
          total_money?: number | null
          updated_at?: string | null
          user_id?: string | null
          winner?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
