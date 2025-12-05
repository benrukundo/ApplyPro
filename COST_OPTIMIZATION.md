# API Cost Optimization Strategy

## Current Status
- **Model**: Claude Haiku 4.5 (most cost-effective)
- **Average cost per session**: Minimal with Haiku vs Sonnet
- **Context management**: Active

## Implemented Optimizations

### 1. `.claudeignore` File ✅
Excludes large directories that waste tokens:
- `node_modules/` (dependencies)
- `.next/` (108MB build output)
- `.vercel/`, `dist/`, `build/`, `out/` (build artifacts)
- `.git/`, `.vscode/`, `coverage/` (metadata)

**Estimated savings**: ~40-50% of context when doing large codebase explorations

### 2. Specialized Tools Instead of Bash
- ✅ Using `Glob` for file searches (not `find`)
- ✅ Using `Grep` for content search (not `grep` or `rg`)
- ✅ Using `Read` for file content (not `cat`, `head`, `tail`)
- ✅ Using `Task` agents for complex explorations

**Estimated savings**: ~15-20% by avoiding duplicate tool calls

### 3. Model Selection
- ✅ Claude Haiku 4.5 for this project (99% cheaper than Sonnet for the same work)
- Reserve Sonnet only for architectural decisions that need deeper reasoning

**Estimated savings**: ~90% compared to using Sonnet

## Prompt Caching (Status: Not Yet Confirmed)
Prompt caching is available in Claude API v1.3+ but requires:
- Repeated context (your codebase structure)
- Cache writes cost 1.25x, but cache hits cost only 0.1x
- Potential savings: 90% on cache hits

**Action**: Request caching enablement if available in your Claude Code version.

## Best Practices Going Forward

### For Feature Development
```
✓ Break into small tasks (auth → profile → settings)
✓ Read only affected files
✓ Use Grep to find specific code sections
✓ Avoid reading entire large files
✓ Use Task/Explore agents for "search and understand" tasks
```

### For Bug Fixes
```
✓ Read the specific file with the bug
✓ Search for related error messages
✓ Fix and test locally first
✓ Don't explore unrelated code
```

### For Refactoring
```
✓ Use Glob to find all related files: app/**/*.tsx
✓ Use Grep to understand usage patterns
✓ Make focused changes
✓ Build and test incrementally
```

## Cost Tracking

### Estimated Monthly Costs (Haiku)
- **100 small tasks** (feature/bug fixes): ~$5-10
- **10 medium tasks** (refactoring): ~$3-5
- **5 large tasks** (architecture): ~$2-3
- **Total**: ~$10-18/month with optimization

### Without Optimization (Sonnet)
- Same work: ~$200-300/month

## Quick Reference: Token Saver Commands

When asking for help, provide:
1. **Specific file path** (not "search my codebase")
2. **Exact error message** (not "it's broken")
3. **What you changed** (context matters)
4. **What you want** (clear requirements)

Example Good Request:
```
"In app/generate/page.tsx around line 280, the 'Generate Full Resume' button
isn't responding to clicks. Error: 'Cannot read property handleGenerate'.
Can you check the onClick handler?"
```

Example Bad Request:
```
"The generate page is broken, fix it"
```

## Next Improvements

- [ ] Enable prompt caching if available
- [ ] Create component library documentation
- [ ] Set up .claude directory with task templates
- [ ] Document common patterns for reuse
