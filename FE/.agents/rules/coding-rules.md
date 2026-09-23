# Coding Standards for React & TypeScript

Dự án sử dụng React, TypeScript và Vite. Tất cả mã nguồn phải tuân thủ các quy chuẩn dưới đây để đảm bảo tính nhất quán và dễ bảo trì.

## 1. Nguyên tắc chung

- **Clean Code**: Ưu tiên mã nguồn dễ đọc hơn là mã nguồn ngắn gọn.
- **No Magic Values**: Tuyệt đối không sử dụng các giá trị magic (số, chuỗi "cứng" không rõ ý nghĩa) trực tiếp trong code. Hãy đưa chúng vào hằng số (`const`) hoặc `enum` với tên gọi rõ ràng.
- **DRY (Don't Repeat Yourself)**: Tái sử dụng logic thông qua các custom hooks hoặc utility functions.
- **KISS (Keep It Simple, Stupid)**: Giữ cho các component đơn giản và tập trung vào một nhiệm vụ duy nhất.

## 2. React & TypeScript

- **Functional Components**: Chỉ sử dụng functional components với Hooks.
- **Type Safety**: Luôn định nghĩa interface/type cho props và state. Tránh sử dụng `any`.
- **Naming Conventions**:
  - Component: PascalCase (vd: `BookCard.tsx`).
  - Hook: camelCase bắt đầu bằng `use` (vd: `useAuth.ts`).
  - Biến/Hàm: camelCase (vd: `handleSearch`).
  - Interface/Type: PascalCase (vd: `UserResponse`).

## 3. Cấu trúc thư mục `src/`

- `components/`: Các UI components dùng chung.
- `hooks/`: Các custom hooks.
- `services/`: Các logic gọi API.
- `pages/`: Các component đại diện cho một trang.
- `assets/`:
  - `images/`: Hình ảnh, icons.
  - `fonts/`: Các file font.
  - `styles/`: Các file SCSS/CSS global (ví dụ: `index.scss`, `variables.scss`, `mixins.scss`).
- `utils/`: Các hàm tiện ích.

## 4. State Management

- Ưu tiên sử dụng local state (`useState`, `useReducer`) cho logic cục bộ.
- Sử dụng Context API hoặc các thư viện global state nếu cần chia sẻ dữ liệu giữa nhiều page.

## 5. Hiệu năng

- Sử dụng `useMemo` và `useCallback` một cách hợp lý để tránh re-render không cần thiết.
- Lazy load các trang/component lớn nếu có thể.

## 6. Package Manager

- **Luôn dùng `bun`** để cài đặt thư viện. Không dùng `npm` hay `yarn`.
- Cài thư viện: `bun add <package>`
- Cài dev dependency: `bun add -d <package>`
- Gỡ thư viện: `bun remove <package>`
