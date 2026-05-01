CREATE TABLE public.notifications_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  notif_type text NOT NULL,
  ref_key text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, notif_type, ref_key)
);

CREATE INDEX idx_notifications_log_user ON public.notifications_log (user_id);

ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage notifications log"
ON public.notifications_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view own notifications log"
ON public.notifications_log
FOR SELECT
USING (true);