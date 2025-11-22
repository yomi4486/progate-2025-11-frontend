-- up.sql (テーブルを作成するSQL)
create table public.likes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null, -- 認証済みユーザーを参照
    timeline_id uuid references public.timelines not null,
    type text check (type in ('like', 'skip')) not null, -- 'like'か'skip'のみ許可
    created_at timestamp with time zone default now() not null,

    -- ユーザーが同じ投稿に複数回like/skipできないようにするユニーク制約
    unique (user_id, timeline_id)
);

-- RLS（行レベルセキュリティ）を有効にする
alter table public.likes enable row level security;

-- 誰でも自分の操作（行）を作成できるポリシー
create policy "Individuals can create likes."
    on public.likes for insert
    to authenticated
    with check (auth.uid() = user_id);