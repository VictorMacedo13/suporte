---
name: dgcom-clean-arch-rules
description: Use sempre que escrever, mover ou revisar codigo em apps/api/src/modules/. Define a dependency rule, onde colocar entities, use cases, repositorios e controllers, e como retornar erros usando Either.
---

# dgcom-clean-arch-rules

Regras dos modulos em apps/api/src/modules/<modulo>/.

## Dependency Rule

Sentido: infrastructure depende de application; application depende de domain; domain nao depende de ninguem.

- domain/ e o nucleo puro: nao importa Express, Drizzle, Zod ou qualquer biblioteca externa.
- application/ orquestra domain/. Nao importa Express nem Drizzle. Nao importa Zod (DTOs sao tipos puros; schemas Zod compartilhados moram em @dgcom/contracts).
- infrastructure/ pode importar dos dois anteriores e usar libs externas livremente.

## Onde colocar cada coisa

| O que | Onde |
|---|---|
| Invariantes de uma entidade | domain/entities/<X>.ts (estatico create) |
| Estados/enums com comportamento | domain/value-objects/<VO>.ts |
| Eventos de dominio | domain/events/<X>Event.ts |
| Interface de persistencia | domain/repositories/I<X>Repository.ts |
| Orquestracao de 1 caso de uso | application/use-cases/<Caso>/<Caso>.ts |
| Implementacao Drizzle | infrastructure/repositories/Drizzle*.ts |
| Validacao de payload HTTP | infrastructure/http/controllers/*.ts (Zod) |
| Rotas Express | infrastructure/http/routes.ts |
| Wiring (DI manual) | modules/<modulo>/index.ts (composition root) |

## Either: caminho feliz vs erro

Em use cases, retornar Either<DomainError, Output>. Em vez de throw para regra de negocio, devolver left(new <X>Error()). Erros tecnicos inesperados (DB fora, Resend timeout) podem usar throw — o errorHandler global captura.

Em controllers: chamar useCase.execute(input); se result.isLeft() chamar next(result.value); senao res.json(result.value).

Erros de dominio estendem DomainError (shared/domain/errors/DomainError.ts) e expoem code e httpStatus.

## Entities

- Setters publicos sao proibidos. Mudancas de estado vao por metodos de dominio.
- Construtor privado; factory estatica create() valida invariantes.
- Entity nunca importa Drizzle — recebe dados primitivos do repositorio, que faz o mapeamento.
- Getters apenas para leitura.

## Use Cases

- 1 use case = 1 acao. Sem god-classes.
- Construtor recebe dependencias do domain (interfaces de repositorio, services).
- O composition root faz a injecao concreta.
- Implemente UseCase<Input, Output> para tipagem consistente.

## Checklist antes de fechar PR

- Algum import em domain/ apontando para fora de domain/ ou shared/domain/?
- Algum throw num caminho de regra de negocio (deveria ser left())?
- O caso de uso tem .spec.ts co-localizado, sem mock de Drizzle/Express?
- O controller tem Zod.parse antes de chamar o use case?
- O composition root esta registrado em apps/api/src/shared/http/app.ts?
