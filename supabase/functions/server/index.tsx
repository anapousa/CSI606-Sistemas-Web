import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-f2b5fafa/health", (c) => {
  return c.json({ status: "ok" });
});

app.post("/make-server-f2b5fafa/signup", async (c) => {
  try {
    const { username, email, password } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user }, 201);
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

app.get("/make-server-f2b5fafa/mcs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const mcs = await kv.get(`user:${user.id}:mcs`);
    return c.json({ mcs: mcs || [] });
  } catch (error) {
    console.log(`Error fetching MCs: ${error}`);
    return c.json({ error: 'Failed to fetch MCs' }, 500);
  }
});

app.post("/make-server-f2b5fafa/mcs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { mcs } = await c.req.json();
    await kv.set(`user:${user.id}:mcs`, mcs);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving MCs: ${error}`);
    return c.json({ error: 'Failed to save MCs' }, 500);
  }
});

app.get("/make-server-f2b5fafa/battles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const battles = await kv.get(`user:${user.id}:battles`);
    return c.json({ battles: battles || [] });
  } catch (error) {
    console.log(`Error fetching battles: ${error}`);
    return c.json({ error: 'Failed to fetch battles' }, 500);
  }
});

app.post("/make-server-f2b5fafa/battles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { battles } = await c.req.json();
    await kv.set(`user:${user.id}:battles`, battles);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving battles: ${error}`);
    return c.json({ error: 'Failed to save battles' }, 500);
  }
});

Deno.serve(app.fetch);