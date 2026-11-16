import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ValidationError } from "@/domain/entities/BuildRequest";
import { container } from "@/infrastructure/container";
import { clientIp, createRateLimiter } from "@/infrastructure/http/rateLimit";

const allow = createRateLimiter(10, 10 * 60 * 1000);

export async function POST(request: Request) {
  if (!allow(clientIp(request.headers))) {
    return NextResponse.json({ message: "Слишком много заявок, попробуйте позже" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Некорректный JSON" }, { status: 400 });
  }

  try {
    const created = await container.submitMessengerRequest.execute(payload as Record<string, never>);
    revalidatePath("/admin", "layout");
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: "Некорректные данные", fields: error.fields }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: "Внутренняя ошибка" }, { status: 500 });
  }
}
