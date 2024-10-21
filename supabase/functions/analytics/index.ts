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

/**
 * Function to format hawker data and results data into the desired JSON structure.
 *
 * Required Schema for input:
 *
 * hawkerData: {
 *   name: string,           // Name of the hawker
 *   cuisine: string,        // Type of cuisine
 *   halal: boolean,         // Whether the hawker is halal
 *   vegetarian: boolean,    // Whether the hawker offers vegetarian options
 *   opening: string,        // Opening time (HH:MM:SS)
 *   closing: string,        // Closing time (HH:MM:SS)
 *   food: [
 *     {
 *       name: string,           // Name of the food item
 *       description: string,    // Description of the food item
 *       ingredients: string     // Ingredients used in the food item
 *     },
 *     ...
 *   ]
 * }
 *
 * resultsData: [
 *   {
 *     search_id: number,      // ID of the search
 *     reason: string,        // Reason the result matches the search
 *     search: {
 *       text: string,         // Search query text
 *       date: string          // Date of the search
 *     }
 *   },
 *   ...
 * ]
 */
function formatHawkerData(hawkerData: any, resultsData: any) {
  // Format the opening hours
  const openingHours = `${hawkerData.opening} - ${hawkerData.closing}`;

  // Map food data to the required format
  const formattedFood = hawkerData.food.map((item: any) => ({
    name: item.name,
    description: item.description,
    ingredients: item.ingredients,
  }));

  // Map search and results data to the required format
  const formattedSearchesAndResults = resultsData.map((result: any) => ({
    search_text: result.search.text,
    results_reason: result.reason,
  }));

  // Combine everything into the required JSON format
  const formattedHawker = {
    "Hawker Name": hawkerData.name,
    "Description": hawkerData.cuisine,
    "Halal": hawkerData.halal,
    "Vegetarian": hawkerData.vegetarian,
    "Opening hours": openingHours,
    "Food": formattedFood,
    "Searches and results": formattedSearchesAndResults,
  };

  return formattedHawker;
}

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

  const { data: hawkerData, error: hawkerError } = await supabase
    .from("hawker")
    .select(`
    name,
    cuisine,
    halal,
    vegetarian,
    opening,
    closing,
    food:food(
      name,
      description,
      ingredients
    )
  `)
    .eq("id", hawker_id)
    .single();

  if (hawkerError) {
    console.error("Error fetching hawker data:", hawkerError);
  }

  const { data: resultsData, error: resultsError } = await supabase
    .from("results")
    .select(`
    search_id,
    reason,
    search:search(
      text,
      date
    )
  `)
    .eq("hawker_id", hawker_id);

  if (resultsError) {
    console.error("Error fetching results data:", resultsError);
  }

  const formattedData = formatHawkerData(hawkerData, resultsData);

  const completionMessages:
    OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: codeBlock`
          You're an AI Assistant who provides hawkers with recommendation to improve their food offerings.

          You will be given the hawker information, current food offerings and user searches that resulted in their hawker being recommended.

          Your task is to generate 1-3 recommendations. Each recommendation should be concise (Under 80 characters), actionable and backed by data.

          Always return a valid JSON array of strings.

          {
                "recommendations": [
                  #recommendations in string format
                ]
          }

        `,
      },
      {
        role: "user",
        content: `${JSON.stringify(formattedData)}`,
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
      JSON.stringify({ error: "Failed to generate recommendations" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const recommendations = JSON.parse(
    response.choices[0].message.content!,
  ).recommendations;

  //return the analytics
  return new Response(JSON.stringify(recommendations), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
