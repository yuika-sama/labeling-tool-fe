# Quick Start Guide - Tool Gán Nhãn Dữ Liệu

## Bước 1: Setup Supabase

### Tạo Project
1. Vào https://supabase.com và tạo project mới
2. Chờ project được khởi tạo

### Tạo Database Tables
Vào SQL Editor và chạy các lệnh sau:

```sql
-- 1. Bảng users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Bảng datasets
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_type VARCHAR(50) NOT NULL,
  created_by UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_datasets_created_by ON datasets(created_by);
CREATE INDEX idx_datasets_published ON datasets(is_published);

-- 3. Bảng questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_type VARCHAR(50) NOT NULL,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_dataset ON questions(dataset_id);

-- 4. Bảng dataset_files
CREATE TABLE dataset_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dataset_files_dataset ON dataset_files(dataset_id);

-- 5. Bảng answers
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  file_id UUID REFERENCES dataset_files(id) ON DELETE SET NULL,
  answer_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_answers_user ON answers(user_id);
CREATE INDEX idx_answers_dataset ON answers(dataset_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_file ON answers(file_id);
```

### Tạo Storage Bucket
1. Vào Storage trong Supabase dashboard
2. Click "Create a new bucket"
3. Tên: `dataset-files`
4. Chọn "Public bucket"
5. Click Create

### Lấy API Keys
1. Vào Settings → API
2. Copy:
   - Project URL
   - anon public key
   - service_role key (secret)

## Bước 2: Setup Backend

```bash
cd backend
npm install
```

Tạo file `backend/.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx
JWT_SECRET=my-super-secret-key-change-this
PORT=5000
NODE_ENV=development
```

Chạy backend:
```bash
npm run dev
```

Kiểm tra: http://localhost:5000/api/health

## Bước 3: Setup Frontend

```bash
# Từ thư mục root
npm install
```

Tạo file `.env` (root folder):
```env
VITE_API_URL=http://localhost:5000/api
```

Chạy frontend:
```bash
npm run dev
```

Mở trình duyệt: http://localhost:5173

## Bước 4: Tạo Admin User

### Cách 1: Dùng PowerShell/CMD
```powershell
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    username = "admin"
    email = "admin@example.com"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Headers $headers -Body $body
```

### Cách 2: Đăng ký qua UI
1. Mở http://localhost:5173/register
2. Đăng ký tài khoản
3. Vào Supabase → Table Editor → users
4. Sửa cột `role` từ `user` → `admin`

## Bước 5: Test

1. Đăng nhập với tài khoản admin
2. Tạo dataset mới
3. Thêm câu hỏi và upload files
4. Publish dataset
5. Đăng ký tài khoản user khác
6. Trả lời câu hỏi
7. Đăng nhập lại admin và xem câu trả lời

## Lỗi thường gặp

### Backend không chạy được
- Kiểm tra Node.js version (cần >= 16)
- Kiểm tra .env file có đúng format không
- Kiểm tra Supabase credentials

### Frontend không connect được backend
- Kiểm tra backend đã chạy chưa
- Kiểm tra VITE_API_URL trong .env
- Restart frontend sau khi thay đổi .env

### 401 Unauthorized
- Token expired → Đăng nhập lại
- JWT_SECRET phải giống nhau giữa các lần chạy backend

### CORS Error
- Backend đã có CORS enabled
- Kiểm tra URL trong VITE_API_URL

## Next Steps

- Deploy backend lên Railway/Render
- Deploy frontend lên Vercel/Netlify
- Thêm validation
- Thêm tính năng export data
- Thêm dashboard analytics

## Liên hệ

Có vấn đề? Mở issue trên GitHub hoặc liên hệ support.
