-- Schedule cron jobs for post reminders (every 10 min) and weekly growth report (Monday 8am UTC)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'post-reminders-10min') THEN
    PERFORM cron.unschedule('post-reminders-10min');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-growth-report') THEN
    PERFORM cron.unschedule('weekly-growth-report');
  END IF;
END $$;

SELECT cron.schedule(
  'post-reminders-10min',
  '*/10 * * * *',
  $cron$
  SELECT net.http_post(
    url:='https://blym-life.lovable.app/api/public/hooks/post-reminders',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc3BqdHV4cWxiZnJybnhubW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzU4OTgsImV4cCI6MjA5MzgxMTg5OH0.rlOMJb6qE-iv9XJ_TdlvPKDNoaY7PlDZuzhNJzxZNoU"}'::jsonb,
    body:='{}'::jsonb
  );
  $cron$
);

SELECT cron.schedule(
  'weekly-growth-report',
  '0 8 * * 1',
  $cron$
  SELECT net.http_post(
    url:='https://blym-life.lovable.app/api/public/hooks/weekly-report',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc3BqdHV4cWxiZnJybnhubW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzU4OTgsImV4cCI6MjA5MzgxMTg5OH0.rlOMJb6qE-iv9XJ_TdlvPKDNoaY7PlDZuzhNJzxZNoU"}'::jsonb,
    body:='{}'::jsonb
  );
  $cron$
);