import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { QuestionModel } from "@/lib/models";

export async function GET(): Promise<NextResponse> {
  await connectToDatabase();

  const subjects = await QuestionModel.aggregate<{
    subject: string;
    subjectSlug: string;
    totalQuestions: number;
  }>([
    {
      $group: {
        _id: "$subjectSlug",
        subjectSlug: { $first: "$subjectSlug" },
        subject: { $first: "$subject" },
        totalQuestions: { $sum: 1 },
      },
    },
    { $project: { _id: 0, subject: 1, subjectSlug: 1, totalQuestions: 1 } },
    { $sort: { subject: 1 } },
  ]);

  return NextResponse.json({ subjects });
}
