import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { messageSchema } from "@/lib/validation/schemas";
import { errorResponse, APIError } from "@/lib/utils/api";

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const { matchId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const before = searchParams.get("before");

    const supabase = createAdminClient();

    // マッチング権限チェック
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      throw new APIError("NOT_FOUND", "マッチングが見つかりません", 404);
    }

    if (
      match.user1_id !== session.userId &&
      match.user2_id !== session.userId
    ) {
      throw new APIError(
        "FORBIDDEN",
        "このマッチングにアクセスする権限がありません",
        403
      );
    }

    // メッセージ取得
    let query = supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt("id", before);
    }

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
      throw new APIError("INTERNAL_ERROR", "メッセージ取得に失敗しました", 500);
    }

    const formattedMessages = (messages || [])
      .reverse()
      .map((msg) => ({
        id: msg.id,
        senderId: msg.sender_id,
        content: msg.content,
        readAt: msg.read_at || null,
        createdAt: msg.created_at,
        isMine: msg.sender_id === session.userId,
      }));

    return NextResponse.json({
      success: true,
      data: {
        messages: formattedMessages,
        hasMore: messages && messages.length === limit,
        nextCursor: formattedMessages.length > 0 ? formattedMessages[0].id : null,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Get messages error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const { matchId } = params;
    const body = await request.json();
    const validated = messageSchema.parse(body);

    const supabase = createAdminClient();

    // マッチング権限チェック
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      throw new APIError("NOT_FOUND", "マッチングが見つかりません", 404);
    }

    if (
      match.user1_id !== session.userId &&
      match.user2_id !== session.userId
    ) {
      throw new APIError(
        "FORBIDDEN",
        "このマッチングにアクセスする権限がありません",
        403
      );
    }

    // メッセージ送信
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        match_id: matchId,
        sender_id: session.userId,
        content: validated.content,
      })
      .select()
      .single();

    if (messageError) {
      throw new APIError("INTERNAL_ERROR", "メッセージ送信に失敗しました", 500);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: {
            id: message.id,
            senderId: message.sender_id,
            content: message.content,
            createdAt: message.created_at,
            isMine: true,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse(
        new APIError(
          "VALIDATION_ERROR",
          "入力内容に誤りがあります",
          400,
          error
        )
      );
    }

    console.error("Send message error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

