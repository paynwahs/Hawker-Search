-- Matches document sections using vector similarity search on embeddings
--
-- Returns a setof document_sections so that we can use PostgREST resource embeddings (joins with other tables)
-- Additional filtering like limits can be chained to this function call
create or replace function match_hawker_embed(embedding vector(1536), match_threshold float, halal_preference BOOLEAN DEFAULT NULL, vegetarian_preference BOOLEAN DEFAULT NULL)
returns setof hawker_embed
language plpgsql
as $$
#variable_conflict use_variable
begin
  return query
  select he.*
  from hawker_embed he
  JOIN hawker h ON he.hawker_id = h.id

  -- The inner product is negative, so we negate match_threshold
  where (h.halal = halal_preference OR halal_preference IS NULL)
    AND (h.vegetarian = vegetarian_preference OR vegetarian_preference IS NULL)
    AND he.embedding <#> embedding < -match_threshold

  -- Our embeddings are normalized to length 1, so cosine similarity
  -- and inner product will produce the same query results.
  -- Using inner product which can be computed faster.
  --
  -- For the different distance functions, see https://github.com/pgvector/pgvector
  order by he.embedding <#> embedding;
end;
$$;
