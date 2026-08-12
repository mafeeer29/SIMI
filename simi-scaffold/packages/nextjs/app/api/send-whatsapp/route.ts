import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const to = process.env.TWILIO_WHATSAPP_TO;
    const contentSid = process.env.TWILIO_CONTENT_SID;

    if (
      !accountSid ||
      !authToken ||
      !from ||
      !to ||
      !contentSid
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan variables de Twilio",
        },
        { status: 500 },
      );
    }

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      from,
      to,
      contentSid,
      contentVariables: JSON.stringify({
        "1": "SIMI",
        "2": "ahora",
      }),
    });

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
    });
  } catch (error: any) {
    console.error("Error Twilio completo:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ??
          "No se pudo enviar el WhatsApp",
        code: error?.code ?? null,
        status: error?.status ?? 500,
      },
      { status: 500 },
    );
  }
}