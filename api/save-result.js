import supabaseClient from "./supabase.js";

async function saveResult(data) {
  const { error } = await supabaseClient.from("results").insert([data]);

  if (error) {
    console.error(error);
  } else {
    console.log("Result saved");
  }
}
