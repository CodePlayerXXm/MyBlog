import dayjs from "dayjs";
import { withBase } from "vitepress";
import { ThemeConfig } from "../types";
//@ts-ignore
import { data as contents, Page } from "./content.data";
export const inBrowser = typeof document !== "undefined";
export const HASH_RE = /#.*$/;
export const EXT_RE = /(index)?\.(md|html)$/;
export const EXTERNAL_URL_RE = /^[a-z]+:/i;

const init = () => {
  const pageMap = new Map<string, Page>();
  contents.forEach((content: Page) => {
    // key 统一归一化（去掉 .html / index / hash），这样 cleanUrls 开关都能匹配
    pageMap.set(normalize(content.url), content);
  });

  return { pageMap };
};

const { pageMap } = init();

/**
 * get page by route path
 *
 * pageMap 的 key 是站点相对路径（不含 base），所以这里要求 base 为 "/"。
 */
const getPage = (path: string) => {
  return pageMap.get(normalize(path));
};

const sort = (pages: Page[], theme: ThemeConfig) => {
  const key = theme.sortBy ?? "date";

  return pages.sort((a, b) => b[key] - a[key]);
};

/** 全部文章，按 themeConfig.sortBy 排序 */
const getPages = (theme: ThemeConfig) => {
  return sort([...pageMap.values()], theme);
};

const defaultDataFormat = "YYYY-MM-DD HH:mm:ss";

const formatDate = (time: string | number, pattern?: string) => {
  if (pattern === undefined) {
    pattern = defaultDataFormat;
  }

  return dayjs(time).format(pattern);
};

const tagsUrl = (tag: string) => {
  return withBase(`/tags?tag=${encodeURIComponent(tag)}`);
};

export function isActive(
  currentPath: string,
  matchPath: string,
  asRegex = false
) {
  if (matchPath === undefined) {
    return false;
  }
  currentPath = normalize(`/${currentPath}`);
  if (asRegex) {
    return new RegExp(matchPath).test(currentPath);
  }
  if (normalize(matchPath) !== currentPath) {
    return false;
  }
  const hashMatch = matchPath.match(HASH_RE);
  if (hashMatch) {
    return (inBrowser ? location.hash : "") === hashMatch[0];
  }
  return true;
}

export function normalize(path: string) {
  return decodeURI(path).replace(HASH_RE, "").replace(EXT_RE, "");
}
export function isExternal(path: string) {
  return EXTERNAL_URL_RE.test(path);
}

const MAX_DESC_LENGTH = 150;

const formatDesc = (desc: string) => {
  const text = stripHtmlTags(desc).trim();
  return text.length > MAX_DESC_LENGTH
    ? `${text.slice(0, MAX_DESC_LENGTH)}…`
    : text;
};

const stripHtmlTags = (html: string) => {
  return html.replace(/<\/?[^>]*>/g, ""); //去除HTML tag
};

function r(
  condition: boolean,
  ifTrue: () => JSX.Element,
  ifFalse?: () => JSX.Element
): JSX.Element {
  if (condition) {
    return ifTrue();
  }
  return ifFalse ? ifFalse() : (null as unknown as JSX.Element);
}

function rs(condition: boolean, ifTrue: string, ifFalse?: string): string {
  if (condition) {
    return ifTrue;
  }
  return ifFalse ? ifFalse : "";
}

export {
  contents as pages,
  r,
  rs,
  pageMap,
  formatDate,
  getPage,
  getPages,
  tagsUrl,
  formatDesc,
};
