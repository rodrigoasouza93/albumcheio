# Agent Rules

## Task Branch Workflow

Whenever starting implementation of a task from `tasks/**`, first create and switch to a dedicated branch from the latest `main`.

Required flow:

1. Check the current worktree status.
2. Switch to `main`.
3. Update `main` from the remote when available.
4. Create a task branch from `main`.
5. Only then begin implementation.

Use branch names that identify the task, for example:

```bash
git checkout main
git pull --ff-only
git checkout -b task/<task-id>-short-description
```

If the worktree has uncommitted changes that would make switching branches unsafe, stop and ask the user how to proceed instead of stashing, committing, or discarding changes automatically.
