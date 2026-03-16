const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaXFrZHFxZnZ1bG1ha214dG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzY0NzcsImV4cCI6MjA4OTI1MjQ3N30.q0qlipCmr8OfbnpiOEE8E4eFJgRJ9YYUGqlOaUmIRW8";
const SUPABASE_URL = "https://ejiqkdqqfvulmakmxtmb.supabase.co";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function saveResult(data) {
  const { error } = await supabaseClient.from("results").insert([data]);

  if (error) {
    console.error(error);
  } else {
    console.log("Result saved");
  }
}
