# Issue tracker: GitHub

Issues and specs live in GitHub Issues. Use the `gh` CLI.

## Repository

Infer the GitHub repository from the git remote. This repo currently has
no remote. If no GitHub remote exists, obtain an explicit OWNER/REPO
from the user and pass `--repo OWNER/REPO` to issue commands.

## Operations

- Create: `gh issue create --title "..." --body-file <path>`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels`
- Comment: `gh issue comment <number> --body-file <path>`
- Label: `gh issue edit <number> --add-label "..." --remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

Use body files for multiline content. Read label mappings from
`docs/agents/triage-labels.md`.

When a skill says to publish to the issue tracker, create a GitHub
issue. When it says to fetch a ticket, read the issue and its comments.

## Pull requests as a triage surface

PRs as a request surface: no.

## Wayfinding operations

- Map: one issue labelled `wayfinder:map`, with Notes,
  Decisions-so-far, and Fog sections.
- Child tickets: link tickets as GitHub sub-issues. If unavailable,
  add a task list to the map and `Part of #<map>` to each child.
- Types: use `wayfinder:research`, `wayfinder:prototype`,
  `wayfinder:grilling`, or `wayfinder:task`.
- Blocking: use native issue dependencies where available.
  Otherwise add `Blocked by: #<number>` to the child body.
  A ticket is unblocked when every blocker is closed.
- Frontier: select the first open, unblocked, unassigned child
  in map order.
- Claim: assign the ticket to the driving developer before work.
- Resolve: comment with the answer, close the ticket, and append
  a summary and issue link to the map's Decisions-so-far section.
