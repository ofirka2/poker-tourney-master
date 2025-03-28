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
        }
        Insert: {
          buy_in_amount: number
          chips_ratio: number
          created_at?: string
          id?: string
          status?: string | null
        }
        Update: {
          buy_in_amount?: number
          chips_ratio?: number
          created_at?: string
          id?: string
          status?: string | null
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
          is_house_percentage: boolean | null
          last_addon_level: number | null
          max_addons: number | null
          max_rebuys: number | null
          name: string
          no_of_players: number | null
          rebuy_amount: number
          start_date: string
          starting_chips: number
          status: string
          total_money: number | null
          updated_at: string | null
          winner: string | null
        }
        Insert: {
          addon_amount?: number
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
          is_house_percentage?: boolean | null
          last_addon_level?: number | null
          max_addons?: number | null
          max_rebuys?: number | null
          name: string
          no_of_players?: number | null
          rebuy_amount?: number
          start_date: string
          starting_chips?: number
          status?: string
          total_money?: number | null
          updated_at?: string | null
          winner?: string | null
        }
        Update: {
          addon_amount?: number
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
          is_house_percentage?: boolean | null
          last_addon_level?: number | null
          max_addons?: number | null
          max_rebuys?: number | null
          name?: string
          no_of_players?: number | null
          rebuy_amount?: number
          start_date?: string
          starting_chips?: number
          status?: string
          total_money?: number | null
          updated_at?: string | null
          winner?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
