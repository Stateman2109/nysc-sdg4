import supabaseClient from "./supabase.js";

async function getResults() {
  const { data, error } = await supabaseClient
    .from("results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  console.log(data);
}

getResults();
