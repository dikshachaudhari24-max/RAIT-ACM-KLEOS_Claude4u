-- Hisably Database Schema for Supabase (PostgreSQL)

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    phone text,
    business_name text,
    gstin text,
    preferred_language text DEFAULT 'en',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    gstin text,
    phone text,
    email text,
    address text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_gstin ON suppliers(gstin);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY suppliers_user_policy ON suppliers USING (user_id = auth.uid());

-- 3. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    supplier_id uuid REFERENCES suppliers(id),
    supplier_name text,
    supplier_gstin text,
    invoice_number text,
    date date,
    taxable_value numeric(14,2),
    cgst_amount numeric(14,2),
    sgst_amount numeric(14,2),
    igst_amount numeric(14,2),
    gst_amount numeric(14,2),
    gst_percent numeric(5,2),
    total_amount numeric(14,2),
    hsn_code text,
    product_description text,
    status text DEFAULT 'pending',
    anomaly_score numeric(5,4) DEFAULT 0,
    confidence_scores jsonb,
    file_url text,
    ocr_raw_text text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier_id ON invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_user_policy ON invoices USING (user_id = auth.uid());

-- 4. GSTR-2B Records
CREATE TABLE IF NOT EXISTS gstr2b_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    upload_id text,
    supplier_gstin text,
    invoice_number text,
    itc_amount numeric(14,2),
    upload_date date,
    status text DEFAULT 'pending',
    file_url text,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gstr2b_user_id ON gstr2b_records(user_id);
CREATE INDEX IF NOT EXISTS idx_gstr2b_invoice_number ON gstr2b_records(invoice_number);
CREATE INDEX IF NOT EXISTS idx_gstr2b_status ON gstr2b_records(status);
ALTER TABLE gstr2b_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY gstr2b_user_policy ON gstr2b_records USING (user_id = auth.uid());

-- 5. Mismatches
CREATE TABLE IF NOT EXISTS mismatches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    invoice_id uuid REFERENCES invoices(id),
    supplier_name text,
    mismatch_type text NOT NULL,
    amount_difference numeric(14,2) DEFAULT 0,
    itc_at_risk numeric(14,2) DEFAULT 0,
    explanation_hi text,
    explanation_en text,
    root_cause_category text,
    root_cause_confidence numeric(5,2),
    recommended_action text,
    resolved boolean DEFAULT false,
    resolved_at timestamptz,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mismatches_user_id ON mismatches(user_id);
CREATE INDEX IF NOT EXISTS idx_mismatches_invoice_id ON mismatches(invoice_id);
CREATE INDEX IF NOT EXISTS idx_mismatches_resolved ON mismatches(resolved);
ALTER TABLE mismatches ENABLE ROW LEVEL SECURITY;
CREATE POLICY mismatches_user_policy ON mismatches USING (user_id = auth.uid());

-- 6. Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    task_type text NOT NULL,
    supplier_name text,
    supplier_id uuid REFERENCES suppliers(id),
    invoice_id uuid REFERENCES invoices(id),
    amount numeric(14,2),
    due_date date,
    status text DEFAULT 'pending',
    proof_type text,
    proof_url text,
    cash_note text,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_user_policy ON tasks USING (user_id = auth.uid());

-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    task_id uuid REFERENCES tasks(id),
    supplier_id uuid REFERENCES suppliers(id),
    amount numeric(14,2) NOT NULL,
    payment_type text NOT NULL,
    proof_type text,
    proof_url text,
    cash_note text,
    paid_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_supplier_id ON payments(supplier_id);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_user_policy ON payments USING (user_id = auth.uid());

-- 8. ITC Summary
CREATE TABLE IF NOT EXISTS itc_summary (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    month text NOT NULL,
    total_eligible numeric(14,2) DEFAULT 0,
    total_blocked numeric(14,2) DEFAULT 0,
    total_recoverable numeric(14,2) DEFAULT 0,
    priority_actions jsonb,
    computed_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_itc_summary_user_id ON itc_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_itc_summary_month ON itc_summary(month);
ALTER TABLE itc_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY itc_summary_user_policy ON itc_summary USING (user_id = auth.uid());

-- 9. HSN Codes (shared reference table, no RLS)
CREATE TABLE IF NOT EXISTS hsn_codes (
    code text PRIMARY KEY,
    description text NOT NULL,
    gst_rate numeric(5,2) NOT NULL,
    category text
);

-- 10. Supplier Health Scores
CREATE TABLE IF NOT EXISTS supplier_health_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    supplier_id uuid REFERENCES suppliers(id) NOT NULL,
    score integer NOT NULL,
    tier text NOT NULL,
    trend text,
    total_invoices integer DEFAULT 0,
    total_mismatches integer DEFAULT 0,
    computed_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_supplier_health_user_id ON supplier_health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_health_supplier_id ON supplier_health_scores(supplier_id);
ALTER TABLE supplier_health_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY supplier_health_user_policy ON supplier_health_scores USING (user_id = auth.uid());

-- 11. AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    invoice_id uuid REFERENCES invoices(id),
    supplier_id uuid REFERENCES suppliers(id),
    recommendation_type text NOT NULL,
    message_en text,
    message_hi text,
    channel text,
    sent boolean DEFAULT false,
    sent_at timestamptz,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_recommendations_user_policy ON ai_recommendations USING (user_id = auth.uid());

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    body text,
    notification_type text,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_user_policy ON notifications USING (user_id = auth.uid());

-- 13. Voice Conversations
CREATE TABLE IF NOT EXISTS voice_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    audio_url text,
    transcribed_text text,
    response_text text,
    response_audio_url text,
    language text DEFAULT 'hi',
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_user_id ON voice_conversations(user_id);
ALTER TABLE voice_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY voice_conversations_user_policy ON voice_conversations USING (user_id = auth.uid());

-- 14. Chat History
CREATE TABLE IF NOT EXISTS chat_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    retrieved_namespaces jsonb,
    grounded boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_history_user_policy ON chat_history USING (user_id = auth.uid());

-- 15. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    language text DEFAULT 'en',
    voice_enabled boolean DEFAULT true,
    notification_enabled boolean DEFAULT true,
    whatsapp_enabled boolean DEFAULT false,
    amount_tolerance_percent numeric(5,2) DEFAULT 1.0,
    anomaly_threshold numeric(5,4) DEFAULT 0.5,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_preferences_user_policy ON user_preferences USING (user_id = auth.uid());
