# Agent Rules

## Task Branch Workflow

Whenever starting implementation of a task from `tasks/**`, first create and switch to a dedicated branch from an up-to-date `main`.

`main` must always be updated from the remote before starting a task. If `main` cannot be updated, stop and report the blocker instead of starting implementation from a potentially stale base.

Required flow:

1. Check the current worktree status.
2. Switch to `main`.
3. Update `main` from the remote.
4. Create a task branch from `main`.
5. Only then begin implementation.

Use branch names that identify the task, for example:

```bash
git checkout main
git pull --ff-only
git checkout -b task/<task-id>-short-description
```

If the worktree has uncommitted changes that would make switching branches unsafe, stop and ask the user how to proceed instead of stashing, committing, or discarding changes automatically.

## Task Documentation

Whenever implementing or finishing a task from `tasks/**`, update the corresponding task document before considering the task complete.

Required updates:

1. Mark completed subtasks and test checklist items.
2. Update any implementation notes, relevant files, or deferred follow-ups discovered during the work.
3. Update the task index or summary document when it tracks task completion status.
4. Include the verification performed, such as tests or builds that were run.

Do not leave a task marked as pending after its implementation has been completed.
