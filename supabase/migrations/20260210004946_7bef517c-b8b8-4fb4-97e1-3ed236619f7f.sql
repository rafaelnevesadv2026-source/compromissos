
-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('anexos', 'anexos', false);

-- Storage policies
CREATE POLICY "Users can upload own attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'anexos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'anexos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'anexos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add anexos column to compromissos (array of file paths)
ALTER TABLE public.compromissos ADD COLUMN anexos TEXT[] NOT NULL DEFAULT '{}';
