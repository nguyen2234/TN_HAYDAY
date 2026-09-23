---
description: Tự động stage, commit và push code theo chuẩn Conventional Commits.
---

# Git Commit & Push Workflow

// turbo-all

- Trigger: `/cp` (alias: `/auto-commit-push`)
- Khi nhận lệnh, thực hiện theo thứ tự:
  1. Kiểm tra danh sách file thay đổi bằng `git status`.
  2. Kiểm tra nội dung thay đổi bằng `git diff` (và `git diff --staged` nếu có).
  3. Nhóm thay đổi theo scope/mục đích; ưu tiên commit nhỏ, dễ review.
  4. Với mỗi nhóm:
     - Stage đúng file liên quan: `git add <files>`.
     - Tạo commit message theo Conventional Commits, tiếng Việt, rõ "vì sao".
     - Commit bằng định dạng:
       - `<type>(<scope>): <mô tả ngắn>`
  5. Chỉ `git add .` khi toàn bộ thay đổi cùng một mục đích.
  6. Sau khi commit xong, chạy `git push`.
  7. Báo lại hash commit và trạng thái branch sau push.
