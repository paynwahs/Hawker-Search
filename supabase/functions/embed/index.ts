import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import OpenAI from "https://deno.land/x/openai@v4.58.2/mod.ts";
import { EmbeddingCreateParams } from "https://deno.land/x/openai@v4.58.2/resources/mod.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// --- Uncomment this block if you want to use the Supabase.ai model ---

// const model = new Supabase.ai.Session("gte-small");

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({
        error: "Missing environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const authorization = req.headers.get("Authorization");

  if (!authorization) {
    return new Response(
      JSON.stringify({ error: `No authorization header passed` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        authorization,
      },
    },
    auth: {
      persistSession: false,
    },
  });

  const { ids, table, contentColumn, embeddingColumn } = await req.json();

  const { data: rows, error: selectError } = await supabase
    .from(table)
    .select(`id, ${contentColumn}` as "*")
    .in("id", ids)
    .is(embeddingColumn, null);

  if (selectError) {
    return new Response(JSON.stringify({ error: selectError }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  for (const row of rows) {
    const { id, [contentColumn]: content } = row;

    if (!content) {
      console.log(`No content available in column '${contentColumn}'`);
    }

    const params: EmbeddingCreateParams = {
      input: content,
      model: "text-embedding-ada-002",
    }

    const output = await (openai.embeddings.create(params));

    // --- Uncomment this block if you want to use the Supabase.ai model ---
    // const output = (await model.run(content, {
    //   mean_pool: true,
    //   normalize: true,
    // })) as number[];

    const embedding = JSON.stringify(output.data[0].embedding);

    const { error } = await supabase
      .from(table)
      .update({
        [embeddingColumn]: embedding,
      })
      .eq("id", id);

    if (error) {
      console.error(
        `Failed to save embedding on ${table} with id ${id}`,
      );
    }

    console.log(
      `Generated embedding ${
        JSON.stringify({
          table,
          id,
          contentColumn,
          embeddingColumn,
        })
      }`,
    );
  }

  return new Response(null, {
    status: 204,
    headers: { "Content-Type": "application/json" },
  });
});
