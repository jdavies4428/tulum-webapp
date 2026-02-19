import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, startDate, endDate, sendTime, timezone } = body;

    // Validation
    if (!phoneNumber || !phoneNumber.startsWith("+")) {
      return NextResponse.json(
        { error: "Phone number must include country code (e.g., +1234567890)" },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return NextResponse.json(
        { error: "Start date cannot be in the past" },
        { status: 400 }
      );
    }

    if (end < start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    if (!sendTime || !["06:00", "07:00", "08:00", "09:00"].includes(sendTime)) {
      return NextResponse.json(
        { error: "Invalid send time. Must be between 06:00-09:00" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if subscription already exists for this phone number and overlapping dates
    const { data: existing, error: existingError } = await supabase
      .from("daily_updates_subscriptions")
      .select("id")
      .eq("phone_number", phoneNumber)
      .eq("status", "active")
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)
      .limit(1);

    if (existingError) {
      console.error("Error checking existing subscriptions:", existingError);
      return NextResponse.json(
        { error: "Failed to check existing subscriptions" },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "You already have an active subscription for these dates" },
        { status: 409 }
      );
    }

    // Create subscription
    const { data, error } = await supabase
      .from("daily_updates_subscriptions")
      .insert({
        phone_number: phoneNumber,
        start_date: startDate,
        end_date: endDate,
        send_time: sendTime,
        timezone: timezone || "America/Cancun",
        status: "active",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }

    // TODO: Send confirmation SMS via Twilio
    // This will be implemented once Twilio credentials are added
    // const confirmationMessage = `Hi! You're subscribed to Tulum Beach updates from ${startDate} to ${endDate}. You'll receive daily photos and forecasts at ${sendTime} Cancun time. Reply STOP to unsubscribe.`;

    return NextResponse.json({
      success: true,
      subscription: data,
      message: "Successfully subscribed to daily beach updates!",
    });
  } catch (e) {
    console.error("daily-updates subscribe error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to process subscription" },
      { status: 500 }
    );
  }
}
