const express = require("express");
const initialMembers = require("../fixtures/members.json");

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

// ───────────────────────────────────────────────────────────
// TODO 任務一：初始化 state + 內部 helpers
// ───────────────────────────────────────────────────────────

// 1. 複製 initialMembers，不直接改外部陣列
// 2. 下一個新增會員要使用的 id
// 3. 兩個內部 helper 函式
// 函式一：filterByQuery(list, query)
// 函式二：validateBody(body)

const members = [...initialMembers];
let nextId = initialMembers.length + 1;
const filterByQuery = (list, query) => {
  if (!query.level) return list;
  return list.filter((item) => item.level === query.level);
};
const validateBody = (body) => {
  if (!body || !body.name || !body.level) {
    return { valid: false, error: "缺 Name 或 Level" };
  }
  return { valid: true };
};

// 此 router 掛在 app.js 的 '/members'，以下路由皆帶此前綴。舉例來說：
// - router.get('/') → GET /members
// - router.get('/:id') → GET /members/:id
const router = express.Router();
// GET /
// - 輸入：req.query.level 可帶 'VIP' | 'normal'（選填）
// - 輸出：200 + [{ id, name, level }, ...]
// - 提示：filterByQuery(members, req.query)
router.get("/", (req, res) => {
  const filterMembers = filterByQuery(members, req.query);
  return res.status(200).json(filterMembers);
});

// GET /:id
// - 輸入：req.params.id（string，需使用 Number() 轉換）
// - 輸出：200 + { id, name, level }，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.find，找不到時結果是 undefined
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const findMember = members.find((item) => item.id === Number(id));
  if (!findMember) {
    return res.status(404).json({ error: "會員不存在" });
  }
  return res.status(200).json(findMember);
});

// POST /
// - 輸入：body = { name: string, level: 'VIP' | 'normal' }
// - 輸出：201 + 新會員物件（id 自動配），或 400 + { error: '缺 name 或 level' }（驗證失敗）
// - 提示：validateBody(req.body) 驗證；通過後用 spread 將 req.body 的欄位與 nextId 自動遞增的 id 合為新物件，push 進 members
// - 範例：POST /members body { name: '阿文', level: 'VIP' } → 201 { id: 5, name: '阿文', level: 'VIP' }
/* 作答區
router.METHOD('PATH', (req, res) => { ... });
*/

router.post("/", (req, res) => {
  const body = req.body;
  const validateMember = validateBody(body);
  if (!validateMember.valid) {
    return res.status(400).json({ error: validateMember.error });
  }
  const newMember = {
    id: nextId,
    name: String(body.name),
    level: String(body.level),
  };
  members.push(newMember);
  nextId++;
  return res.status(201).json(newMember);
});

// PUT /:id
// - 輸入：req.params.id（string，需 Number() 轉換）、body（部分欄位，例如只傳 { level: 'normal' }）
// - 輸出：200 + merge 後的會員，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則使用 spread 合併 members[idx] 與 req.body（req.body 需注意順序來覆蓋舊欄位），最後將結果存回 members[idx]
// - 範例：PUT /members/1 body { level: 'normal' } → 200 { id: 1, name: '小華', level: 'normal' }（name 被保留）
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const memberIndex = members.findIndex((item) => item.id === id);
  if (memberIndex === -1) {
    return res.status(404).json({ error: "會員不存在" });
  }
  members[memberIndex] = {
    ...members[memberIndex],
    ...req.body,
  };
  return res.status(200).json(members[memberIndex]);
});

// DELETE /:id
// - 輸入：req.params.id（string，需 Number() 轉換）
// - 輸出：204（無 body），或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則 splice 移除，再設定 status 204 並以 .end() 結束回應（204 不帶 body）
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const memberIndex = members.findIndex((item) => item.id === id);
  if (memberIndex === -1) {
    return res.status(404).json({ error: "會員不存在" });
  }
  members.splice(memberIndex, 1);
  return res.status(204).end();
});

module.exports = router;
