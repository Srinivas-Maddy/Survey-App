import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Survey from "@/models/Survey";
import SurveyResponse from "@/models/Response";
import User from "@/models/User";

export async function GET() {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const [surveyCount, responseCount, userCount, surveys, dbStats] = await Promise.all([
      Survey.countDocuments({ userId: auth.userId }),
      SurveyResponse.countDocuments({
        surveyId: { $in: await Survey.find({ userId: auth.userId }).distinct("_id") },
      }),
      User.countDocuments(),
      Survey.aggregate([
        { $match: { userId: auth.userId } },
        {
          $lookup: {
            from: "responses",
            localField: "_id",
            foreignField: "surveyId",
            as: "responses",
          },
        },
        {
          $project: {
            title: 1,
            createdAt: 1,
            isActive: 1,
            questionCount: { $size: "$questions" },
            responseCount: { $size: "$responses" },
            oldestResponse: { $min: "$responses.submittedAt" },
            newestResponse: { $max: "$responses.submittedAt" },
          },
        },
        { $sort: { responseCount: -1 } },
      ]),
      mongoose.connection.db!.stats(),
    ]);

    const storageTotalMB = 512;
    const storageUsedBytes = dbStats.dataSize + dbStats.indexSize;
    const storageUsedMB = parseFloat((storageUsedBytes / (1024 * 1024)).toFixed(2));
    const storageFreeMB = parseFloat((storageTotalMB - storageUsedMB).toFixed(2));
    const storagePercent = parseFloat(((storageUsedMB / storageTotalMB) * 100).toFixed(1));

    // Get per-collection sizes
    const collections = await mongoose.connection.db!.listCollections().toArray();
    const collectionStats: { name: string; sizeBytes: number; count: number }[] = [];
    for (const col of collections) {
      try {
        const coll = mongoose.connection.db!.collection(col.name);
        const stats = await coll.aggregate([
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              avgSize: { $avg: { $bsonSize: "$$ROOT" } },
            },
          },
        ]).toArray();
        if (stats.length > 0) {
          collectionStats.push({
            name: col.name,
            sizeBytes: Math.round(stats[0].avgSize * stats[0].count),
            count: stats[0].count,
          });
        }
      } catch {
        // skip if $bsonSize not supported
      }
    }
    collectionStats.sort((a, b) => b.sizeBytes - a.sizeBytes);

    return NextResponse.json({
      surveyCount,
      responseCount,
      userCount,
      surveys,
      storage: {
        totalMB: storageTotalMB,
        usedMB: storageUsedMB,
        freeMB: storageFreeMB,
        percent: storagePercent,
        usedBytes: storageUsedBytes,
        collections: collectionStats,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
