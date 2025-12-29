# Tool Gán Nhãn Dữ Liệu - Labeling Tool

Tool gán nhãn dữ liệu với phân quyền Admin/User, lưu trữ trên Supabase, và backend API riêng biệt.

### Dùng thử
- Tài khoản Admin
  - Email: admin@gmail.com
  - Mật khẩu: 123456
- Tài khoản User
  - Email: user@gmail.com
  - Mật khẩu: 123456

## Tính năng

### Phân quyền
- **Admin**: 
  - Tạo, sửa, xóa datasets
  - Tạo câu hỏi cho datasets
  - Upload files cho datasets
  - Publish/unpublish datasets
  - Xem tất cả câu trả lời từ users
  
- **User**:
  - Xem danh sách datasets đã được publish
  - Trả lời câu hỏi cho datasets
  - Xem và chỉnh sửa câu trả lời của mình

### Lưu trữ
- Database: Supabase PostgreSQL
- Files: Supabase Storage
- Authentication: JWT tokens

## Cấu trúc Project

```
labeling-tool/
├── backend/              # Backend API (Node.js + Express)
│   ├── config/          # Cấu hình Supabase
│   ├── middleware/      # Authentication middleware
│   ├── routes/          # API routes
│   └── server.js        # Entry point
│
├── src/                 # Frontend (React)
│   ├── components/      # React components
│   ├── context/         # React Context (Auth, Project)
│   ├── pages/           # Pages
│   │   ├── admin/      # Admin pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── DatasetList.jsx
│   │   └── DatasetLabeling.jsx
│   ├── services/        # API services
│   └── App.jsx
```

## Setup Hướng dẫn

### 1. Setup Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)

2. Chạy các SQL commands trong [backend/README.md](backend/README.md) để tạo tables

3. Tạo Storage bucket:
   - Vào Storage → Create bucket
   - Tên: `dataset-files`
   - Chọn: Public bucket
   - Tạo policy cho public read

4. Lấy credentials:
   - Project URL
   - Anon key
   - Service role key

### 2. Setup Backend

```bash
cd backend
npm install
```

Tạo file `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_secret_key_here
PORT=5000
```

Chạy server:
```bash
npm run dev
```

Server chạy tại: http://localhost:5000

### 3. Setup Frontend

```bash
# Từ thư mục root
npm install
```

Tạo file `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Chạy frontend:
```bash
npm run dev
```

Frontend chạy tại: http://localhost:5173

## Sử dụng

### Tạo tài khoản Admin đầu tiên

Có 2 cách:

**Cách 1**: Sử dụng API trực tiếp
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Cách 2**: Đăng ký qua UI rồi cập nhật role trong Supabase
1. Đăng ký tài khoản bình thường
2. Vào Supabase → Table Editor → users
3. Sửa `role` từ `user` thành `admin`

### Workflow

#### Admin:
1. Đăng nhập với tài khoản admin
2. Tạo dataset mới (Datasets → + Tạo Dataset Mới)
3. Thêm câu hỏi và upload files
4. Publish dataset
5. Xem câu trả lời từ users

#### User:
1. Đăng ký/Đăng nhập
2. Xem danh sách datasets
3. Chọn dataset và trả lời câu hỏi
4. Submit câu trả lời

## Deploy

### Backend
Có thể deploy lên:
- **Railway**: https://railway.app
- **Render**: https://render.com  
- **Heroku**: https://heroku.com
- **VPS**: DigitalOcean, AWS, etc.

Nhớ set environment variables!

### Frontend
Có thể deploy lên:
- **Vercel**: https://vercel.com
- **Netlify**: https://netlify.com
- **Cloudflare Pages**: https://pages.cloudflare.com

Update `VITE_API_URL` trong .env với URL backend đã deploy.

## API Documentation

Xem chi tiết trong [backend/README.md](backend/README.md)

### Endpoints chính:

**Auth**
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập
- GET `/api/auth/me` - Lấy thông tin user

**Datasets** 
- GET `/api/datasets` - Lấy danh sách
- GET `/api/datasets/:id` - Chi tiết
- POST `/api/datasets` - Tạo (Admin)
- PUT `/api/datasets/:id` - Cập nhật (Admin)
- DELETE `/api/datasets/:id` - Xóa (Admin)

**Answers**
- POST `/api/answers` - Submit câu trả lời
- POST `/api/answers/batch` - Submit nhiều
- GET `/api/answers/my-answers/:datasetId` - Câu trả lời của tôi

## Troubleshooting

### Lỗi kết nối Backend
- Kiểm tra backend đã chạy chưa
- Kiểm tra `VITE_API_URL` trong .env
- Kiểm tra CORS settings

### Lỗi Supabase
- Kiểm tra credentials trong .env
- Kiểm tra tables đã tạo chưa
- Kiểm tra Storage bucket policies

### Lỗi 401 Unauthorized
- Token hết hạn → Đăng nhập lại
- Kiểm tra JWT_SECRET giống nhau giữa sessions
