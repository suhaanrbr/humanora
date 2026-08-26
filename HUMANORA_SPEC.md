# HUMANORA — Product & Technical Specification

This document is the permanent, single source of truth for HUMANORA. All implementation phases must follow it. Do not redesign or reinterpret it without explicit approval.

---

## 1. Project

**HUMANORA** is a premium AI-assisted writing SaaS.

**Core positioning:** "AI drafts. Human impact."

**Purpose:** Transform stiff or generic AI-assisted writing into clearer, more natural writing while preserving meaning, facts, important terminology, quotations, and citations.

**Prohibited claims:** The product must NOT promise:
- Guaranteed AI-detector bypass
- "100% undetectable" writing
- Guaranteed plagiarism avoidance
- Any other claim we cannot substantiate

---

## 2. Design

The approved reference image (dark SaaS dashboard + landing page) is the single source of truth for HUMANORA's visual direction. Do not redesign it.

**Visual identity:**
- Premium dark SaaS interface
- Near-black / deep navy background
- Purple and indigo gradients
- Restrained neon glow
- Rounded cards
- Thin, subtle borders
- Clean modern typography
- Spacious layouts
- Polished responsive interactions

The HUMANORA branding, layout, dashboard structure, and visual direction shown in the reference image should be reproduced as closely as practical.

**Do not use** fabricated customer counts, testimonials, university/company trust logos, or ratings in the real application.

---

## 3. Landing Page

**Navigation:**
- HUMANORA (logo)
- Features
- How It Works
- Use Cases
- Pricing
- Blog
- Resources
- Log In
- Get Started Free

**Hero:**
> AI drafts.
> Human impact.

**Primary CTA:** Humanize Text Now
**Secondary CTA:** See It In Action

---

## 4. Main Application

**Authenticated sidebar:**
- Dashboard
- Humanize
- My Voice
- Documents
- AI Analysis
- Templates
- History
- Favorites
- Settings
- Help & Support

---

## 5. Humanizer

Main Humanize page must contain:
- Original text panel
- Humanized Output panel
- Mode selector
- Language selector
- Rewriting strength control
- Word counters
- Paste
- File upload
- Copy
- Save
- Download
- Reset
- Loading states
- Polished error states

**Modes:**
- Natural
- Academic
- Professional
- Simple
- Casual
- Creative

---

## 6. My Voice

My Voice is a major HUMANORA differentiator.

Users should eventually upload writing samples so HUMANORA can construct a reusable writing profile.

**Analyzed characteristics:**
- Vocabulary
- Sentence structure
- Tone
- Formality
- Paragraph flow
- Writing patterns

**Supported sample formats (planned):** TXT, DOCX, PDF

Users should eventually be able to switch My Voice on when humanizing text.

**Important constraint:** Do not claim that a voice score scientifically proves someone's identity. Any percentage shown represents **profile completeness/confidence only**.

---

## 7. Meaning Preservation

Architecture must validate preservation of:
- Numbers
- Dates
- Names / entities
- Quotations
- Citations
- URLs
- Technical terminology
- Important factual statements

If a rewrite may materially change meaning, the system should eventually warn the user.

---

## 8. Documents

Users should eventually be able to:
- Create
- Save
- Rename
- Delete
- Search
- Favorite
- Reopen
- Humanize again
- View original and rewritten versions

---

## 9. History

Store per entry:
- Original text
- Rewritten output
- Mode
- Language
- Rewrite strength
- Voice profile used
- Word count
- Timestamps

Use pagination.

---

## 10. Templates

Architect for templates including:
- Essay
- Research Writing
- Report
- Professional Email
- Blog
- Personal Statement
- LinkedIn
- Simplify
- Formal
- Casual

---

## 11. Plans (Placeholder Configuration)

| Plan | Price |
|---|---|
| Free | ₹0 |
| Student | ₹199/month |
| Pro | ₹499/month |
| Team | ₹799/user/month |

Do not integrate real payments yet.

Pricing and quotas must be **configuration/database driven**, not scattered hard-coded values throughout the codebase.

---

## 12. Admin

Eventually create a secure admin area showing:
- Users
- Paying subscribers
- Subscription plans
- Revenue
- MRR
- Words processed
- Humanization requests
- AI costs
- Failure rates
- Support requests
- System health

**Admin authorization must be enforced server-side.**

---

## 13. Tech Stack

**Frontend:**
- Next.js
- TypeScript
- React
- Tailwind CSS

**Backend:**
- Python
- FastAPI
- Pydantic

**Database:**
- PostgreSQL
- Appropriate ORM
- Migrations

**Testing:**
- pytest for backend
- Appropriate frontend/end-to-end testing when useful

**Version control:**
- Git

---

## 14. Architecture

Keep frontend and backend clearly separated.

**Top-level structure:**
```
C:\HUMANORA
├── frontend
├── backend
├── docs
├── HUMANORA_SPEC.md
├── README.md
└── .gitignore
```

Do not create unnecessary complexity.

---

## 15. AI Architecture

Eventually use a provider-independent AI architecture.

**Conceptual pipeline:**
```
User Input
→ validation
→ mode configuration
→ optional My Voice profile
→ prompt/rewrite pipeline
→ AI provider abstraction
→ rewrite
→ preservation checks
→ output
→ usage accounting
→ history
```

Do not tightly couple the application to one AI provider.

No model API key should ever be exposed in frontend code.

**IMPORTANT:** The Claude Pro subscription used to build HUMANORA is separate from HUMANORA eventually needing an AI model to serve customers. Do not configure a production AI provider yet.

---

## 16. Security

Never:
- Expose secrets
- Commit credentials
- Store plaintext passwords
- Trust frontend-only authorization
- Execute uploaded documents
- Expose raw stack traces
- Construct unsafe SQL

Use environment variables, validation, safe file handling, and server-side authorization.

---

## 17. Privacy

Customer writing may contain private information.

- Design around data minimization.
- Do not use customer documents to train systems without explicit opt-in.
- Do not advertise end-to-end encryption unless genuinely implemented.

---

## 18. Responsive Design

Must work properly on:
- Desktop
- Laptop
- Tablet
- Mobile

Follow the mobile concept shown in the reference image. Do not simply shrink the desktop UI.

---

## 19. Cost Rule

Initial development should cost as close to ₹0 as practical. Prefer open-source software and free development tooling.

**Before adding anything that requires money:**
1. Stop
2. Explain what it is
3. Explain the cost
4. Explain the free alternative
5. Ask for approval

---

## 20. Development Phases

| Phase | Description |
|---|---|
| 1 | Foundation and repository structure |
| 2 | Design system |
| 3 | Landing page matching reference |
| 4 | Application/dashboard shell |
| 5 | Humanizer UI using mock data |
| 6 | FastAPI backend |
| 7 | Humanization engine/provider architecture |
| 8 | PostgreSQL/database |
| 9 | Authentication |
| 10 | My Voice |
| 11 | Documents/history/templates |
| 12 | Plans and usage limits |
| 13 | Payments — only after explicit approval |
| 14 | Secure admin system |
| 15 | Deployment, monitoring and QA |

---

## 21. Operating Rule

The implementation agent is the primary implementer and:

**May:**
- Create files
- Edit files
- Install free dependencies
- Run commands
- Run tests
- Diagnose errors
- Fix errors
- Maintain documentation

**Must:**
- Complete only ONE phase at a time
- At the end of each phase: run the application/tests, fix discovered problems, summarize files changed, summarize commands run, report test results, flag anything requiring a decision, then stop and wait for approval before starting the next phase
- Never modify anything outside `C:\HUMANORA`
