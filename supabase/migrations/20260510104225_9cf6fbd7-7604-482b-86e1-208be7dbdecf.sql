SELECT cron.unschedule('trial-reminders-every-15min');

SELECT cron.schedule(
  'trial-reminders-every-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--26545f8e-09a2-4543-b1c1-65c7c157a44f.lovable.app/api/public/hooks/trial-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc3BqdHV4cWxiZnJybnhubW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzU4OTgsImV4cCI6MjA5MzgxMTg5OH0.rlOMJb6qE-iv9XJ_TdlvPKDNoaY7PlDZuzhNJzxZNoU'
    ),
    body := '{}'::jsonb
  );
  $$
);