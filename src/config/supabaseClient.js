// src/config/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Ambil URL dan Anon Key dari dashboard Supabase kamu (Project Settings -> API)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
