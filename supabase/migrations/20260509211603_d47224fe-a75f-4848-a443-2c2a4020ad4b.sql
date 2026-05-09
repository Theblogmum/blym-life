DO $$
DECLARE jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'trial-reminders-every-15min';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
END $$;

SELECT cron.schedule(
  'trial-reminders-every-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--26545f8e-09a2-4543-b1c1-65c7c157a44f.lovable.app/api/public/hooks/trial-reminders',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);