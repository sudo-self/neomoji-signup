const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SignupRequest {
  email: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const { email }: SignupRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Redis connection
    const redisUrl = "https://sought-ladybug-56216.upstash.io";
    const redisToken = "AduYAAIjcDFlNGZkZGRhZmQ1ZTE0YmRjYjcwOGNlMmYxOTg3NzJjYnAxMA";

    // Get current count
    const countResponse = await fetch(`${redisUrl}/get/neomoji:count`, {
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });
    
    const countData = await countResponse.json();
    const count = countData.result ?? 0;

    // Check if email already exists
    const emailCheckResponse = await fetch(`${redisUrl}/get/neomoji:email:${email}`, {
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });
    
    const emailCheckData = await emailCheckResponse.json();
    
    if (emailCheckData.result !== null) {
      return new Response(
        JSON.stringify({ error: "Email already signed up" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Store email with count
    await fetch(`${redisUrl}/set/neomoji:email:${email}/${count + 1}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });

    // Store count with email
    await fetch(`${redisUrl}/set/neomoji:email:${count + 1}/${email}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });

    // Increment counter
    await fetch(`${redisUrl}/incr/neomoji:count`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });

    // Send to Formspree
    try {
      await fetch("https://formspree.io/f/xgejnqyw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (formspreeError) {
      console.error("Formspree error:", formspreeError);
      // Continue even if Formspree fails
    }

    return new Response(
      JSON.stringify({ eligible: count < 20 }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("Signup error:", error);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});