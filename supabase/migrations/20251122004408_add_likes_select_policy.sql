-- 自分の「いいね」データを閲覧（Select）できるようにするポリシー
create policy "Users can view their own likes"
    on public.likes for select
    to authenticated
    using (auth.uid() = user_id);