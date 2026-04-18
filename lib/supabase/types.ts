export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      os_activity: {
        Row: { action: string; category: string; created_at: string | null; detail: string | null; id: string; is_red_flag: boolean | null; metadata: Json | null; project_id: string | null; project_name: string | null; user_id: string | null; user_name: string | null; user_role: string | null }
        Insert: { action: string; category: string; created_at?: string | null; detail?: string | null; id?: string; is_red_flag?: boolean | null; metadata?: Json | null; project_id?: string | null; project_name?: string | null; user_id?: string | null; user_name?: string | null; user_role?: string | null }
        Update: { action?: string; category?: string; created_at?: string | null; detail?: string | null; id?: string; is_red_flag?: boolean | null; metadata?: Json | null; project_id?: string | null; project_name?: string | null; user_id?: string | null; user_name?: string | null; user_role?: string | null }
        Relationships: []
      }
      os_channels: {
        Row: { created_at: string | null; id: string; is_archived: boolean | null; last_message_at: string | null; members: string[] | null; name: string; project_id: string | null; type: string }
        Insert: { created_at?: string | null; id?: string; is_archived?: boolean | null; last_message_at?: string | null; members?: string[] | null; name: string; project_id?: string | null; type: string }
        Update: { created_at?: string | null; id?: string; is_archived?: boolean | null; last_message_at?: string | null; members?: string[] | null; name?: string; project_id?: string | null; type?: string }
        Relationships: []
      }
      os_contracts: {
        Row: { created_at: string | null; document_text: string | null; executed_at: string | null; expires_at: string | null; id: string; project_id: string | null; project_name: string | null; recipient_id: string | null; recipient_name: string; sent_at: string | null; status: string; storage_path: string | null; type: string; updated_at: string | null }
        Insert: { created_at?: string | null; document_text?: string | null; executed_at?: string | null; expires_at?: string | null; id?: string; project_id?: string | null; project_name?: string | null; recipient_id?: string | null; recipient_name: string; sent_at?: string | null; status?: string; storage_path?: string | null; type: string; updated_at?: string | null }
        Update: { created_at?: string | null; document_text?: string | null; executed_at?: string | null; expires_at?: string | null; id?: string; project_id?: string | null; project_name?: string | null; recipient_id?: string | null; recipient_name?: string; sent_at?: string | null; status?: string; storage_path?: string | null; type?: string; updated_at?: string | null }
        Relationships: []
      }
      os_email_log: {
        Row: { clicked_at: string | null; created_at: string | null; error_message: string | null; id: string; opened_at: string | null; related_id: string | null; related_type: string | null; resend_id: string | null; status: string; subject: string | null; to_email: string; to_name: string | null; type: string }
        Insert: { clicked_at?: string | null; created_at?: string | null; error_message?: string | null; id?: string; opened_at?: string | null; related_id?: string | null; related_type?: string | null; resend_id?: string | null; status?: string; subject?: string | null; to_email: string; to_name?: string | null; type: string }
        Update: { clicked_at?: string | null; created_at?: string | null; error_message?: string | null; id?: string; opened_at?: string | null; related_id?: string | null; related_type?: string | null; resend_id?: string | null; status?: string; subject?: string | null; to_email?: string; to_name?: string | null; type?: string }
        Relationships: []
      }
      os_enquiries: {
        Row: { budget: string | null; company: string | null; created_at: string | null; email: string; id: string; lead_id: string | null; message: string | null; name: string; project_type: string | null; source: string | null; status: string; updated_at: string | null }
        Insert: { budget?: string | null; company?: string | null; created_at?: string | null; email: string; id?: string; lead_id?: string | null; message?: string | null; name: string; project_type?: string | null; source?: string | null; status?: string; updated_at?: string | null }
        Update: { budget?: string | null; company?: string | null; created_at?: string | null; email?: string; id?: string; lead_id?: string | null; message?: string | null; name?: string; project_type?: string | null; source?: string | null; status?: string; updated_at?: string | null }
        Relationships: []
      }
      os_equipment: {
        Row: { checked_out_project: string | null; checked_out_to: string | null; condition: string; created_at: string | null; expected_return: string | null; id: string; is_verified: boolean | null; name: string; owner: string | null; purchase_date: string | null; serial_number: string | null; status: string; type: string; updated_at: string | null; value: number | null }
        Insert: { checked_out_project?: string | null; checked_out_to?: string | null; condition?: string; created_at?: string | null; expected_return?: string | null; id?: string; is_verified?: boolean | null; name: string; owner?: string | null; purchase_date?: string | null; serial_number?: string | null; status?: string; type: string; updated_at?: string | null; value?: number | null }
        Update: { checked_out_project?: string | null; checked_out_to?: string | null; condition?: string; created_at?: string | null; expected_return?: string | null; id?: string; is_verified?: boolean | null; name?: string; owner?: string | null; purchase_date?: string | null; serial_number?: string | null; status?: string; type?: string; updated_at?: string | null; value?: number | null }
        Relationships: []
      }
      os_invites: {
        Row: { accepted_at: string | null; created_at: string | null; email: string; expires_at: string | null; id: string; invited_by: string | null; name: string | null; project_id: string | null; role: string; status: string; token: string | null }
        Insert: { accepted_at?: string | null; created_at?: string | null; email: string; expires_at?: string | null; id?: string; invited_by?: string | null; name?: string | null; project_id?: string | null; role: string; status?: string; token?: string | null }
        Update: { accepted_at?: string | null; created_at?: string | null; email?: string; expires_at?: string | null; id?: string; invited_by?: string | null; name?: string | null; project_id?: string | null; role?: string; status?: string; token?: string | null }
        Relationships: []
      }
      os_leads: {
        Row: { company_name: string | null; contact_name: string; created_at: string | null; email: string; enquiry_id: string | null; estimated_budget: number | null; id: string; is_spam_flag: boolean | null; last_activity_at: string | null; notes: string | null; project_type: string | null; score: number | null; source: string | null; stage: string; temperature: string | null; updated_at: string | null }
        Insert: { company_name?: string | null; contact_name: string; created_at?: string | null; email: string; enquiry_id?: string | null; estimated_budget?: number | null; id?: string; is_spam_flag?: boolean | null; last_activity_at?: string | null; notes?: string | null; project_type?: string | null; score?: number | null; source?: string | null; stage?: string; temperature?: string | null; updated_at?: string | null }
        Update: { company_name?: string | null; contact_name?: string; created_at?: string | null; email?: string; enquiry_id?: string | null; estimated_budget?: number | null; id?: string; is_spam_flag?: boolean | null; last_activity_at?: string | null; notes?: string | null; project_type?: string | null; score?: number | null; source?: string | null; stage?: string; temperature?: string | null; updated_at?: string | null }
        Relationships: []
      }
      os_messages: {
        Row: { attachments: Json | null; channel_id: string; content: string; created_at: string | null; edited_at: string | null; id: string; is_action_required: boolean | null; is_pinned: boolean | null; sender_id: string; sender_name: string | null; sender_role: string | null }
        Insert: { attachments?: Json | null; channel_id: string; content: string; created_at?: string | null; edited_at?: string | null; id?: string; is_action_required?: boolean | null; is_pinned?: boolean | null; sender_id: string; sender_name?: string | null; sender_role?: string | null }
        Update: { attachments?: Json | null; channel_id?: string; content?: string; created_at?: string | null; edited_at?: string | null; id?: string; is_action_required?: boolean | null; is_pinned?: boolean | null; sender_id?: string; sender_name?: string | null; sender_role?: string | null }
        Relationships: []
      }
      os_milestones: {
        Row: { assigned_to: string[] | null; created_at: string | null; dependencies: string[] | null; display_order: number | null; end_date: string | null; id: string; is_client_visible: boolean | null; name: string; notes: string | null; payout: number | null; progress: number | null; project_id: string; start_date: string | null; status: string; updated_at: string | null }
        Insert: { assigned_to?: string[] | null; created_at?: string | null; dependencies?: string[] | null; display_order?: number | null; end_date?: string | null; id?: string; is_client_visible?: boolean | null; name: string; notes?: string | null; payout?: number | null; progress?: number | null; project_id: string; start_date?: string | null; status?: string; updated_at?: string | null }
        Update: { assigned_to?: string[] | null; created_at?: string | null; dependencies?: string[] | null; display_order?: number | null; end_date?: string | null; id?: string; is_client_visible?: boolean | null; name?: string; notes?: string | null; payout?: number | null; progress?: number | null; project_id?: string; start_date?: string | null; status?: string; updated_at?: string | null }
        Relationships: []
      }
      os_nudges: {
        Row: { created_at: string | null; email_id: string | null; id: string; level: number; message: string; project_id: string | null; project_name: string | null; recipient_email: string | null; recipient_id: string | null; recipient_name: string | null; responded_at: string | null; sent_at: string | null; status: string; trigger_type: string; updated_at: string | null }
        Insert: { created_at?: string | null; email_id?: string | null; id?: string; level?: number; message: string; project_id?: string | null; project_name?: string | null; recipient_email?: string | null; recipient_id?: string | null; recipient_name?: string | null; responded_at?: string | null; sent_at?: string | null; status?: string; trigger_type: string; updated_at?: string | null }
        Update: { created_at?: string | null; email_id?: string | null; id?: string; level?: number; message?: string; project_id?: string | null; project_name?: string | null; recipient_email?: string | null; recipient_id?: string | null; recipient_name?: string | null; responded_at?: string | null; sent_at?: string | null; status?: string; trigger_type?: string; updated_at?: string | null }
        Relationships: []
      }
      os_payouts: {
        Row: { allocation_type: string; amount: number; created_at: string | null; id: string; milestone_id: string | null; notes: string | null; paid_at: string | null; percentage: number | null; project_id: string | null; role: string | null; status: string; transaction_id: string | null; user_id: string; user_name: string | null }
        Insert: { allocation_type: string; amount: number; created_at?: string | null; id?: string; milestone_id?: string | null; notes?: string | null; paid_at?: string | null; percentage?: number | null; project_id?: string | null; role?: string | null; status?: string; transaction_id?: string | null; user_id: string; user_name?: string | null }
        Update: { allocation_type?: string; amount?: number; created_at?: string | null; id?: string; milestone_id?: string | null; notes?: string | null; paid_at?: string | null; percentage?: number | null; project_id?: string | null; role?: string | null; status?: string; transaction_id?: string | null; user_id?: string; user_name?: string | null }
        Relationships: []
      }
      os_permissions: {
        Row: { action: string; granted: boolean; id: string; resource: string; role: string; updated_at: string | null; updated_by: string | null }
        Insert: { action: string; granted?: boolean; id?: string; resource: string; role: string; updated_at?: string | null; updated_by?: string | null }
        Update: { action?: string; granted?: boolean; id?: string; resource?: string; role?: string; updated_at?: string | null; updated_by?: string | null }
        Relationships: []
      }
      os_projects: {
        Row: { assigned_team: string[] | null; brief: string | null; client_id: string | null; client_name: string; completion_percent: number | null; created_at: string | null; end_date: string | null; health_status: string | null; id: string; name: string; paid_to_date: number | null; start_date: string | null; status: string; tags: string[] | null; total_value: number | null; type: string; updated_at: string | null; vault_folder: string | null }
        Insert: { assigned_team?: string[] | null; brief?: string | null; client_id?: string | null; client_name: string; completion_percent?: number | null; created_at?: string | null; end_date?: string | null; health_status?: string | null; id?: string; name: string; paid_to_date?: number | null; start_date?: string | null; status?: string; tags?: string[] | null; total_value?: number | null; type: string; updated_at?: string | null; vault_folder?: string | null }
        Update: { assigned_team?: string[] | null; brief?: string | null; client_id?: string | null; client_name?: string; completion_percent?: number | null; created_at?: string | null; end_date?: string | null; health_status?: string | null; id?: string; name?: string; paid_to_date?: number | null; start_date?: string | null; status?: string; tags?: string[] | null; total_value?: number | null; type?: string; updated_at?: string | null; vault_folder?: string | null }
        Relationships: []
      }
      os_quotes: {
        Row: { client_company: string | null; client_email: string | null; client_name: string | null; created_at: string | null; discount: number | null; id: string; line_items: Json; notes: string | null; pdf_path: string | null; project_type: string | null; resend_email_id: string | null; sent_at: string | null; status: string; tax: number | null; template_id: string | null; updated_at: string | null; valid_until: string | null }
        Insert: { client_company?: string | null; client_email?: string | null; client_name?: string | null; created_at?: string | null; discount?: number | null; id?: string; line_items?: Json; notes?: string | null; pdf_path?: string | null; project_type?: string | null; resend_email_id?: string | null; sent_at?: string | null; status?: string; tax?: number | null; template_id?: string | null; updated_at?: string | null; valid_until?: string | null }
        Update: { client_company?: string | null; client_email?: string | null; client_name?: string | null; created_at?: string | null; discount?: number | null; id?: string; line_items?: Json; notes?: string | null; pdf_path?: string | null; project_type?: string | null; resend_email_id?: string | null; sent_at?: string | null; status?: string; tax?: number | null; template_id?: string | null; updated_at?: string | null; valid_until?: string | null }
        Relationships: []
      }
      os_transactions: {
        Row: { amount: number; created_at: string | null; date: string; description: string | null; entity: string; entity_id: string | null; id: string; invoice_id: string | null; is_flagged: boolean | null; is_reconciled: boolean | null; project_id: string | null; project_name: string | null; status: string; type: string }
        Insert: { amount: number; created_at?: string | null; date?: string; description?: string | null; entity: string; entity_id?: string | null; id?: string; invoice_id?: string | null; is_flagged?: boolean | null; is_reconciled?: boolean | null; project_id?: string | null; project_name?: string | null; status?: string; type: string }
        Update: { amount?: number; created_at?: string | null; date?: string; description?: string | null; entity?: string; entity_id?: string | null; id?: string; invoice_id?: string | null; is_flagged?: boolean | null; is_reconciled?: boolean | null; project_id?: string | null; project_name?: string | null; status?: string; type?: string }
        Relationships: []
      }
      os_users: {
        Row: { avatar_url: string | null; company: string | null; created_at: string | null; current_load: number | null; email: string; id: string; is_onboarded: boolean | null; joined_at: string | null; name: string; nudge_count: number | null; reliability_score: number | null; role: string; service_subscriptions: Json | null; skills: string[] | null; status: string; timezone: string | null; title: string | null; updated_at: string | null }
        Insert: { avatar_url?: string | null; company?: string | null; created_at?: string | null; current_load?: number | null; email: string; id: string; is_onboarded?: boolean | null; joined_at?: string | null; name: string; nudge_count?: number | null; reliability_score?: number | null; role?: string; service_subscriptions?: Json | null; skills?: string[] | null; status?: string; timezone?: string | null; title?: string | null; updated_at?: string | null }
        Update: { avatar_url?: string | null; company?: string | null; created_at?: string | null; current_load?: number | null; email?: string; id?: string; is_onboarded?: boolean | null; joined_at?: string | null; name?: string; nudge_count?: number | null; reliability_score?: number | null; role?: string; service_subscriptions?: Json | null; skills?: string[] | null; status?: string; timezone?: string | null; title?: string | null; updated_at?: string | null }
        Relationships: []
      }
      os_vault_assets: {
        Row: { codec: string | null; created_at: string | null; duration_secs: number | null; folder: string | null; id: string; is_submitted_as_proof: boolean | null; milestone_id: string | null; mime_type: string | null; name: string; original_name: string | null; project_id: string | null; proof_version: string | null; r2_object_key: string | null; resolution: string | null; size_bytes: number | null; storage_path: string; storage_provider: string | null; thumbnail_url: string | null; type: string; updated_at: string | null; uploaded_by: string | null; version: string | null; version_history: Json | null; visibility: string }
        Insert: { codec?: string | null; created_at?: string | null; duration_secs?: number | null; folder?: string | null; id?: string; is_submitted_as_proof?: boolean | null; milestone_id?: string | null; mime_type?: string | null; name: string; original_name?: string | null; project_id?: string | null; proof_version?: string | null; r2_object_key?: string | null; resolution?: string | null; size_bytes?: number | null; storage_path: string; storage_provider?: string | null; thumbnail_url?: string | null; type: string; updated_at?: string | null; uploaded_by?: string | null; version?: string | null; version_history?: Json | null; visibility?: string }
        Update: { codec?: string | null; created_at?: string | null; duration_secs?: number | null; folder?: string | null; id?: string; is_submitted_as_proof?: boolean | null; milestone_id?: string | null; mime_type?: string | null; name?: string; original_name?: string | null; project_id?: string | null; proof_version?: string | null; r2_object_key?: string | null; resolution?: string | null; size_bytes?: number | null; storage_path?: string; storage_provider?: string | null; thumbnail_url?: string | null; type?: string; updated_at?: string | null; uploaded_by?: string | null; version?: string | null; version_history?: Json | null; visibility?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      my_role: { Args: never; Returns: string }
      on_project_team: { Args: { project_uuid: string }; Returns: boolean }
      recalc_project_completion: { Args: { p_id: string }; Returns: undefined }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Update']
