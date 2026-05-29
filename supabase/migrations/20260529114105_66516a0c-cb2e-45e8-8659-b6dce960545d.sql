DROP POLICY IF EXISTS "brain_dump_media authed insert" ON storage.objects;
DROP POLICY IF EXISTS "brain_dump_media own insert" ON storage.objects;

CREATE POLICY "brain_dump_media own insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brain-dump-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);