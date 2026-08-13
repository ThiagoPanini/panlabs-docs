---
title: Skills
description: The two published pipeline skills — what a skill is here, when it beats a copied workflow, and how to consume one.
---

# Skills

A skill is a composite GitHub Actions action, published in the house skills
repository and referenced by tag. It packages a procedure that has been run by
hand enough times that the variation between runs has become a risk.

## When a skill is worth it

| Situation | Skill? |
| --- | --- |
| The procedure has steps in a fixed order | yes |
| It has already been run wrong at least once | yes |
| It needs judgement halfway through | no |
| It runs once a quarter | probably not |

The third row is the one that cuts. A procedure with a decision in the middle
becomes a skill with a parameter nobody knows how to fill in, and then the
judgement has merely moved.

## The two published ones

- [Pipeline scaffold](scaffold-de-esteira) — creates the initial pipeline of a
  new repository, with the three workflows from the template.
- [Secret rotation](rotacao-de-segredo) — runs the rotation with a
  dual-acceptance window, with no manual intervention.

## How to consume

Always by tag, and the tag is the house's — the rule about pinning by commit
applies to third-party actions, not to in-house ones:

```yaml
- uses: panlabs/rotacao-de-segredo@v2
  with:
    segredo: prod/api/chave-externa
    regiao: us-east-1
```
