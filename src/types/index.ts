import { ThemeConfig } from "./config";

interface Page {
  title: string;
  url: string;
  /** 分组显示名（如 数学 / JavaScript），由目录名推导 */
  group: string;
  /** 分组原始目录名（如 Math / Javascript） */
  groupKey: string;
  /** 毫秒时间戳 */
  date: number;
  /** 毫秒时间戳，缺省等于 date */
  update: number;
  frontmatter: Record<string, any>;
  desc: string;
}

export type { Page, ThemeConfig };
