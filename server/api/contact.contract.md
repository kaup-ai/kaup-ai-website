# /api/contact 行为契约（Phase 4 移植基线 · Phase 7 E2E 清单）

> 源：legacy/api/contact.js（Vercel CommonJS function，257 行）
> 移植目标：server/api/contact.ts（Nitro event handler）
> 铁律：**先写多维表格（事实源）→ 写表失败必须 502 → 禁止「群里有、表里无」**

## 契约条目（每条都必须 1:1 保留）

| #   | 条目        | 行为                                                                                                                                                                                                               |
| --- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1  | 仅 POST     | 非 POST → 405 JSON `{ok:false,error:"method_not_allowed"}` + `Allow: POST` 头                                                                                                                                      |
| C2  | Honeypot    | `body.website` 非空 → 假成功 200 `{ok:true}`（不提示爬虫已被识别）                                                                                                                                                 |
| C3  | 限流        | 进程内滑动窗口 1h：单 IP 5 条 + 全局 30 条 → 429 `{ok:false,error:"提交太频繁，请稍后再试，或直接发邮件至 sales@kaup.ai"}`；IP 取 `x-real-ip` → `x-forwarded-for` **末段**（Vercel 追加真实 IP 在末尾）→ `unknown` |
| C4  | 校验        | company 2–100 字符 / name 1–50 / phone 去空格后匹配 `^1[3-9]\d{9}$` 或 `^0\d{2,3}-?\d{7,8}$` → 400 带具体中文提示                                                                                                  |
| C5  | 配置缺失    | `FEISHU_WEBHOOK_URL`/`FEISHU_BOT_SECRET` 缺 → 500 `{ok:false,error:"服务配置缺失，请稍后重试"}`                                                                                                                    |
| C6  | 写入顺序    | **先 Base 后群卡片**（Base 是事实源，卡片是通知）                                                                                                                                                                  |
| C7  | Base 失败   | → 502 `{ok:false,error:"提交失败，请稍后重试或直接发邮件至 sales@kaup.ai"}`（此刻群未发卡片，用户重试零副作用）                                                                                                    |
| C8  | Base 未配置 | 四个 FEISHU_BASE/APPLE 凭证任缺 → 静默跳过 `{skipped:true}`（主链路永远可用）                                                                                                                                      |
| C9  | token 缓存  | tenant_access_token 进程内缓存 2h（提前 5 分钟续约）；401 / code 99991663 → 清缓存重试一次                                                                                                                         |
| C10 | 加签        | HmacSHA256(key=`${timestamp}\n${secret}`, msg="") → Base64；timestamp 秒级字符串                                                                                                                                   |
| C11 | 卡片转义    | 用户输入进 lark_md 前按 `[\\`*_[\]()<>#+\-!]` 转义（防 @all/钓鱼注入）                                                                                                                                             |
| C12 | 卡片失败    | Base 已有记录后卡片失败 → 502（用户重试 = 表里多一条静默重复行，可按提交时间去重，**不会**重复 @all）                                                                                                              |
| C13 | 成功        | 200 `{ok:true, base:!skipped}`                                                                                                                                                                                     |
| C14 | Base 字段   | 公司名称 / 联系人 / 联系电话 / 提交时间（Unix 毫秒）/ 跟进状态="待跟进"                                                                                                                                            |
| C15 | 卡片样式    | blue 模板 header「新官网线索」+ 加粗字段 + `<at id=all>` 请尽快回电跟进                                                                                                                                            |

## 环境变量（Vercel env，勿入仓库）

`FEISHU_WEBHOOK_URL` · `FEISHU_BOT_SECRET` · `FEISHU_APP_ID` · `FEISHU_APP_SECRET` · `FEISHU_BASE_APP_TOKEN` · `FEISHU_BASE_TABLE_ID`

## Nitro 移植注意

- 显式 method 检查保留（不用 `.post.ts` 自动路由），保证 C1 的 405 JSON 体逐字节一致
- `readBody` / `getRequestHeaders`（h3 头为小写键）替代 Express 风格 req/res
- 模块级 `rateHits` / `tokenCache` 状态：Nitro 实例温热期复用语义与 Vercel function 相同
- `node:crypto` createHmac 原样使用（Vercel Nitro 跑 Node runtime）
