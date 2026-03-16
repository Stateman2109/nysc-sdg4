const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function saveResult(data) {
  const { error } = await supabaseClient.from("results").insert([data]);

  if (error) {
    console.error(error);
  } else {
    console.log("Result saved");
  }
}
