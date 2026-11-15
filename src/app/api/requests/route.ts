import { NextResponse } from "next/server";
import { ValidationError } from "@/domain/entities/BuildRequest";
import { container } from "@/infrastructure/container";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Некорректный JSON" }, { status: 400 });
  }

  try {
    const created = await container.submitBuildRequest.execute(payload as Record<string, never>);
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: "Проверьте поля формы", fields: error.fields }, { status: 422 });
    }
    console.error(error);
    return NextResponse.json({ message: "Внутренняя ошибка" }, { status: 500 });
  }
}
