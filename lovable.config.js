/** @type {import('lovable').Config} */
module.exports = {
  rootDir: ".",
  install: "npm ci || npm install",
  build: "npm run build",               // force the builder to use build
  preview: "npm run start",   
  env: {
    // Map any required env names so Lovable knows they exist; they can be empty for preview
    // SUPABASE_URL: process.env.SUPABASE_URL || "",
    // SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    PORT: process.env.PORT || "3000", 
  },
};
