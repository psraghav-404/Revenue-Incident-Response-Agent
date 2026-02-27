# Contributing to RevenueGuard AI

Thank you for considering contributing to RevenueGuard! Every contribution, no matter how small, is valued.

---

## 🚀 Getting Started

1. **Fork the repository** — Click the "Fork" button at the top right of this page.

2. **Clone your fork**
   ```bash
   git clone https://github.com/psraghav-404/revenueguard-ai.git
   cd revenueguard-ai
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies**
   ```bash
   npm install
   cd dashboard-react && npm install && cd ..
   ```

5. **Make your changes** — Write clean, documented code.

6. **Test your changes** — Ensure the backend starts and the dashboard renders correctly.

7. **Commit with a meaningful message**
   ```bash
   git commit -m "feat: add XYZ feature"
   ```

8. **Push and open a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a PR against the `main` branch.

---

## 📐 Coding Standards

| Area              | Standard                                     |
|-------------------|----------------------------------------------|
| **Language**      | JavaScript (ES6+, CommonJS for backend)      |
| **Formatting**    | 4-space indentation, semicolons required     |
| **Naming**        | `camelCase` for variables, `PascalCase` for classes |
| **Comments**      | JSDoc for public functions, inline for logic |
| **Commits**       | Follow [Conventional Commits](https://www.conventionalcommits.org/) |

---

## 📋 Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Include a clear description of **what** and **why**.
- Reference any related issues (e.g., `Closes #12`).
- Ensure your code does not introduce console errors.
- Update documentation if your change affects setup or usage.

---

## 🐛 Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, Node version, Elasticsearch version)

---

## 💡 Suggesting Features

Open an issue titled `[Feature Request]: ...` with:
- The problem your feature would solve
- A brief description of the proposed solution

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
