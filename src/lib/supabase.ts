import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckvptxjdzjhieczzfiaw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdnB0eGpkempoaWVjenpmaWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjEwNTcsImV4cCI6MjA3NDI5NzA1N30.k92xj0sLXoqZ_ONZoFZjSg8nam5ht2q7AEZkgriB9GI';

export const supabase = createClient(supabaseUrl, supabaseKey);