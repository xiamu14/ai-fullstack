# Git Subtree Guide

The parent repository at `ai-fullstack/` manages three subdirectories via `git subtree`:

- `agent-course` (branch `subtree/agent-course`, remote `agent-course` -> `git@github.com:xiamu14/agent-advanced-course.git`)
- `backend-course` (branch `subtree/backend-course`)
- `exam-question` (branch `subtree/exam-question`)

Run all commands below from the `ai-fullstack/` root directory (or pass `-C /Users/ben/Workspace/Project/ai-fullstack`).

## Daily Commits

Stage and commit directly in the parent repository:

```bash
git add -A
git commit -m "feat(backend-course): ..."
```

## Split and Sync Subtree Branches

Extract the latest changes for a subdirectory into its `subtree/<name>` branch:

```bash
git subtree split --prefix=backend-course -b subtree/backend-course
git subtree split --prefix=agent-course -b subtree/agent-course
git subtree split --prefix=exam-question -b subtree/exam-question
```

## Push to a Subtree Remote

```bash
# Push to an existing remote (e.g. agent-course)
git subtree push --prefix=agent-course agent-course main

# Add a remote for another subdirectory and push
git remote add <remote-name> <repo-url>
git subtree push --prefix=<dir> <remote-name> main
```

## Pull Updates from a Subtree Remote

```bash
git subtree pull --prefix=agent-course agent-course main
```

Add `--squash` to combine remote commits into a single merge commit in the parent repository:

```bash
git subtree pull --prefix=<dir> <remote-name> main --squash
```

## Add a New Subtree

```bash
git remote add <remote-name> <repo-url>
git subtree add --prefix=<dir> <remote-name> main
```
