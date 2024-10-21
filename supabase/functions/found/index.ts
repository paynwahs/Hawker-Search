// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { codeBlock } from "https://esm.sh/common-tags@1.8.2";
import OpenAI from "https://deno.land/x/openai@v4.58.2/mod.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({
        error: "Missing environment variables.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const authorization = req.headers.get("Authorization");

  if (!authorization) {
    return new Response(
      JSON.stringify({ error: `No authorization header passed` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        ...corsHeaders,
        authorization,
      },
    },
    auth: {
      persistSession: false,
    },
  });

  const { hawker_id } = await req.json();

  const { data: searchResponseData, error: searchResponseError } =
    await supabase
      .from("results")
      .select("search(text, date)")
      .eq("hawker_id", hawker_id);

  if (searchResponseError) {
    console.log(searchResponseError);

    return new Response(
      JSON.stringify({ error: "Search response error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (searchResponseData.length === 0) {
    return new Response(
      "[]",
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const searches = searchResponseData.map((item: any) => item.search.text);

  const completionMessages:
    OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: codeBlock`
            You are an AI assistant tasked with extracting food-related keywords from a series of searches that led to a hawker stall appearing in search results. The purpose is to inform hawker stall owners about the food-related terms that customers associate with their stall.

            Avoid repeating variations of similar words, such as "spicy" and "something spicy." Instead, use the most common term, e.g., "spicy."

            Always return a JSON array of objects or an empty JSON array, nothing else.
            
            {
              "keywords": [
                #keywords in string format
              ]
            }
  
          `,
      },
      {
        role: "user",
        content: `Searches: ${JSON.stringify(searches)}`,
      },
    ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: completionMessages,
    max_tokens: 1024,
    temperature: 0,
    response_format: { "type": "json_object" },
  });

  if (response.choices[0].message == null) {
    return new Response(
      JSON.stringify({ error: "Failed to extract food-related keywords" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const keywords = JSON.parse(
    response.choices[0].message.content!,
  ).keywords;

  //return the analytics
  return new Response(JSON.stringify(keywords), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/found' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
