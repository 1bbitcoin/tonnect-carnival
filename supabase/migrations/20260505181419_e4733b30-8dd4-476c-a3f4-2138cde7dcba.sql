insert into storage.buckets (id, name, public) values ('telegram-assets', 'telegram-assets', true) on conflict (id) do nothing;

create policy "Public read telegram-assets"
on storage.objects for select
using (bucket_id = 'telegram-assets');