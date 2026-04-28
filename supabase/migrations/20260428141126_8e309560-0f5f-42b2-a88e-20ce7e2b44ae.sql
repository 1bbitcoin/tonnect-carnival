CREATE TABLE public.user_task_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

ALTER TABLE public.user_task_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task progress"
ON public.user_task_progress
FOR SELECT
USING (true);

CREATE POLICY "Service role can manage task progress"
ON public.user_task_progress
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX idx_user_task_progress_user ON public.user_task_progress(user_id);