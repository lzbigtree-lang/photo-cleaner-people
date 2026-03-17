import { NextRequest, NextResponse } from "next/server";

const REPLICATE_API = "https://api.replicate.com/v1";

async function pollPrediction(id: string, token: string) {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`${REPLICATE_API}/predictions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.status === "succeeded") return data.output;
    if (data.status === "failed") throw new Error(data.error || "模型运行失败");
  }
  throw new Error("处理超时，请缩小图片后重试");
}

export async function POST(req: NextRequest) {
  const { token, image, x, y } = await req.json();
  if (!token) return NextResponse.json({ error: "缺少 API Token" }, { status: 400 });

  const res = await fetch(`${REPLICATE_API}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify({
      version: "fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83",
      input: {
        image,
        point_coords: [[x, y]],
        point_labels: [1],
        multimask_output: false,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.detail || "SAM 2 请求失败" }, { status: 500 });

  let output = data.output;
  if (!output && data.status !== "succeeded") {
    output = await pollPrediction(data.id, token);
  }

  const mask = Array.isArray(output) ? output[0] : output;
  return NextResponse.json({ mask: mask || null });
}
