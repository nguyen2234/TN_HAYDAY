# Git Commit Rules for AI Agents

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

`<type>(<scope>): <description>`

## Types

- `feat`: A new feature for the user, not a new feature for builds.
- `fix`: A bug fix for the user, not a fix for builds.
- `chore`: Updating grunt tasks etc; no production code change.
- `docs`: Changes to the documentation.
- `style`: Formatting, missing semi colons, etc; no production code change.
- `refactor`: Refactoring production code, eg. renaming a variable.
- `perf`: Code change that improves performance.
- `test`: Adding missing tests, refactoring tests; no production code change.

## Guidelines

- Use lowercase for the type.
- The `<scope>` is optional but recommended for specific modules (e.g., `chore(config)`, `feat(auth)`).
- The `<description>` nên bằng tiếng Việt theo sở thích của người dùng, nhưng hãy giữ sự chuyên nghiệp.
- **Atomic Commits**: Mỗi commit nên giải quyết một vấn đề duy nhất hoặc một nhóm các thay đổi có liên quan chặt chẽ.
- **Granular Staging**: Tránh dùng `git add .` nếu các thay đổi thuộc về nhiều mục đích khác nhau. Hãy dùng `git add <file>` để tách các commit theo đúng phạm vi (scope).
- Luôn stage các thay đổi liên quan trước khi commit.
- Không sử dụng các message chung chung như "update code" hoặc "fix bug".
