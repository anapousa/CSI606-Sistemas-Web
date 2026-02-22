import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "npm:jose@5";

const app = new Hono();

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const JWT_SECRET = Deno.env.get('SUPABASE_JWT_SECRET') ?? '';

async function validateToken(authHeader: string | undefined): Promise<{ user_id: string } | null> {
  try {
    console.log('🔐 Validating token...');
    console.log('🔑 JWT_SECRET exists?', !!JWT_SECRET);
    console.log('🔑 JWT_SECRET length:', JWT_SECRET?.length);
    console.log('🌐 SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
    console.log('🔑 SERVICE_ROLE_KEY exists?', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    
    if (!authHeader) {
      console.error('❌ No Authorization header');
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🎫 Token (first 30 chars):', token.substring(0, 30) + '...');
    console.log('🎫 Token length:', token.length);

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    console.log('User from getUser:', user?.id);
    console.log('Error from getUser:', error);

    if (error || !user) {
      console.error('Token validation failed:', error?.message);
      return null;
    }

    return { user_id: user.id };
  } catch (error) {
    console.error('❌ Exception during token validation:', error);
    return null;
  }
}

async function getAuthenticatedUser(authHeader: string | undefined) {
  if (!authHeader) {
    return { user: null, error: 'Missing authorization header' };
  }

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );

  // Get the authenticated user
  const { data: { user }, error } = await supabaseUser.auth.getUser();

  if (error || !user) {
    return { user: null, error: error?.message || 'Unauthorized' };
  }

  return { user, error: null };
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
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

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
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
    console.log('🔍 GET /mcs called');
    console.log('📋 All headers:', Object.fromEntries(c.req.raw.headers.entries()));
    
    const authHeader = c.req.header('Authorization');
    console.log('🔐 Authorization header:', authHeader);
    
    if (!authHeader) {
      console.error('❌ Missing Authorization header');
      return c.json({ code: 401, message: 'Missing authorization header' }, 401);
    }
    
    const accessToken = authHeader.split(' ')[1];
    console.log('🎫 Access token (first 30 chars):', accessToken?.substring(0, 30) + '...');
    
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );
    
    const { data: { user }, error } = await supabaseUser.auth.getUser();
    console.log('👤 User from token:', user?.id);
    console.log('❌ Auth error:', error);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized', details: error?.message }, 401);
    }

    const { data: mcs, error: dbError } = await supabaseAdmin
      .from('mcs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.log(`Database error fetching MCs: ${dbError.message}`)
      return c.json({ error: 'Failed to fetch MCs from database' }, 500);
    }

    return c.json({ mcs: mcs || [] });
  } catch (error) {
    console.log(`Error fetching MCs: ${error}`);
    return c.json({ error: 'Failed to fetch MCs' }, 500);
  }
});

app.post("/make-server-f2b5fafa/mcs", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await getAuthenticatedUser(authHeader);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { mcs } = await c.req.json();

    // Delete all existing MCs for this user
    const { error: deleteError } = await supabaseAdmin
      .from('mcs')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.log(`Error deleting old MCs: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete old MCs' }, 500);
    }

    if (mcs && mcs.length > 0) {
      const mcsToInsert = mcs.map((mc: any) => ({
        id: mc.id,
        user_id: user.id,
        name: mc.name,
        wins: mc.wins || 0,
        losses: mc.losses || 0,
        draws: mc.draws || 0,
        total_battles: mc.totalBattles || 0,
      }));

      const { error: insertError } = await supabaseAdmin
        .from('mcs')
        .insert(mcsToInsert);

      if (insertError) {
        console.log(`Error inserting MCs: ${insertError.message}`);
        return c.json({ error: 'Failed to insert MCs' }, 500);
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving MCs: ${error}`);
    return c.json({ error: 'Failed to save MCs' }, 500);
  }
});


app.get("/make-server-f2b5fafa/battles", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await getAuthenticatedUser(authHeader);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { data: battles, error: battlesError } = await supabaseAdmin
      .from('battles')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (battlesError) {
      console.log(`Database error fetching battles: ${battlesError.message}`);
      return c.json({ error: 'Failed to fetch battles from database' }, 500);
    }

    const battlesWithParticipants = await Promise.all(
      (battles || []).map(async (battle) => {
        const { data: participants, error: participantsError } = await supabaseAdmin
          .from('battle_participants')
          .select('*')
          .eq('battle_id', battle.id);

        if (participantsError) {
          console.log(`Error fetching participants for battle ${battle.id}: ${participantsError.message}`);
          return {
            ...battle,
            participants: []
          };
        }

        return {
          id: battle.id,
          date: battle.date,
          location: battle.location,
          type: battle.type,
          participants: participants.map(p => ({
            mcId: p.mc_id,
            opponent: p.opponent,
            result: p.result
          }))
        };
      })
    );

    return c.json({ battles: battlesWithParticipants });
  } catch (error) {
    console.log(`Error fetching battles: ${error}`);
    return c.json({ error: 'Failed to fetch battles' }, 500);
  }
});

app.post("/make-server-f2b5fafa/battles", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await getAuthenticatedUser(authHeader);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { battles } = await c.req.json();

    const { error: deleteError } = await supabaseAdmin
      .from('battles')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.log(`Error deleting old battles: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete old battles' }, 500);
    }

    if (battles && battles.length > 0) {
      for (const battle of battles) {
        const { data: insertedBattle, error: battleError } = await supabaseAdmin
          .from('battles')
          .insert({
            id: battle.id,
            user_id: user.id,
            date: battle.date,
            location: battle.location || null,
            type: battle.type || 'beat',
          })
          .select()
          .single();

        if (battleError) {
          console.log(`Error inserting battle: ${battleError.message}`);
          continue;
        }

        // Insert participants
        if (battle.participants && battle.participants.length > 0) {
          const participantsToInsert = battle.participants.map((p: any) => ({
            battle_id: insertedBattle.id,
            mc_id: p.mcId,
            opponent: p.opponent,
            result: p.result || null,
          }));

          const { error: participantsError } = await supabaseAdmin
            .from('battle_participants')
            .insert(participantsToInsert);

          if (participantsError) {
            console.log(`Error inserting participants for battle ${insertedBattle.id}: ${participantsError.message}`);
          }
        }
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving battles: ${error}`);
    return c.json({ error: 'Failed to save battles' }, 500);
  }
});

app.delete("/make-server-f2b5fafa/mcs/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await getAuthenticatedUser(authHeader);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const mcId = c.req.param('id');

    const { error: deleteError } = await supabaseAdmin
      .from('mcs')
      .delete()
      .eq('id', mcId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.log(`Error deleting MC: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete MC' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting MC: ${error}`);
    return c.json({ error: 'Failed to delete MC' }, 500);
  }
});

app.delete("/make-server-f2b5fafa/battles/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await getAuthenticatedUser(authHeader);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const battleId = c.req.param('id');

    const { error: deleteError } = await supabaseAdmin
      .from('battles')
      .delete()
      .eq('id', battleId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.log(`Error deleting battle: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete battle' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting battle: ${error}`);
    return c.json({ error: 'Failed to delete battle' }, 500);
  }
});

app.get("/make-server-f2b5fafa/stats", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user, error: authError } = await getAuthenticatedUser(authHeader);
    
    if (!user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { data: topMcs, error: mcsError } = await supabaseAdmin
      .from('mcs')
      .select('*')
      .eq('user_id', user.id)
      .order('wins', { ascending: false })
      .limit(10);

    if (mcsError) {
      console.log(`Error fetching top MCs: ${mcsError.message}`);
    }

    const { data: upcomingBattles, error: battlesError } = await supabaseAdmin
      .from('battles')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(5);

    if (battlesError) {
      console.log(`Error fetching upcoming battles: ${battlesError.message}`);
    }

    return c.json({
      topMcs: topMcs || [],
      upcomingBattles: upcomingBattles || [],
    });
  } catch (error) {
    console.log(`Error fetching stats: ${error}`);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

Deno.serve(app.fetch);