import type { AiAnalysisResponse } from "@focusflow/types";

import { db } from "../db/memory-store";
import { createLogger } from "../utils/logger";

const log = createLogger({ service: "AiService" });

export class AiService {
  async analyze(
    userId: string,
    range: "week" | "month",
  ): Promise<AiAnalysisResponse> {
    const days = range === "week" ? 7 : 30;
    const startMs = Date.now() - days * 86_400_000;
    const records = db.recordsInRange(userId, startMs, Date.now());

    if (records.length === 0) {
      return {
        summary: "这段时间暂无记录，开始计时来获取 AI 分析吧！",
        insights: [],
        generatedAt: Date.now(),
      };
    }

    // If no API key — return smart mock based on actual data
    if (!process.env["ANTHROPIC_API_KEY"]) {
      log.warn(
        { userId },
        "ANTHROPIC_API_KEY not set — returning mock AI analysis",
      );
      return this.mockAnalysis(userId, records, range);
    }

    // Real API call
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({
      apiKey: process.env["ANTHROPIC_API_KEY"],
    });

    const bySubject = this.aggregateBySubject(records);

    const prompt = `
你是一位时间管理顾问。根据用户过去 ${days} 天的时间记录，给出分析报告。

数据（按分类汇总）：
${Object.entries(bySubject)
  .map(([name, secs]) => `- ${name}: ${(secs / 3600).toFixed(1)} 小时`)
  .join("\n")}

请返回 JSON：{"summary":"...（不超过80字）","insights":[{"type":"positive|warning|suggestion","title":"...","description":"...（不超过60字）"}]}
只返回 JSON，无其他文字。`;

    try {
      const msg = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";
      const parsed = JSON.parse(text) as {
        summary: string;
        insights: AiAnalysisResponse["insights"];
      };
      return { ...parsed, generatedAt: Date.now() };
    } catch (err) {
      log.error(
        { err, userId },
        "Claude API call failed — falling back to mock",
      );
      return this.mockAnalysis(userId, records, range);
    }
  }

  private aggregateBySubject(
    records: { subjectId: string | null; duration: number }[],
  ) {
    const map: Record<string, number> = {};
    for (const r of records) {
      const name = r.subjectId
        ? (db.subjects.get(r.subjectId)?.name ?? "未分类")
        : "未分类";
      map[name] = (map[name] ?? 0) + r.duration;
    }
    return map;
  }

  private mockAnalysis(
    _userId: string,
    records: { subjectId: string | null; duration: number }[],
    range: "week" | "month",
  ): AiAnalysisResponse {
    const total = records.reduce((s, r) => s + r.duration, 0);
    const avgHours = (total / 3600 / (range === "week" ? 7 : 30)).toFixed(1);
    const bySubject = this.aggregateBySubject(records);
    const topSubject = Object.entries(bySubject).sort((a, b) => b[1] - a[1])[0];

    return {
      summary: `本${range === "week" ? "周" : "月"}累计专注 ${(total / 3600).toFixed(1)} 小时，日均 ${avgHours} 小时。${topSubject ? `「${topSubject[0]}」投入最多。` : ""}`,
      insights: [
        {
          type: "positive",
          title: "保持专注习惯",
          description: `${range === "week" ? "本周" : "本月"}共完成 ${records.length} 次专注记录，习惯正在养成。`,
        },
        {
          type: "suggestion",
          title: "配置 AI 分析",
          description:
            "添加 ANTHROPIC_API_KEY 环境变量可获得个性化 AI 分析建议。",
        },
      ],
      generatedAt: Date.now(),
    };
  }
}
