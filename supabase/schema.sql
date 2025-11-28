-- Create the messages table
create table messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  user_id uuid, -- Nullable for truly anonymous, or generate a random UUID on client
  username text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime
alter publication supabase_realtime add table messages;

-- Policy to allow anyone to read messages
alter table messages enable row level security;

create policy "Public messages are viewable by everyone"
on messages for select
to public
using (true);

create policy "Anyone can insert messages"
on messages for insert
to public
with check (true);
