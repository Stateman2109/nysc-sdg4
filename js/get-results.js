<script src="/js/supabase.js"></script>;

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
