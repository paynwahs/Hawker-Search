import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { codeBlock } from "https://esm.sh/common-tags@1.8.2";
import OpenAI from "https://deno.land/x/openai@v4.58.2/mod.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

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

  const { hawker_id } = await req.json();

  const { data: hawker } = await supabase
    .from("hawker")
    .select()
    .eq("id", hawker_id)
    .single();

  if (!hawker.id) {
    return new Response(
      JSON.stringify({ "error": "Hawker not found" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { data: foods=[] }= await supabase.from("food").select().eq(
    "hawker_id",
    hawker_id,
  );

  const cuisineCompletionMessages:
    OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: codeBlock`
          You're an AI assistant who takes an array of food names and determine one cuisine type that best describes all the dishes.
          
          If there are multiple cuisine types, return 'fusion'.

          Limit your response to 1 word.
        `,
      },
      {
        role: "user",
        content: `${foods!.map((food) => food.name)}`,
      }
    ];

  const cuisineResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: cuisineCompletionMessages,
    max_tokens: 1024,
    temperature: 1,
    top_p: 1,
  });

  if (cuisineResponse.choices[0].message == null) {
    return new Response(
      JSON.stringify({ error: "Failed to generate cuisine type" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const cuisine = cuisineResponse.choices[0].message.content;

  const { error:cuisineError } = await supabase.from("hawker").update({cuisine}).eq("id", hawker_id);

  if (cuisineError) {
    console.error(cuisineError);
    return new Response(
      JSON.stringify({ error: "Failed to save cuisine type" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  hawker.cuisine = cuisine;

  const foodCompletionMessages:
    OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: codeBlock`
          You're an AI Assistant who takes an array of food name and determines each food desction and ingredients that makes up of it. 
          
          The description should concisely describe the dish in a string. The ingredients should list the main components of the dish in a string delimited by comma.          
          
          Always return a valid JSON array of objects, nothing else.
        `,
      },
      {
        role: "user",
        content: `${JSON.stringify(foods)}`,
      },
    ];

  const foodResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: foodCompletionMessages,
    max_tokens: 1024,
    temperature: 0,
  });

  if (foodResponse.choices[0].message == null) {
    return new Response(
      JSON.stringify({ error: "Failed to generate food descriptions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const foodsWithDescription = JSON.parse(
    foodResponse.choices[0].message.content!,
  );

  for (const food of foodsWithDescription) {
    const { error: foodError } = await supabase.from("food").update({
      description: food.description,
      ingredients: food.ingredients,
    }).eq("id", food.id);

    if (foodError) {
      console.error(foodError);
      return new Response(
        JSON.stringify({ error: "Failed to save food descriptions" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  const completionMessages:
    OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: codeBlock`
            You're an AI Assistant who takes hawker and food information and summarizes it into a concise, searchable text form, with 512 tokens or less. 
            
            The summary should include details such as the cuisine type, dish ingredients, and any descriptors that might help users perform a similarity search later on. 

            Your summary should also include the health benefits of the dishes if any. 

            Follow the following guidelines for health benefits: "High in Wholegrain", "High in vegetables", "High in fruits", "High in lean protein", "Low in fat", "Low in sugar".
            
            For example, a user might search for 'hot and spicy food' or 'savoury dessert,' so make sure to include relevant keywords and attributes for each dish. 
          `,
      },
      {
        role: "user",
        content: `Information: ${
          JSON.stringify({ hawker, foodsWithDescription })
        }`,
      },
    ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: completionMessages,
    max_tokens: 1024,
    temperature: 0,
  });

  const message = response.choices[0].message.content;

  const { error } = await supabase.from("hawker_embed").insert({
    hawker_id,
    content: message,
  });

  if (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to save hawker_embed section" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(null, {
    status: 204,
    headers: { "Content-Type": "application/json" },
  });
});
