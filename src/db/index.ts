import { drizzle } from 'drizzle-orm/sql-js';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import initSqlJs from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';
import * as schema from './schema';

const DB_PATH = path.resolve(process.cwd(), 'data', 'ims.db');

// 定位 sql.js 的 WASM 文件（pnpm 目录结构）
function findWasmFile(): string {
  const pnpmDir = path.resolve(process.cwd(), 'node_modules', '.pnpm');
  const wasmPath = path.join('node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

  try {
    for (const entry of fs.readdirSync(pnpmDir)) {
      if (entry.startsWith('sql.js@')) {
        const full = path.join(pnpmDir, entry, wasmPath);
        if (fs.existsSync(full)) return full;
      }
    }
  } catch {}

  // fallback: flat node_modules
  const flat = path.resolve(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  if (fs.existsSync(flat)) return flat;

  throw new Error('找不到 sql.js WASM 文件，请确保 sql.js 已安装');
}

let dbInstance: ReturnType<typeof drizzle> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rawSqlDb: any = null;

/** 获取底层 sql.js Database，用于执行原始 DDL */
export function getRawDb() { return rawSqlDb; }

export async function getDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs({
    locateFile: () => findWasmFile(),
  });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    rawSqlDb = new SQL.Database(buffer);
  } else {
    rawSqlDb = new SQL.Database();
  }

  // 显式设置 UTF-8 编码，防止中文乱码
  rawSqlDb.run('PRAGMA encoding = "UTF-8"');

  dbInstance = drizzle(rawSqlDb, { schema });
  return dbInstance;
}

export function saveDb() {
  if (!rawSqlDb) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = rawSqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoSave(intervalMs = 5000) {
  if (autoSaveTimer) return;
  autoSaveTimer = setInterval(saveDb, intervalMs);
}

export function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

// ==================== API 辅助函数 ====================

/**
 * 构建 DB 写入数据：自动序列化 JSON 对象 + 字符串化数组
 */
export function buildDbData(body: Record<string, unknown>, isNew: boolean): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    if (typeof value === 'object' && value !== null) {
      data[key] = JSON.stringify(value);
    } else {
      data[key] = value;
    }
  }

  if (isNew) {
    const prefix = getTablePrefix(body);
    data.id = `${prefix}-${Date.now()}`;
  }

  data.updated_at = new Date().toISOString();
  if (isNew) {
    data.created_at = new Date().toISOString();
  }

  return data;
}

function getTablePrefix(body: Record<string, unknown>): string {
  // 根据 body 中的特征字段判断表类型
  if ('businessRefNo' in body || 'business_ref_no' in body) return 'app';
  if ('reportNo' in body || 'report_no' in body) return 'clm';
  if ('exchangeRate' in body || 'exchange_rate' in body) return 'exr';
  if ('rateCode' in body || ('rate' in body && 'cargoType' in body)) return 'insr';
  return 'rec';
}

/**
 * 解析 JSON 字符串列（从 DB 读取后自动反序列化）
 */
export function parseJsonColumns<T extends Record<string, unknown>>(
  row: T,
  jsonColumns: string[]
): T {
  const result = { ...row } as Record<string, unknown>;
  for (const col of jsonColumns) {
    if (typeof result[col] === 'string') {
      try {
        result[col] = JSON.parse(result[col] as string);
      } catch {
        // 保持原始字符串
      }
    }
  }
  return result as T;
}
