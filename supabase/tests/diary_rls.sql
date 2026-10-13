-- Rollback-only live test. Run through project-scoped MCP execute_sql, never a migration.
-- Disposable identities exist only within this transaction, with no emails/passwords.
begin;
insert into auth.users(id) values ('f2c60c1b-6849-46e2-a8d2-bd389ca13b11'),('f2c60c1b-6849-46e2-a8d2-bd389ca13b22');
set local role authenticated;
select set_config('request.jwt.claim.sub','f2c60c1b-6849-46e2-a8d2-bd389ca13b11',true);
select set_config('request.jwt.claims','{"sub":"f2c60c1b-6849-46e2-a8d2-bd389ca13b11","role":"authenticated"}',true);
do $$
declare first_id uuid; first_date timestamptz; affected integer; result jsonb;
begin
  perform public.choose_movie('fixture-rls-test','Synthetic test','اختبار خيالي',90,'rls-test',true,'test-first');
  perform public.choose_movie('fixture-rls-test','Synthetic test','اختبار خيالي',90,'rls-test',true,'test-first');
  perform public.choose_movie('fixture-rls-test','Synthetic test','اختبار خيالي',90,'rls-test',true,'test-retry-new-id');
  assert (select count(*) from public.movie_nights) = 1, 'Choice deduplication failed';
  select id,chosen_at into first_id,first_date from public.movie_nights;
  assert first_date is not null and (select status='chosen' and watched_on is null from public.movie_nights where id=first_id), 'Choosing fabricated viewing';
  perform public.record_movie_watched('fixture-rls-test','Synthetic test','اختبار خيالي',90,'rls-test',true,'test-watch',current_date);
  assert (select status='watched' and watched_on=current_date and chosen_at=first_date from public.movie_nights where id=first_id), 'Separate viewed date failed';
  perform public.record_movie_watched('fixture-rls-test','Synthetic test','اختبار خيالي',90,'rls-test',true,'test-watch-retry',current_date);
  assert (select count(*) from public.movie_nights) = 1, 'Watch deduplication failed';
  perform public.choose_movie('fixture-rls-test','Synthetic test','اختبار خيالي',90,'rls-test',true,'test-rewatch');
  assert (select count(*) from public.movie_nights) = 2, 'Rewatch did not preserve old record';
  delete from public.movie_nights where status='chosen';
  update public.movie_nights set status='chosen',watched_on=null where id=first_id;
  assert (select status='chosen' and watched_on is null and chosen_at=first_date from public.movie_nights where id=first_id), 'Undo lost chosen timestamp';
  result := public.import_guest_movie_nights('[{"movie_id":"fixture-import-test","title_en":null,"title_ar":null,"runtime_minutes":null,"catalog_version":"unknown","is_synthetic":true,"status":"watched","chosen_at":null,"watched_on":null,"client_event_id":"guest:test:import"}]');
  assert (result->>'inserted')::integer = 1, 'Guest import failed';
  result := public.import_guest_movie_nights('[{"movie_id":"fixture-import-test","title_en":null,"title_ar":null,"runtime_minutes":null,"catalog_version":"unknown","is_synthetic":true,"status":"watched","chosen_at":null,"watched_on":null,"client_event_id":"guest:test:import"}]');
  assert (result->>'inserted')::integer = 0 and (result->>'skipped')::integer = 1, 'Duplicate import wrote data';
  assert (select chosen_at is null and watched_on is null and title_en is null from public.movie_nights where movie_id='fixture-import-test'), 'Import invented dates/metadata';
  begin
    update public.movie_nights set user_id='f2c60c1b-6849-46e2-a8d2-bd389ca13b22' where id=first_id;
    raise exception 'Ownership mutation was allowed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','f2c60c1b-6849-46e2-a8d2-bd389ca13b22',true);
select set_config('request.jwt.claims','{"sub":"f2c60c1b-6849-46e2-a8d2-bd389ca13b22","role":"authenticated"}',true);
do $$
declare affected integer;
begin
  assert (select count(*) from public.movie_nights) = 0, 'User B can read user A';
  update public.movie_nights set status='watched',watched_on=current_date where movie_id='fixture-rls-test';
  get diagnostics affected = row_count; assert affected=0, 'User B can update A';
  delete from public.movie_nights where movie_id='fixture-rls-test';
  get diagnostics affected = row_count; assert affected=0, 'User B can delete A';
  begin
    insert into public.movie_nights(user_id,movie_id,catalog_version,is_synthetic,status,source,client_event_id)
    values('f2c60c1b-6849-46e2-a8d2-bd389ca13b11','fixture-forged','test',true,'chosen','app','forged');
    raise exception 'Forged owner insert was allowed';
  exception when insufficient_privilege then null; end;
  perform public.choose_movie('fixture-user-b','B test','اختبار ب',90,'rls-test',true,'b-choice');
  assert (select count(*) from public.movie_nights)=1, 'B own insert failed';
  delete from public.movie_nights;
  assert (select count(*) from public.movie_nights)=0, 'B clear failed';
end $$;
select set_config('request.jwt.claim.sub','f2c60c1b-6849-46e2-a8d2-bd389ca13b11',true);
select set_config('request.jwt.claims','{"sub":"f2c60c1b-6849-46e2-a8d2-bd389ca13b11","role":"authenticated"}',true);
do $$ begin assert (select count(*) from public.movie_nights)=2, 'B clear removed A data'; end $$;
set local role anon;
do $$
begin
  begin perform 1 from public.movie_nights; raise exception 'Anonymous read allowed'; exception when insufficient_privilege then null; end;
  begin perform public.choose_movie('fixture-guest','Guest','ضيف',90,'test',true,'anon-test'); raise exception 'Anonymous RPC allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'PASS: two-owner RLS, forged writes, selection/watch retries, rewatch, undo, import, dates, owner clear and anonymous denial; all test data rolled back' as verification;
