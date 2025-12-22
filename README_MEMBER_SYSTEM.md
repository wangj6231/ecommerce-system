# 會員系統說明文件 (Member System README)

## 系統功能 (System Features)
本系統已完成以下功能：
1. **一般會員功能**：
   - 註冊 (含帳號、姓名、與密碼驗證)
   - 登入 (使用帳號與密碼)
   - 修改個人資料 (姓名、電話、地址、密碼)
   - 刪除個人帳號
2. **管理員功能**：
   - 管理員登入 (預設帳號: `admin`, 密碼: `admin`)
   - 會員列表管理 (顯示帳號、姓名、電話、地址)
   - 修改一般會員資料
   - 刪除一般會員帳號
   - 關鍵字搜尋會員 (帳號或姓名)
   - **Excel 匯入功能** (支援 .xlsx 格式批量匯入會員)

## 初始化與執行步驟 (Initialization & Execution)

### 1. 環境設定 (Environment Setup)
確保已安裝 Node.js。專案根目錄需有 `.env` 檔案設定資料庫連線。

### 2. 資料庫初始化 (Database Initialization)
執行以下指令以重置資料庫並建立 Schema：
```bash
npx prisma db push
```
*(注意：此指令會清除現有資料庫資料)*

### 3. 匯入預設資料 (Seed Data)
執行以下指令以匯入預設的 10 筆一般會員資料與 1 筆管理員資料：
```bash
npx tsx seed_members.ts
```

### 4. 啟動系統 (Start System)
```bash
npm run dev
```
系統將運行於 `http://localhost:3000`。

## 測試帳號 (Test Accounts)
- **管理員**: `admin` / `admin`
- **一般會員 (範例)**: `linyu_0823` / `3280_uynil` (更多測試帳號請參見 `seed_members.ts`)

## 匯入 Excel 格式說明 (Excel Import Format)
管理員後台可匯入 Excel 檔案，欄位標題應包含：
- 會員帳號 (username)
- 會員姓名 (name)
- 帳號密碼 (password)
- 會員連絡電話 (phone)
- 會員地址 (address)

