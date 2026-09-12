/* Kaup 官网「联系我们」表单后端
   Vercel Serverless Function（Node 18+，用全局 fetch，零第三方依赖。
   仓库无 package.json，.js 按 CommonJS 加载，故用 module.exports。）

   环境变量（Vercel 项目 Settings → Environment Variables，仅服务端可见）：
   - FEISHU_WEBHOOK_URL  飞书「官网线索」群自定义机器人 webhook 地址
   - FEISHU_BOT_SECRET   机器人安全设置「签名校验」的密钥

   防 spam：honeypot 字段 + 服务端格式校验 + 进程内滑动窗口限流。
   限流说明：serverless 实例在温热期内复用进程，窗口随之保留；
   冷启动会重置窗口 —— 对突发刷量有效，分布式慢速刷只能缓解。
   若日后垃圾变多，再升级 Upstash Redis 做严格限流。 */
"use strict";

const crypto = require("crypto");

/* ---------- 滑动窗口限流（零依赖） ---------- */
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_IP_LIMIT = 5;      // 单 IP 每小时最多 5 条线索
const RATE_GLOBAL_LIMIT = 30; // 全站每小时最多 30 条（防分布式喷刷）
const rateHits = { byIp: new Map(), global: [] };

function pruneOld(arr, now) {
  while (arr.length && now - arr[0] > RATE_WINDOW_MS) arr.shift();
}

function isRateLimited(ip) {
  const now = Date.now();
  pruneOld(rateHits.global, now);
  const ipHits = rateHits.byIp.get(ip) || [];
  pruneOld(ipHits, now);
  if (ipHits.length >= RATE_IP_LIMIT || rateHits.global.length >= RATE_GLOBAL_LIMIT) {
    return true;
  }
  ipHits.push(now);
  rateHits.byIp.set(ip, ipHits);
  rateHits.global.push(now);
  /* Map 兜底：极端情况下防止内存无限增长 */
  if (rateHits.byIp.size > 5000) rateHits.byIp.clear();
  return false;
}

/* ---------- 校验规则（与前端 site.js 保持一致） ---------- */
const RE_MOBILE = /^1[3-9]\d{9}$/;                    // 11 位大陆手机号
const RE_LANDLINE = /^0\d{2,3}-?\d{7,8}$/;            // 区号-座机（连字符可省）

function normalizePhone(raw) {
  // 允许用户输入空格，统一去掉；座机连字符保留给飞书卡片展示
  return String(raw || "").replace(/\s+/g, "");
}

function validate({ company, name, phone }) {
  if (typeof company !== "string" || company.trim().length < 2 || company.length > 100) {
    return "请填写有效的公司名称";
  }
  if (typeof name !== "string" || name.trim().length < 1 || name.length > 50) {
    return "请填写联系人姓名";
  }
  const p = normalizePhone(phone);
  if (!RE_MOBILE.test(p) && !RE_LANDLINE.test(p)) {
    return "请填写有效的联系电话（11 位手机号或带区号座机）";
  }
  return null;
}

/* ---------- 飞书加签 ----------
   官方算法：以 timestamp + "\n" + secret 为 HmacSHA256 的密钥，
   对空串签名后 Base64；请求体携带 timestamp（秒级）与 sign。 */
function genSign(secret, timestamp) {
  return crypto
    .createHmac("sha256", `${timestamp}\n${secret}`)
    .update("")
    .digest("base64");
}

/* 用户输入进 lark_md 前转义：防止恶意提交注入 markdown 链接、
   图片或 <at id=...> 标签（否则表单会被当成@全群/钓鱼链接跳板） */
function mdEscape(s) {
  return String(s).replace(/[\\`*_[\]()<>#+\-!]/g, "\\$&");
}

function buildLeadCard({ company, name, phone }) {
  return {
    msg_type: "interactive",
    card: {
      header: {
        template: "blue",
        title: { tag: "plain_text", content: "新官网线索" },
      },
      elements: [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: `**公司名称**：${mdEscape(company)}\n**联系人**：${mdEscape(name)}\n**联系电话**：${mdEscape(phone)}`,
          },
        },
        {
          tag: "div",
          text: { tag: "lark_md", content: "<at id=all></at> 请尽快回电跟进" },
        },
      ],
    },
  };
}

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const body = req.body || {};

  /* honeypot：真人看不到该字段（CSS 隐藏 + tabindex -1），
     填了必是爬虫 —— 返回假成功，不提示对方已被识别 */
  if (body.website) {
    return json(res, 200, { ok: true });
  }

  /* 限流：Vercel 在 x-forwarded-for 写入真实客户端 IP */
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return json(res, 429, { ok: false, error: "提交太频繁，请稍后再试，或直接发邮件至 sales@kaup.ai" });
  }

  const lead = {
    company: String(body.company || "").trim(),
    name: String(body.name || "").trim(),
    phone: normalizePhone(body.phone),
  };

  const invalid = validate(lead);
  if (invalid) {
    return json(res, 400, { ok: false, error: invalid });
  }

  const webhook = process.env.FEISHU_WEBHOOK_URL;
  const secret = process.env.FEISHU_BOT_SECRET;
  if (!webhook || !secret) {
    console.error("contact: missing FEISHU_WEBHOOK_URL or FEISHU_BOT_SECRET");
    return json(res, 500, { ok: false, error: "服务配置缺失，请稍后重试" });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const payload = {
    timestamp: String(timestamp),
    sign: genSign(secret, timestamp),
    ...buildLeadCard(lead),
  };

  try {
    const resp = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await resp.json().catch(() => ({}));
    if (!resp.ok || result.code !== 0) {
      console.error("contact: feishu webhook failed", resp.status, result);
      return json(res, 502, { ok: false, error: "提交失败，请稍后重试或直接发邮件至 sales@kaup.ai" });
    }
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error("contact: feishu webhook error", err);
    return json(res, 502, { ok: false, error: "提交失败，请稍后重试或直接发邮件至 sales@kaup.ai" });
  }
};
