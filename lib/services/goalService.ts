import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/mongodb";
import { WeeklyGoal } from "@/lib/db/models/WeeklyGoal";
import { MonthlyGoal } from "@/lib/db/models/MonthlyGoal";
import { AnnualGoal } from "@/lib/db/models/AnnualGoal";
import type { WeeklyGoalDto, MonthlyGoalDto, AnnualGoalDto } from "@/types/app";

function toWeeklyDto(doc: {
  _id: Types.ObjectId;
  weekStart: string;
  title: string;
  completed: boolean;
  sortOrder: number;
}): WeeklyGoalDto {
  return {
    id: doc._id.toString(),
    weekStart: doc.weekStart,
    title: doc.title,
    completed: doc.completed,
    sortOrder: doc.sortOrder,
  };
}

function toMonthlyDto(doc: {
  _id: Types.ObjectId;
  year: number;
  month: number;
  title: string;
  completed: boolean;
  sortOrder: number;
}): MonthlyGoalDto {
  return {
    id: doc._id.toString(),
    year: doc.year,
    month: doc.month,
    title: doc.title,
    completed: doc.completed,
    sortOrder: doc.sortOrder,
  };
}

function toAnnualDto(doc: {
  _id: Types.ObjectId;
  year: number;
  title: string;
  completed: boolean;
  sortOrder: number;
}): AnnualGoalDto {
  return {
    id: doc._id.toString(),
    year: doc.year,
    title: doc.title,
    completed: doc.completed,
    sortOrder: doc.sortOrder,
  };
}

export async function getWeeklyGoals(
  userId: string,
  weekStart: string,
): Promise<WeeklyGoalDto[]> {
  await connectMongo();
  const goals = await WeeklyGoal.find({ userId, weekStart })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return goals.map(toWeeklyDto);
}

export async function createWeeklyGoal(
  userId: string,
  weekStart: string,
  title: string,
): Promise<WeeklyGoalDto> {
  await connectMongo();
  const count = await WeeklyGoal.countDocuments({ userId, weekStart });
  const goal = await WeeklyGoal.create({ userId, weekStart, title, sortOrder: count });
  return toWeeklyDto(goal);
}

export async function updateWeeklyGoal(
  userId: string,
  goalId: string,
  data: { title?: string; completed?: boolean },
): Promise<WeeklyGoalDto | null> {
  await connectMongo();
  if (!Types.ObjectId.isValid(goalId)) return null;
  const goal = await WeeklyGoal.findOneAndUpdate(
    { _id: goalId, userId },
    { $set: data },
    { returnDocument: "after" },
  ).lean();
  return goal ? toWeeklyDto(goal) : null;
}

export async function deleteWeeklyGoal(userId: string, goalId: string): Promise<boolean> {
  await connectMongo();
  if (!Types.ObjectId.isValid(goalId)) return false;
  const result = await WeeklyGoal.deleteOne({ _id: goalId, userId });
  return result.deletedCount === 1;
}

export async function getMonthlyGoals(
  userId: string,
  year: number,
  month: number,
): Promise<MonthlyGoalDto[]> {
  await connectMongo();
  const goals = await MonthlyGoal.find({ userId, year, month })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return goals.map(toMonthlyDto);
}

export async function createMonthlyGoal(
  userId: string,
  year: number,
  month: number,
  title: string,
): Promise<MonthlyGoalDto> {
  await connectMongo();
  const count = await MonthlyGoal.countDocuments({ userId, year, month });
  const goal = await MonthlyGoal.create({ userId, year, month, title, sortOrder: count });
  return toMonthlyDto(goal);
}

export async function updateMonthlyGoal(
  userId: string,
  goalId: string,
  data: { title?: string; completed?: boolean },
): Promise<MonthlyGoalDto | null> {
  await connectMongo();
  if (!Types.ObjectId.isValid(goalId)) return null;
  const goal = await MonthlyGoal.findOneAndUpdate(
    { _id: goalId, userId },
    { $set: data },
    { returnDocument: "after" },
  ).lean();
  return goal ? toMonthlyDto(goal) : null;
}

export async function deleteMonthlyGoal(userId: string, goalId: string): Promise<boolean> {
  await connectMongo();
  if (!Types.ObjectId.isValid(goalId)) return false;
  const result = await MonthlyGoal.deleteOne({ _id: goalId, userId });
  return result.deletedCount === 1;
}

export async function getAnnualGoals(
  userId: string,
  year: number,
): Promise<AnnualGoalDto[]> {
  await connectMongo();
  const goals = await AnnualGoal.find({ userId, year })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return goals.map(toAnnualDto);
}

export async function createAnnualGoal(
  userId: string,
  year: number,
  title: string,
): Promise<AnnualGoalDto> {
  await connectMongo();
  const count = await AnnualGoal.countDocuments({ userId, year });
  const goal = await AnnualGoal.create({ userId, year, title, sortOrder: count });
  return toAnnualDto(goal);
}

export async function updateAnnualGoal(
  userId: string,
  goalId: string,
  data: { title?: string; completed?: boolean },
): Promise<AnnualGoalDto | null> {
  await connectMongo();
  if (!Types.ObjectId.isValid(goalId)) return null;
  const goal = await AnnualGoal.findOneAndUpdate(
    { _id: goalId, userId },
    { $set: data },
    { returnDocument: "after" },
  ).lean();
  return goal ? toAnnualDto(goal) : null;
}

export async function deleteAnnualGoal(userId: string, goalId: string): Promise<boolean> {
  await connectMongo();
  if (!Types.ObjectId.isValid(goalId)) return false;
  const result = await AnnualGoal.deleteOne({ _id: goalId, userId });
  return result.deletedCount === 1;
}
