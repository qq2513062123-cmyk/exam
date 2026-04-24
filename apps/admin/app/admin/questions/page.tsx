"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Download,
  FileQuestion,
  FileSpreadsheet,
  Search,
  Sparkles,
  Upload
} from "lucide-react";

import PageIntro from "../../../components/PageIntro";
import { Alert } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { ErrorState } from "../../../components/ui/error-state";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { LoadingState } from "../../../components/ui/loading-state";
import { Pagination } from "../../../components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Textarea } from "../../../components/ui/textarea";
import { createQuestion, deleteQuestion, listQuestions, Question, QuestionType, updateQuestion } from "../../../lib/api";

type QuestionForm = {
  type: QuestionType;
  stem: string;
  optionsText: string;
  correct_answer: string;
  score: string;
};

type TypeConfig = {
  label: string;
  description: string;
  optionsLabel: string;
  optionsHint: string;
  optionsPlaceholder: string;
  answerLabel: string;
  answerHint: string;
  defaultOptions: string;
  defaultAnswer: string;
  defaultScore: string;
};

type ParsedImportQuestion = {
  type: QuestionType;
  stem: string;
  options: string[] | null;
  correct_answer: string | null;
  score: number;
};

type ImportPreviewItem = {
  stem: string;
  type: QuestionType;
  score: number;
};

const PAGE_SIZE = 10;

const typeConfigs: Record<QuestionType, TypeConfig> = {
  single_choice: {
    label: "单选题",
    description: "适合标准选择题。题干写问题，选项按 A/B/C/D 填写即可。",
    optionsLabel: "选项 JSON",
    optionsHint: "请按 JSON 数组填写，系统会按顺序展示并自动识别 A/B/C/D。",
    optionsPlaceholder: '["A. 选项一", "B. 选项二", "C. 选项三", "D. 选项四"]',
    answerLabel: "正确答案",
    answerHint: "填写 A、B、C、D 这类选项标识。",
    defaultOptions: '["A. 选项一", "B. 选项二", "C. 选项三", "D. 选项四"]',
    defaultAnswer: "A",
    defaultScore: "5"
  },
  true_false: {
    label: "判断题",
    description: "适合判断正误。你可以填“正确/错误”，系统会自动转成内部值。",
    optionsLabel: "选项 JSON",
    optionsHint: "判断题通常不需要改这里，系统默认按“正确 / 错误”处理。",
    optionsPlaceholder: '["正确", "错误"]',
    answerLabel: "正确答案",
    answerHint: "直接填写“正确”或“错误”即可。",
    defaultOptions: '["正确", "错误"]',
    defaultAnswer: "正确",
    defaultScore: "2"
  },
  short_answer: {
    label: "简答题",
    description: "适合主观题。选项可以留空，正确答案里可写评分要点或参考答案。",
    optionsLabel: "参考选项 JSON（可留空）",
    optionsHint: "简答题一般不需要选项，这里可以留空。",
    optionsPlaceholder: "",
    answerLabel: "参考答案",
    answerHint: "可填写参考答案或评分要点，便于后续复核。",
    defaultOptions: "",
    defaultAnswer: "",
    defaultScore: "10"
  }
};

const defaultType: QuestionType = "single_choice";

const emptyForm: QuestionForm = {
  type: defaultType,
  stem: "",
  optionsText: typeConfigs[defaultType].defaultOptions,
  correct_answer: typeConfigs[defaultType].defaultAnswer,
  score: typeConfigs[defaultType].defaultScore
};

function parseOptions(value: string): unknown | null {
  if (!value.trim()) {
    return null;
  }

  return JSON.parse(value);
}

function toForm(question: Question): QuestionForm {
  return {
    type: question.type,
    stem: question.stem,
    optionsText: question.options ? JSON.stringify(question.options, null, 2) : "",
    correct_answer: question.correct_answer || "",
    score: String(question.score)
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

function formatQuestionType(type: QuestionType) {
  return typeConfigs[type].label;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_\-（）()]/g, "");
}

function getRowText(row: Record<string, unknown>, aliases: string[]) {
  const aliasSet = new Set(aliases.map((alias) => normalizeHeader(alias)));

  for (const [key, value] of Object.entries(row)) {
    if (aliasSet.has(normalizeHeader(key)) && value !== null && value !== undefined) {
      return String(value).trim();
    }
  }

  return "";
}

function resolveQuestionType(value: string): QuestionType | null {
  const normalized = normalizeHeader(value);

  if (["singlechoice", "single_choice", "choice", "单选题", "单选"].includes(normalized)) {
    return "single_choice";
  }

  if (["truefalse", "true_false", "判断题", "判断"].includes(normalized)) {
    return "true_false";
  }

  if (["shortanswer", "short_answer", "简答题", "简答"].includes(normalized)) {
    return "short_answer";
  }

  return null;
}

function normalizeTrueFalseAnswer(value: string) {
  const normalized = value.trim().toLowerCase();

  if (["正确", "对", "true"].includes(normalized)) {
    return "正确";
  }

  if (["错误", "错", "false"].includes(normalized)) {
    return "错误";
  }

  return value.trim();
}

function toLetter(index: number) {
  return String.fromCharCode(65 + index);
}

function ensureChoiceLabel(value: string, index: number) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^[A-Za-z][.)\s]/.test(trimmed)) {
    return trimmed;
  }

  return `${toLetter(index)}. ${trimmed}`;
}

function parseOptionsFromRow(type: QuestionType, row: Record<string, unknown>) {
  if (type === "short_answer") {
    return null;
  }

  if (type === "true_false") {
    return ["正确", "错误"];
  }

  const optionsJson = getRowText(row, ["options", "options_json", "选项", "选项json"]);

  if (optionsJson) {
    try {
      const parsed = JSON.parse(optionsJson);

      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => ensureChoiceLabel(String(item), index)).filter(Boolean);
      }
    } catch {
      // fall through to column parsing
    }
  }

  const optionValues = ["option_a", "option_b", "option_c", "option_d", "选项A", "选项B", "选项C", "选项D"];
  const collected: string[] = [];

  for (let index = 0; index < 4; index += 1) {
    const value = getRowText(row, [optionValues[index], `选项${toLetter(index)}`]);

    if (value) {
      collected.push(ensureChoiceLabel(value, index));
    }
  }

  return collected.length > 0 ? collected : null;
}

function parseImportQuestions(rows: Array<Record<string, unknown>>) {
  const parsed: ParsedImportQuestion[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const typeText = getRowText(row, ["type", "题型"]);
    const type = resolveQuestionType(typeText);

    if (!type) {
      errors.push(`第 ${rowNumber} 行：题型无效，请填写单选题 / 判断题 / 简答题。`);
      return;
    }

    const stem = getRowText(row, ["stem", "题干", "question", "题目"]);

    if (!stem) {
      errors.push(`第 ${rowNumber} 行：题干不能为空。`);
      return;
    }

    const scoreText = getRowText(row, ["score", "分值", "分数"]);
    const score = Number(scoreText || "0");

    if (!Number.isFinite(score) || score < 0) {
      errors.push(`第 ${rowNumber} 行：分值必须是大于等于 0 的数字。`);
      return;
    }

    const correctAnswerText = getRowText(row, ["correct_answer", "correctanswer", "正确答案", "参考答案", "答案"]);
    const options = parseOptionsFromRow(type, row);

    if (type === "single_choice") {
      if (!options || options.length < 2) {
        errors.push(`第 ${rowNumber} 行：单选题至少需要两项选项。`);
        return;
      }

      const answer = correctAnswerText.toUpperCase();

      if (!["A", "B", "C", "D"].includes(answer)) {
        errors.push(`第 ${rowNumber} 行：单选题正确答案请填写 A / B / C / D。`);
        return;
      }

      parsed.push({
        type,
        stem,
        options,
        correct_answer: answer,
        score
      });
      return;
    }

    if (type === "true_false") {
      const answer = normalizeTrueFalseAnswer(correctAnswerText);

      if (!["正确", "错误"].includes(answer)) {
        errors.push(`第 ${rowNumber} 行：判断题正确答案请填写“正确”或“错误”。`);
        return;
      }

      parsed.push({
        type,
        stem,
        options,
        correct_answer: answer,
        score
      });
      return;
    }

    parsed.push({
      type,
      stem,
      options: null,
      correct_answer: correctAnswerText || null,
      score
    });
  });

  return { parsed, errors };
}

function createTemplateCsv() {
  const rows = [
    ["题型", "题干", "选项A", "选项B", "选项C", "选项D", "正确答案", "分值"],
    ["单选题", "以下哪一项属于关系型数据库？", "MySQL", "Redis", "JWT", "HTML", "A", "5"],
    ["判断题", "PostgreSQL 属于关系型数据库。", "", "", "", "", "正确", "2"],
    ["简答题", "请简述 JWT 的三个组成部分。", "", "", "", "", "Header / Payload / Signature", "10"]
  ];

  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  return `\uFEFF${csv}`;
}

function pickImportSheetName(workbook: import("xlsx").WorkBook, XLSX: typeof import("xlsx")) {
  const namedSheet = workbook.SheetNames.find(
    (sheetName) => normalizeHeader(sheetName) === normalizeHeader("题库导入")
  );

  if (namedSheet) {
    return namedSheet;
  }

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      continue;
    }

    const previewRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: ""
    });
    const firstRow = previewRows[0];

    if (!firstRow) {
      continue;
    }

    const headers = Object.keys(firstRow).map((header) => normalizeHeader(header));
    const hasType = headers.some((header) => ["题型", "type"].map(normalizeHeader).includes(header));
    const hasStem = headers.some((header) => ["题干", "stem", "question", "题目"].map(normalizeHeader).includes(header));

    if (hasType && hasStem) {
      return sheetName;
    }
  }

  return workbook.SheetNames[0];
}

export default function AdminQuestionsPage() {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [importError, setImportError] = useState("");
  const [message, setMessage] = useState("");
  const [importSummary, setImportSummary] = useState("");
  const [importSummaryTone, setImportSummaryTone] = useState<"success" | "error">("success");
  const [importPreview, setImportPreview] = useState<ImportPreviewItem[]>([]);
  const [lastImportedCount, setLastImportedCount] = useState(0);

  const typeConfig = typeConfigs[form.type];

  async function loadQuestions() {
    setLoading(true);
    setListError("");

    try {
      const data = await listQuestions();
      setQuestions(data.questions);
    } catch (error) {
      setListError(error instanceof Error ? error.message : "加载题库失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const filteredQuestions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return questions;
    }

    return questions.filter((question) => question.stem.toLowerCase().includes(normalizedKeyword));
  }, [questions, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedQuestions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredQuestions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredQuestions, page]);

  function applyTypePreset(nextType: QuestionType) {
    const nextConfig = typeConfigs[nextType];

    setForm((current) => ({
      ...current,
      type: nextType,
      optionsText:
        current.optionsText.trim() === "" || current.optionsText === typeConfigs[current.type].defaultOptions
          ? nextConfig.defaultOptions
          : current.optionsText,
      correct_answer:
        current.correct_answer.trim() === "" || current.correct_answer === typeConfigs[current.type].defaultAnswer
          ? nextConfig.defaultAnswer
          : current.correct_answer,
      score: current.score === typeConfigs[current.type].defaultScore ? nextConfig.defaultScore : current.score
    }));
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
    setMessage("");
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setImportError("");
    setMessage("");

    try {
      const payload = {
        type: form.type,
        stem: form.stem,
        options: parseOptions(form.optionsText),
        correct_answer: form.correct_answer.trim() || null,
        score: Number(form.score)
      };

      if (editingId) {
        await updateQuestion(editingId, payload);
        setMessage("题目已更新。");
      } else {
        await createQuestion(payload);
        setMessage("题目已创建。");
      }

      resetForm();
      await loadQuestions();
    } catch (error) {
      if (error instanceof SyntaxError) {
        setFormError("选项 JSON 格式不正确，请先修正后再提交。");
      } else {
        setFormError(error instanceof Error ? error.message : "保存题目失败");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(question: Question) {
    const confirmed = window.confirm(`确定删除这道题吗？\n\n${question.stem}`);

    if (!confirmed) {
      return;
    }

    setDeletingId(question.id);
    setFormError("");
    setImportError("");
    setMessage("");

    try {
      await deleteQuestion(question.id);
      setMessage("题目已删除。");

      if (editingId === question.id) {
        resetForm();
      }

      await loadQuestions();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "删除题目失败");
    } finally {
      setDeletingId("");
    }
  }

  function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setImportFile(file);
    setImportError("");
    setImportSummary("");
    setImportSummaryTone("success");
    setImportPreview([]);
    setLastImportedCount(0);
    setMessage("");

    if (file) {
      void handleImportQuestions(file);
    }
  }

  function handleDownloadTemplate() {
    const blob = new Blob([createTemplateCsv()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "question-import-template.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  async function handleImportQuestions(selectedFile?: File) {
    const file = selectedFile ?? importFile;

    if (!file) {
      setImportError("请先选择一个 Excel 或 CSV 文件。");
      return;
    }

    setImporting(true);
    setImportError("");
    setImportSummary("");
    setImportSummaryTone("success");
    setImportPreview([]);
    setLastImportedCount(0);
    setMessage("");

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = pickImportSheetName(workbook, XLSX);

      if (!sheetName) {
        throw new Error("导入文件中没有可读取的工作表。");
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: ""
      });

      if (rows.length === 0) {
        throw new Error("导入文件为空，请至少保留一行题目数据。");
      }

      const { parsed, errors } = parseImportQuestions(rows);

      if (errors.length > 0) {
        setImportError(errors.slice(0, 5).join(" "));
        setImportSummaryTone("error");
        setImportSummary(`共发现 ${errors.length} 个问题，请先修正模板再导入。`);
        return;
      }

      for (let index = 0; index < parsed.length; index += 1) {
        const question = parsed[index];

        try {
          await createQuestion(question);
        } catch (error) {
          throw new Error(
            `第 ${index + 1} 道题导入失败：${error instanceof Error ? error.message : "保存题目失败"}`
          );
        }
      }

      setImportSummary(`已成功导入 ${parsed.length} 道题。`);
      setMessage(`批量导入完成，新增 ${parsed.length} 道题。`);
      setImportPreview(
        parsed.slice(0, 6).map((question) => ({
          stem: question.stem,
          type: question.type,
          score: question.score
        }))
      );
      setLastImportedCount(parsed.length);
      setImportFile(null);
      if (importInputRef.current) {
        importInputRef.current.value = "";
      }
      await loadQuestions();
      setKeyword("");
      setPage(1);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "导入失败，请检查模板内容。");
      setImportSummaryTone("error");
      setImportSummary("导入未完成，请根据提示修正后重新选择文件。");
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="space-y-8">
      <PageIntro
        eyebrow="Question Bank"
        title="题库管理"
        description="你可以逐题创建，也可以直接下载模板后批量导入。页面会按题型给出填写提示，不需要再去猜字段和格式。"
      />

      {message ? <Alert tone="success">{message}</Alert> : null}
      {formError ? <Alert>{formError}</Alert> : null}
      {importError ? <Alert>{importError}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileQuestion className="h-5 w-5 text-blue-700" />
                    {editingId ? "编辑题目" : "新增题目"}
                  </CardTitle>
                  <CardDescription className="text-sm leading-7">
                    {typeConfig.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                  当前题型：{typeConfig.label}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">步骤 1</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">先选题型</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">不同题型会带出不同的填写提示和默认模板。</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">步骤 2</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">再写题干</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">题干尽量写完整，让学生不需要猜题目要求。</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">步骤 3</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">检查答案和分值</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">保存前看一眼正确答案和分值，避免后续批改出错。</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-[220px,1fr]">
                  <div className="space-y-2">
                    <Label htmlFor="type">题型</Label>
                    <select
                      id="type"
                      value={form.type}
                      onChange={(event) => applyTypePreset(event.target.value as QuestionType)}
                      className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900"
                    >
                      <option value="single_choice">单选题</option>
                      <option value="true_false">判断题</option>
                      <option value="short_answer">简答题</option>
                    </select>
                    <p className="text-sm leading-6 text-slate-500">{typeConfig.description}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stem">题干</Label>
                    <Input
                      id="stem"
                      value={form.stem}
                      onChange={(event) => setForm({ ...form, stem: event.target.value })}
                      required
                      placeholder="例如：以下哪一项属于关系型数据库？"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                    />
                    <p className="text-sm leading-6 text-slate-500">题干建议直接写清楚题意，不要把关键条件藏在选项里。</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optionsText">{typeConfig.optionsLabel}</Label>
                  <Textarea
                    id="optionsText"
                    value={form.optionsText}
                    onChange={(event) => setForm({ ...form, optionsText: event.target.value })}
                    placeholder={typeConfig.optionsPlaceholder}
                    className="min-h-[140px] rounded-2xl border-slate-200 bg-slate-50 text-sm"
                  />
                  <p className="text-sm leading-6 text-slate-500">{typeConfig.optionsHint}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="correct_answer">{typeConfig.answerLabel}</Label>
                    <Input
                      id="correct_answer"
                      value={form.correct_answer}
                      onChange={(event) => setForm({ ...form, correct_answer: event.target.value })}
                      placeholder={form.type === "single_choice" ? "例如：A" : form.type === "true_false" ? "例如：正确" : "可填写参考答案或评分要点"}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                    />
                    <p className="text-sm leading-6 text-slate-500">{typeConfig.answerHint}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="score">分值</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      value={form.score}
                      onChange={(event) => setForm({ ...form, score: event.target.value })}
                      required
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                    />
                    <p className="text-sm leading-6 text-slate-500">建议单选题 2-5 分，判断题 1-2 分，简答题按题量单独设置。</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-slate-950">
                    <Sparkles className="h-4 w-4 text-blue-700" />
                    <p className="text-sm font-semibold">保存前快速检查</p>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-950">题干完整</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">让学生仅靠题干就能理解题意。</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-950">答案对应正确</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">单选题和判断题尤其要确认答案与选项一致。</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-950">分值合理</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">别让一道小题占过高分值，影响整套试卷结构。</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Button className="h-12 rounded-2xl px-6" disabled={saving}>
                    {saving ? "保存中..." : editingId ? "保存编辑" : "创建题目"}
                  </Button>
                  <Button type="button" variant="outline" className="h-12 rounded-2xl px-6" onClick={resetForm}>
                    {editingId ? "取消编辑" : "重置表单"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">一键导入题目</CardTitle>
                  <CardDescription className="leading-7">
                    下载模板后批量整理题目，再一次性导入。适合老师集中备题，不必逐条手填。
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-950">模板字段</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  题型、题干、选项A、选项B、选项C、选项D、正确答案、分值
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  判断题只需要填题干、正确答案、分值；简答题只需要填题干、参考答案、分值。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" className="h-12 rounded-2xl px-5" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4" />
                  下载导入模板
                </Button>
                <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  <Upload className="h-4 w-4" />
                  选择 Excel / CSV
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleImportFileChange}
                  />
                </label>
              </div>

              <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-950">当前文件</p>
                <p className="mt-2 text-sm text-slate-600">
                  {importFile ? importFile.name : "还没有选择文件"}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {importing ? "文件已选中，系统正在自动导入，请稍候。" : "选择文件后会自动开始导入，不需要再额外点一次按钮。"}
                </p>
              </div>

              {importSummary ? (
                <div
                  className={
                    importSummaryTone === "success"
                      ? "rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700"
                      : "rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700"
                  }
                >
                  {importSummary}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ClipboardList className="h-5 w-5 text-blue-700" />
                当前出题提示
              </CardTitle>
              <CardDescription className="leading-7">
                根据当前题型给你一个更直观的填写方式，减少来回猜字段含义。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">推荐题型</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{typeConfig.label}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{typeConfig.description}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">推荐示例</p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-slate-700">
{form.type === "single_choice"
  ? `题干：以下哪一项属于 HTTP 状态码？\n选项：["A. 200", "B. Redis", "C. JSX", "D. JWT"]\n正确答案：A`
  : form.type === "true_false"
    ? `题干：PostgreSQL 属于关系型数据库。\n选项：["正确", "错误"]\n正确答案：正确`
    : `题干：简述 JWT 的基本组成及作用。\n参考答案：可填写评分要点，例如 Header、Payload、Signature。`}
                </pre>
              </div>

              {importPreview.length > 0 ? (
                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-sm font-medium text-emerald-700">最新导入结果</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-700">
                    本次共导入 {lastImportedCount} 道题，下面展示前 {importPreview.length} 道，方便你立刻核对。
                  </p>
                  <div className="mt-4 space-y-3">
                    {importPreview.map((item, index) => (
                      <div key={`${item.stem}-${index}`} className="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="outline">{formatQuestionType(item.type)}</Badge>
                          <span className="text-xs text-slate-500">{item.score} 分</span>
                        </div>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{item.stem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-slate-200 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-2xl">题目列表</CardTitle>
                <div className="relative w-full md:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="按题干关键词搜索"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-10"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {loading ? <LoadingState title="正在加载题库" description="请稍候，题目列表正在同步。" /> : null}
              {!loading && listError ? <ErrorState description={listError} /> : null}
              {!loading && !listError && filteredQuestions.length === 0 ? (
                <EmptyState
                  title={questions.length === 0 ? "还没有题目" : "没有匹配的题目"}
                  description={
                    questions.length === 0 ? "先创建第一道题，右侧列表就会开始累计。" : "换个关键词试试，或者清空搜索。"
                  }
                />
              ) : null}

              {!loading && !listError && filteredQuestions.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>题型</TableHead>
                        <TableHead>题干</TableHead>
                        <TableHead>分值</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead className="w-[120px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedQuestions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <Badge variant="outline">{formatQuestionType(question.type)}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-slate-950">{question.stem}</p>
                              <p className="text-xs text-slate-500">{question.id}</p>
                            </div>
                          </TableCell>
                          <TableCell>{question.score}</TableCell>
                          <TableCell>{formatDate(question.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingId(question.id);
                                  setForm(toForm(question));
                                  setMessage("");
                                  setFormError("");
                                  setImportError("");
                                }}
                              >
                                编辑
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={deletingId === question.id}
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => void handleDeleteQuestion(question)}
                              >
                                {deletingId === question.id ? "删除中..." : "删除"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Pagination page={page} pageSize={PAGE_SIZE} total={filteredQuestions.length} onPageChange={setPage} />
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
