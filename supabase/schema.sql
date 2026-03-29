-- 创建 translations 表
create table if not exists public.translations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  source_text text not null,
  translated_text text not null,
  direction text not null check (direction in ('zh-en', 'en-zh')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 Row Level Security
alter table public.translations enable row level security;

-- 创建 RLS 策略：用户只能查看自己的记录
create policy "Users can view own translations"
  on public.translations for select
  using (auth.uid() = user_id);

-- 创建 RLS 策略：用户只能删除自己的记录
create policy "Users can delete own translations"
  on public.translations for delete
  using (auth.uid() = user_id);

-- 创建 RLS 策略：用户只能插入自己的记录
create policy "Users can insert own translations"
  on public.translations for insert
  with check (auth.uid() = user_id);
