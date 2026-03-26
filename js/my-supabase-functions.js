document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaXFrZHFxZnZ1bG1ha214dG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzY0NzcsImV4cCI6MjA4OTI1MjQ3N30.q0qlipCmr8OfbnpiOEE8E4eFJgRJ9YYUGqlOaUmIRW8";
  const SUPABASE_URL = "https://ejiqkdqqfvulmakmxtmb.supabase.co";

  // Global client
  window.db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* ---------- INSERT (name, school) ---------- */
  window.DBsaveStudent = async function (name, school) {
    const { error } = await window.db
      .from("results")
      .insert([{ name, school }]);

    if (error) {
      console.error("Insert Error:", error.message);
      return false;
      g;
    }
    // SAVE RESULT
    console.log("✅ Saved successfully");
    return true;
  };
  /* ---------- AUTH ---------- */
  // window.loginWithGoogle = async function () {
  //   await window.db.auth.signInWithOAuth({
  //     provider: "google",
  //   });
  // };

  window.loginWithGoogle = async function () {
    await window.db.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://nysc-sdg4.vercel.app/admin.html", // 🔥 CHANGE THIS
      },
    });
  };

  window.getCurrentUser = async function () {
    const {
      data: { user },
    } = await window.db.auth.getUser();

    return user;
  };

  window.logout = async function () {
    await window.db.auth.signOut();
    location.reload();
  };

  /* ---------- GET ALL ---------- */
  window.DBgetStudents = async function () {
    const { data, error } = await window.db
      .from("results")
      .select("id, name, school, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Error:", error.message);
      return [];
    }

    return data;
  };
});
