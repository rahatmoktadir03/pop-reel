import { NextResponse } from "next/server";
import { WeaviateClient } from "weaviate-ts-client";

const client = new WeaviateClient({
  scheme: "https",
  host: process.env.WEAVIATE_HOST,
});

export async function GET() {
  try {
    const recommendations = await client.graphql
      .get()
      .withClassName("Video")
      .withFields("title url likes")
      .withNearText({ concepts: ["entertainment", "popular"] })
      .withLimit(10)
      .do();

    return NextResponse.json(recommendations.data.Get.Video);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
