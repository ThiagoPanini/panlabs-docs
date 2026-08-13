---
title: Acessos
description: Como a casa concede permissão — por papel e nunca por pessoa —, quem aprova, e o que fazer quando uma chave vaza.
---

# Acessos

<Untranslated />

Ninguém tem permissão. **Papéis têm permissão, e pessoas assumem papéis.** A
diferença não é formal: uma permissão concedida a uma pessoa sobrevive à
mudança de time dela, e é assim que um inventário de acesso deixa de ser
auditável em dois anos.

## Como um acesso nasce

Todo papel é declarado em Terraform, no repositório de acessos, e a concessão a
uma pessoa é a associação dela a um grupo. Nenhum dos dois passos passa pelo
console.

| Etapa | Onde | Quem aprova |
| --- | --- | --- |
| declarar o papel | repositório de acessos | dono do serviço |
| associar pessoa ao grupo | mesmo repositório | gestor da pessoa |
| assumir o papel | terminal da pessoa | ninguém — é o uso |

## O que não existe

**Acesso permanente a `prod`.** A sessão dura uma hora e exige MFA. Um
procedimento que não cabe nisso vira automação, não vira exceção.

**Chave de longa duração para serviço.** Serviço usa identidade federada, e a
única chave de longa duração que existe na casa é a de integração com terceiro
que não suporta federação — e ela rotaciona a cada trinta dias.

## As páginas desta seção

- [Permissões por papel](permissoes-por-papel) — a matriz inteira, quarenta
  linhas.
- [Assumir um papel na AWS](assumir-um-papel-na-aws) — o procedimento de todo
  dia.
- [Rotacionar uma chave](rotacionar-uma-chave) — o procedimento de quando algo
  deu errado.
