# TN_HAYDAY

Ứng dụng đọc truyện online được xây dựng với React, TypeScript và Vite. Dự án tập trung vào giao diện hiện đại, hiệu năng cao và trải nghiệm người dùng mượt mà.

## 🛠 Tech Stack

| Công nghệ                                      | Phiên bản | Mô tả                      |
| ---------------------------------------------- | --------- | -------------------------- |
| [React](https://react.dev/)                    | ^19       | UI framework               |
| [TypeScript](https://www.typescriptlang.org/)  | ~6.0      | Type safety                |
| [Vite](https://vite.dev/)                      | ^8.0      | Build tool & dev server    |
| [React Router](https://reactrouter.com/)       | ^7.14     | Client-side routing        |
| [React Helmet Async](https://github.com/staylor/react-helmet-async) | ^3.0      | Quản lý metadata trang     |
| [TanStack Query](https://tanstack.com/query)   | ^5.100    | Data fetching & cache      |
| [React Bootstrap](https://react-bootstrap.netlify.app/) | ^2.10     | UI components              |
| [SCSS (Sass)](https://sass-lang.com/)          | ^1.99     | CSS preprocessor           |
| [Bun](https://bun.sh/)                         | latest    | Package manager & runtime  |

## 🚀 Bắt đầu

### Yêu cầu

- [Bun](https://bun.sh/) >= 1.0

### Cài đặt

```bash
bun install
```

### Chạy môi trường development

```bash
bun run dev
```

### Build production

```bash
bun run build
```

### Preview production build

```bash
bun run preview
```

### Kiểm tra lỗi (Lint & Format)

```bash
bun run lint
bun run format
```

## 📁 Cấu trúc thư mục

```
src/
├── assets/
│   ├── images/         # Hình ảnh, icons
│   ├── fonts/          # Các file font
│   └── styles/         # File SCSS global (index.scss, variables.scss, ...)
├── components/         # UI components dùng chung
├── hooks/              # Custom React hooks
├── pages/              # Các component đại diện cho trang
├── services/           # Logic gọi API
├── utils/              # Các hàm tiện ích
├── App.tsx
└── main.tsx
```

## 📐 Quy chuẩn dự án

Dự án sử dụng hệ thống quy tắc thống nhất được quản lý trong thư mục `.agents/`:

| File                                                                     | Nội dung                                                       |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| [.agents/rules/coding-rules.md](.agents/rules/coding-rules.md)           | Tiêu chuẩn React/TypeScript, cấu trúc thư mục, package manager |
| [.agents/rules/git-rules.md](.agents/rules/git-rules.md)                 | Quy tắc Conventional Commits, Atomic Commits                   |
| [.agents/rules/ui-ux-rules.md](.agents/rules/ui-ux-rules.md)             | Nguyên tắc thiết kế UI/UX                                      |
| [.agents/workflows/github-commit.md](.agents/workflows/github-commit.md) | Workflow commit & push tự động (`/cp` / `/auto-commit-push`)   |

### Commit Convention

Dự án tuân thủ chuẩn [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <mô tả bằng tiếng Việt>
```

**Ví dụ:**

```bash
feat(ui): thêm component BookCard
fix(api): sửa lỗi gọi API danh sách truyện
chore(config): cập nhật cấu hình ESLint
```

### Cài thư viện

> ⚠️ **Luôn dùng `bun`**, không dùng `npm` hay `yarn`.

```bash
bun add <package>          # Dependency
bun add -d <package>       # Dev dependency
bun remove <package>       # Gỡ thư viện
```
