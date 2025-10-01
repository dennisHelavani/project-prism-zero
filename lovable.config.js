/** @type {import('lovable').Config} */
module.exports = {
  rootDir: ".",
  install: "npm ci || npm install",
  build: "next build",
  preview: "next start -p 3000",
  env: {
    // Map any required env names so Lovable knows they exist; they can be empty for preview
    // SUPABASE_URL: process.env.SUPABASE_URL || "",
    // SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  },
};
