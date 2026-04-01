import type { CreateTimeRecord, TimeRecord } from "@focusflow/types";
import { HTTPException } from "hono/http-exception";

import { db, type TimeRecordRow } from "../db/memory-store";
import { createLogger } from "../utils/logger";

const log = createLogger({ service: "TimeRecordService" });

export class TimeRecordService {
  async create(userId: string, body: CreateTimeRecord): Promise<TimeRecord> {
    log.debug(
      { userId, mode: body.mode, duration: body.duration },
      "Creating time record",
    );

    if (body.duration < 1) {
      throw new HTTPException(422, {
        message: "Duration must be at least 1 second",
      });
    }

    const record: TimeRecordRow = {
      id: db.newId(),
      userId,
      subjectId: body.subjectId,
      mode: body.mode,
      duration: body.duration,
      startTime: body.startTime,
      endTime: body.endTime,
      createdAt: db.now(),
    };
    db.timeRecords.set(record.id, record);

    // Insert pause records
    for (const p of body.pauses) {
      db.pauseRecords.set(db.newId(), {
        id: db.newId(),
        timeRecordId: record.id,
        startTime: p.startTime,
        endTime: p.endTime,
      });
    }

    log.info(
      { userId, recordId: record.id, duration: record.duration },
      "✓ Time record saved",
    );
    return this.toTimeRecord(record);
  }

  async list(
    userId: string,
    params: { subjectId?: string; limit?: number; page?: number },
  ): Promise<TimeRecord[]> {
    const { limit = 20, page = 1, subjectId } = params;
    const offset = (page - 1) * limit;

    let records = db
      .findMany(db.timeRecords, (r) => r.userId === userId)
      .sort((a, b) => b.startTime - a.startTime);

    if (subjectId) records = records.filter((r) => r.subjectId === subjectId);

    return records
      .slice(offset, offset + limit)
      .map((r) => this.toTimeRecord(r));
  }

  async delete(userId: string, id: string): Promise<void> {
    const record = db.timeRecords.get(id);
    if (!record) throw new HTTPException(404, { message: "Record not found" });
    if (record.userId !== userId)
      throw new HTTPException(403, { message: "Forbidden" });

    // Cascade delete pause records
    for (const [pid, p] of db.pauseRecords.entries()) {
      if (p.timeRecordId === id) db.pauseRecords.delete(pid);
    }
    db.timeRecords.delete(id);
    log.info({ userId, recordId: id }, "✓ Time record deleted");
  }

  private toTimeRecord(row: TimeRecordRow): TimeRecord {
    const pauses = db.findMany(
      db.pauseRecords,
      (p) => p.timeRecordId === row.id,
    );
    return {
      id: row.id,
      userId: row.userId,
      subjectId: row.subjectId,
      mode: row.mode,
      duration: row.duration,
      startTime: row.startTime,
      endTime: row.endTime,
      pauses: pauses.map((p) => ({
        id: p.id,
        timeRecordId: p.timeRecordId,
        startTime: p.startTime,
        endTime: p.endTime,
      })),
      createdAt: row.createdAt,
    };
  }
}
