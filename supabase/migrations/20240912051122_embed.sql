create function supabase_url() returns text language plpgsql security definer as $$
declare secret_value text;
BEGIN
select decrypted_secret into secret_value
from vault.decrypted_secrets
where name = 'supabase_url';
return secret_value;
end;
$$;
create function supabase_anon_key() returns text language plpgsql security definer as $$
declare secret_value text;
BEGIN
select decrypted_secret into secret_value
from vault.decrypted_secrets
where name = 'supabase_anon_key';
return secret_value;
end;
$$;

-- Use when in cloud environment and not seeding
-- create function private.handle_hawker_update() returns trigger language plpgsql as $$
-- declare hawker_id bigint;
-- result int;
-- BEGIN
--     hawker_id := new.id;
-- select net.http_post(
--         url := supabase_url() || '/functions/v1/process',
--         headers := jsonb_build_object(
--             'Content-Type',
--             'application/json',
--             'Authorization',
--             current_setting('request.headers')::json->>'authorization'
--         ),
--         body := jsonb_build_object(
--             'hawker_id',
--             hawker_id
--         )
--     ) into result;
-- return null;
-- end;
-- $$;
-- Use when in local environment and seeding data

create function private.handle_hawker_update() returns trigger language plpgsql as $$
declare hawker_id bigint;
result int;
BEGIN hawker_id := new.id;
select net.http_post(
        url := supabase_url() || '/functions/v1/process',
        headers := jsonb_build_object(
            'Content-Type',
            'application/json',
            'Authorization',
            -- If in cloud environment, use current_setting('request.headers')::json->>'authorization
            -- If in local environment, use 'Bearer' || supabase_anon_key()
            'Bearer' || supabase_anon_key()
        ),
        body := jsonb_build_object(
            'hawker_id',
            hawker_id
        )
    ) into result;
return null;
end;
$$;

create trigger on_hawker_upload
after
insert on hawker for each ROW execute procedure private.handle_hawker_update();

create function private.embed() returns trigger language plpgsql as $$
declare content_column text = TG_ARGV [0];
embedding_column text = TG_ARGV [1];
batch_size int = case
    when array_length(TG_ARGV, 1) >= 3 then TG_ARGV [2]::int
    else 5
end;
timeout_milliseconds int = case
    when array_length(TG_ARGV, 1) >= 4 then TG_ARGV [3]::int
    else 5 * 60 * 1000
end;
batch_count int = ceiling(
    (
        select count(*)
        from inserted
    ) / batch_size::float
);
-- number of inserted rows divided by batch size
BEGIN -- Loop through each batch and invoke an edge function to handle the embedding generation
for i in 0..(batch_count -1) loop perform net.http_post(
    url := supabase_url() || '/functions/v1/embed',
    headers := jsonb_build_object(
        'Content-Type',
        'application/json',
        'Authorization',
        -- If in cloud environment, use current_setting('request.headers')::json->>'authorization
        -- If in local environment, use 'Bearer' || supabase_anon_key()
        'Bearer' || supabase_anon_key()
    ),
    body := jsonb_build_object(
        'ids',
        (
            select json_agg(ds.id)
            from (
                    select id
                    from inserted
                    limit batch_size offset i * batch_size
                ) as ds
        ),
        'table',
        TG_TABLE_NAME,
        'contentColumn',
        content_column,
        'embeddingColumn',
        embedding_column
    ),
    timeout_milliseconds := timeout_milliseconds
);
end loop;
return null;
end;
$$;

create trigger embed_hawker
after insert on hawker_embed 
referencing new table as inserted --Only includes the rows that were inserted
for each statement 
execute procedure private.embed(content, embedding);