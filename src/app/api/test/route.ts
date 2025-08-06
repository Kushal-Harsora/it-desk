// /app/api/test-s3/route.ts
import { s3 } from "@/lib/utils";
import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      MaxKeys: 5,
    }));

    return NextResponse.json({
      success: true,
      message: "Successfully connected to S3",
      files: data.Contents ?? [],
    });
  } catch (error) {
    console.error("S3 connection failed:", error);
    return NextResponse.json({
      success: false,
      error: error,
    }, { status: 500 });
  }
}
