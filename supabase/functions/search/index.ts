// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { codeBlock } from "https://esm.sh/common-tags@1.8.2";
import OpenAI from "https://deno.land/x/openai@v4.58.2/mod.ts";
import { OpenAIStream, StreamingTextResponse } from "https://esm.sh/ai@2.2.13";
import { Database } from "../_lib/database.ts";
import { EmbeddingCreateParams } from "https://deno.land/x/openai@v4.58.2/resources/mod.ts";

const model = new Supabase.ai.Session("gte-small");

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const googleApiKey = Deno.env.get("GOOGLE_API_KEY");

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type returnType = {
  id: any;
  name: any;
  location: any;
  halal: any;
  vegetarian: any;
  opening: any;
  closing: any;
  foods: {
    name: any;
    description: any;
  }[];
  reason: string;
  favourite: boolean;
};

type roleType = "foodie" | "hawker";

// Function to filter hawkers based on walking time from user location under the treshold
async function filterHawkersByWalkingTime(
  hawkerWithFoods: any[],
  userLocation: string,
  minutesThreshold: number,
) {
  const filteredHawkers: any[] = [];

  // Maximum number of destinations per request (Google allows up to 25)
  const maxDestinationsPerRequest = 25;

  // Split hawkerWithFoods into chunks of up to 25 destinations
  for (let i = 0; i < hawkerWithFoods.length; i += maxDestinationsPerRequest) {
    const hawkerBatch = hawkerWithFoods.slice(i, i + maxDestinationsPerRequest);

    // Prepare destinations by extracting hawker locations
    const destinations = hawkerBatch.map((hawker: any) => hawker.location).join(
      "|",
    );

    // Create the URL using the URL constructor
    const url = new URL(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
    );
    url.searchParams.append("origins", userLocation);
    url.searchParams.append("destinations", destinations);
    url.searchParams.append("units", "metric");
    url.searchParams.append("mode", "walking");
    url.searchParams.append("key", googleApiKey!);

    try {
      // Make the API request
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const elements = data.rows[0].elements;

        elements.forEach((element: any, index: any) => {
          if (element.status === "OK") {
            const durationInSeconds = element.duration.value;
            const durationInMinutes = durationInSeconds / 60;

            // Check if walking time is less than or equal to the threshold
            if (durationInMinutes <= minutesThreshold) {
              // Include hawkers that are less than or equal to the threshold
              filteredHawkers.push(hawkerBatch[index]);
            }
          } else {
            // Handle cases where distance data is unavailable
            console.warn(
              `No walking route found to hawker: ${hawkerBatch[index].name}`,
            );
            // Decide whether to include or exclude; here we exclude
          }
        });
      } else {
        console.error(`Error from Google Maps API: ${data.status}`);
        // Handle API errors as needed
      }
    } catch (error) {
      console.error("Error fetching distance data:", error);
      // Handle fetch errors
    }
  }

  return filteredHawkers;
}

async function determineDBIDAndRole(user: any, supabase: any) {
  if (user && supabase) {
    const id = user.id;
    const { role }: { role: roleType } = user.user_metadata;

    const tableName = role === "foodie" ? "foodie" : "hawker";
    const { data: { id: db_id }, error } = await supabase.from(tableName)
      .select("id").eq("user_id", user.id).single();

    if (error) {
      return { data: null, error };
    }

    return { data: { id: db_id, role }, error: null };
  } else {
    // return error
    return { data: null, error: "User or Supabase client not found" };
  }
}

async function outputProcessing(
  recommendations: any,
  role: roleType,
  message: string,
  db_id: number,
  hawkerWithFoods: any,
  supabase: any,
) {
  // If foodie, save to search and recommendation table
  // For both foodie and hawker, return recommendations with hawker details
  const recommendations_with_hawker: returnType[] = [];

  if (role === "foodie") {
    // Save to search table
    const currentDate = new Date().toISOString();

    const { data: searchData, error } = await supabase.from("search").insert({
      text: message,
      date: currentDate,
      foodie_id: db_id,
    }).select();

    if (error) {
      console.error(error);
      return { data: null, error: "Falied to save search" };
    }

    // Save to recommendation table
    const search_id = searchData[0].id;

    for (const recommendation of recommendations) {
      const { hawker_id, reason } = recommendation;

      const { error } = await supabase.from("results").insert({
        search_id,
        hawker_id,
        reason,
      });

      if (error) {
        console.error(error);
        return { data: null, error: "Failed to save recommendations" };
      }

      const hawker = hawkerWithFoods.find(({ id }: { id: any }) =>
        id === parseInt(recommendation.hawker_id)
      )!;

      if (hawker) {
        const { data } = await supabase.from("favourite").select().eq(
          "hawker_id",
          hawker.id,
        ).eq("foodie_id", db_id).limit(1);

        const favourite = data!.length > 0 ? true : false;
        const recommendation_with_hawker: returnType = {
          ...hawker,
          reason: recommendation.reason,
          favourite,
        };

        recommendations_with_hawker.push(recommendation_with_hawker);
      } else {
        continue;
      }
    }
  } else {
    for (const recommendation of recommendations) {
      const { hawker_id, reason } = recommendation;
      const hawker = hawkerWithFoods.find(({ id }: { id: any }) =>
        id === parseInt(recommendation.hawker_id)
      )!;

      if (hawker) {
        const recommendation_with_hawker: returnType = {
          ...hawker,
          reason: recommendation.reason,
          favourite: false,
        };

        recommendations_with_hawker.push(recommendation_with_hawker);
      } else {
        continue;
      }
    }
  }
  return { data: recommendations_with_hawker, error: null };
}

function convertHawkerWithFoodsToString(hawkerWithFoods: any) {
  if (!hawkerWithFoods || hawkerWithFoods.length === 0) {
    return "No hawker or food data available.";
  }

  // Initialize an array to store formatted strings
  let result: any = [];

  // Loop through each hawker in the list
  hawkerWithFoods.forEach((hawker: any) => {
    // Start by adding basic hawker information
    let hawkerInfo =
      `Hawker Name: ${hawker.name}\nHawker Id: ${hawker.id}\nLocation: ${hawker.location}\nHalal: ${hawker.halal}\nVegetarian: ${hawker.vegetarian}\nOpening Time: ${hawker.opening}\nClosing Time: ${hawker.closing}\nFoods:\n`;

    // Check if the hawker has foods
    if (hawker.foods && hawker.foods.length > 0) {
      // Loop through each food item for this hawker
      hawker.foods.forEach((food: any, index: any) => {
        hawkerInfo += `${
          index + 1
        }. ${food.name}\n   Description: ${food.description}\n`;
      });
    } else {
      hawkerInfo += "No food items available.\n";
    }

    // Add the formatted string for this hawker to the result array
    result.push(hawkerInfo);
  });

  // Join all hawker strings with a separator for readability
  return result.join("\n\n");
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({
        error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const authorization = req.headers.get("authorization");

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
        Authorization: authorization,
      },
    },
    auth: {
      persistSession: false,
    },
  });

  // Get user id and determine if foodie or hawker
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(
      JSON.stringify({
        error: "User not found",
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { data: dbAndRole, error } = await determineDBIDAndRole(
    user,
    supabase,
  );

  if (error) {
    return new Response(
      JSON.stringify({
        error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { id: db_id, role } = dbAndRole!;

  const { message, halal, vegetarian, location } = await req.json(); // If halal or vegetarian or location is not passed in, it will be null

  const params: EmbeddingCreateParams = {
    input: message,
    model: "text-embedding-ada-002",
  };

  const output = await (openai.embeddings.create(params));

  const embedding = JSON.stringify(output.data[0].embedding);

  const { data: matches, error: matchError } = await supabase
    .rpc("match_hawker_embed", {
      embedding,
      match_threshold: 0.6,
      ...(halal ? { "halal_preference": halal } : {}), // If halal is false or undefined, include nothing ({})
      ...(vegetarian ? { "vegetarian_preference": vegetarian } : {}),
    })
    .select(`hawker_id, content`)
    .limit(5);

  if (matchError) {    
    console.error(matchError);

    return new Response(
      JSON.stringify({
        error: "There was an error matching hawker, please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const hawkerIds = matches.map((match) => match.hawker_id);

  if (hawkerIds.length === 0) {
    return new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: hawkerWithFoods, error: hawkerError } = await supabase
    .from("hawker")
    .select(
      `id, name, location, halal, vegetarian, opening, closing,foods: food (name, description)`,
    )
    .in("id", hawkerIds);

  if (hawkerError) {
    console.error(hawkerError);

    return new Response(
      JSON.stringify({
        error: "There was an error reading hawker and food, please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  //filter hawkers based on walking time from user location. Right now set to 50 minutes
  const hawkerWithFoodFilteredLocation = location
    ? await filterHawkersByWalkingTime(hawkerWithFoods, location, 1000000)
    : hawkerWithFoods;

  // Get ChatGPT to do second layer filtering
  const formattedString = convertHawkerWithFoodsToString(
    hawkerWithFoodFilteredLocation,
  );

  const completionMessages:
    OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: codeBlock`
              You're an AI assistant that helps to recommend user hawkers to visit based on their taste and preferences..

              If there is hawker recommendations to be made, respond with a valid JSON array of objects.
              
              If the user's query is not related to food, respond with an empty JSON array

              If no suitable recommendations could be made, respond with an empty JSON array.

              If user asks for healthy options, follow the following guidelines for health benefits: "High in Wholegrain", "High in vegetables", "High in fruits", "High in lean protein", "Low in fat", "Low in sugar". Provide the specific health benefits in the reason.

              Always return a JSON array of objects or an empty JSON array, nothing else.

              {
                "recommendations": [
                  {
                    "hawker_name": "...", # Hawker Name
                    "food_name": "...", # Food Name
                    "reason": "...", # Reason for recommendation including food name under 255 characters
                    "hawker_id": "..." # Hawker ID
                  }
                ]
              }
                
              Hawkers:
              ${formattedString}

              Example of valid user query: "Something healthy", "Something light", "Something spicy and hot"
              "
          `,
      },
      {
        role: "user",
        content: `${message}`,
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
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let results;

  try {
    results = JSON.parse(
      response.choices[0].message.content!,
    );
  } catch {
    return new Response(
      JSON.stringify({
        error: "There was an error reading hawker and food, please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (Object.keys(results).length === 0) {
    return new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: recommendations_with_hawker, error: output_error } =
    await outputProcessing(
      results.recommendations,
      role,
      message,
      db_id,
      hawkerWithFoodFilteredLocation,
      supabase,
    );

  if (output_error) {
    return new Response(
      JSON.stringify({ error: output_error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify(recommendations_with_hawker), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
