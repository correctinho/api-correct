# Documentação: Usecase `get-by-document`

**Caminho:** `src/modules/AppUser/AppUserManagement/usecases/UserAuth/get-by-document/get-by-document.usecase.ts`

## Objetivo
Esta API tem o objetivo de orientar o frontend sobre o status atual do usuário a partir do seu documento (ex: CPF/CNPJ). Ela verifica diversas etapas do cadastro do usuário, retornando booleanos que indicam o que já foi preenchido e qual é o status de validação dos documentos enviados. Isso permite que o frontend saiba exatamente para qual tela direcionar o usuário para que ele complete seu cadastro.

## Retorno Padrão
A estrutura de retorno segue a interface `OutputGetByDocument`:
- `status`: booleano (reflete se o cadastro básico está ativo e/ou validado)
- `UserAuth`: booleano (indica se as credenciais de autenticação existem)
- `UserInfo`: booleano (indica se as informações pessoais existem)
- `Address`: booleano (indica se o endereço foi cadastrado)
- `UserValidation`: Objeto com o status de análise dos seguintes documentos, possuindo como estado inicial padrão `pending_to_send`:
  - `document_front_status`
  - `document_back_status`
  - `selfie_status`
  - `document_selfie_status`

---

## Fluxo e Condições (Passo a Passo)

O usecase inicialmente formata/valida o documento recebido e realiza a busca principal na tabela de autenticação (`appUserRepository.findByDocument`). A partir daí, o fluxo se divide nas condições abaixo:

### 1. Quando o `UserAuth` NÃO é encontrado (`!getUserAuth`)
Neste cenário, não existe registro de login/senha para o documento informado. O sistema então busca diretamente na tabela `UserInfo` (`appUserInfoRepository.findByDocumentUserInfo`), pois o usuário pode ter preenchido dados pessoais sem finalizar a criação das credenciais de acesso.

*   **Condição 1.A:** Se **NÃO** encontrar `UserInfo`:
    *   **Retorno:**
        *   `status`: `false`
        *   `UserAuth`: `false`
        *   `UserInfo`: `false`
        *   `Address`: `false`
        *   `UserValidation`: Todos `pending_to_send`
*   **Condição 1.B:** Se encontrar `UserInfo`, verifica se existe um endereço associado (`address_uuid`):
    *   Se **NÃO** possuir endereço vinculado:
        *   **Retorno:**
            *   `status`: `false`
            *   `UserAuth`: `false`
            *   `UserInfo`: `true`
            *   `Address`: `false`
            *   `UserValidation`: Todos `pending_to_send`
    *   Se **POSSUIR** endereço vinculado:
        *   **Retorno:**
            *   `status`: `false`
            *   `UserAuth`: `false`
            *   `UserInfo`: `true`
            *   `Address`: `true`
            *   `UserValidation`: Todos `pending_to_send`

---

### 2. Quando o `UserAuth` É encontrado (`getUserAuth` é verdadeiro)
Neste cenário, as credenciais de autenticação do usuário já existem. O sistema passa a analisar a integridade do restante do cadastro.

*   **Condição 2.A:** Se o registro de autenticação (`getUserAuth`) **NÃO** possuir um vínculo com dados pessoais (`user_info_uuid` ausente):
    *   **Retorno:**
        *   `status`: `false`
        *   `UserAuth`: `true`
        *   `UserInfo`: `false`
        *   `Address`: `false`
        *   `UserValidation`: Todos `pending_to_send`

*   **Condição 2.B:** Caso possua `user_info_uuid`, o sistema busca os dados em `appUserInfoRepository.find`. Se **NÃO** encontrar um registro válido no banco de dados para este ID:
    *   **Retorno:**
        *   `status`: `false`
        *   `UserAuth`: `true`
        *   `UserInfo`: `false`
        *   `Address`: `false`
        *   `UserValidation`: Todos `pending_to_send`

A partir deste ponto, temos confirmação de que `UserAuth` e `UserInfo` existem e são válidos. A variável `status` será definida preliminarmente como `true` caso a conta `UserInfo.status` seja `'active'`, senão `false`.

*   **Condição 2.C:** Verifica a existência de Endereço (`address_uuid` ausente no registro `UserInfo`):
    *   **Retorno:**
        *   `status`: `false` *(O sistema força como false pois o cadastro ainda está incompleto)*
        *   `UserAuth`: `true`
        *   `UserInfo`: `true`
        *   `Address`: `false`
        *   `UserValidation`: Todos `pending_to_send`

*   **Condição 2.D:** Se possui endereço, mas **NÃO** possui tabela de validação de documentos iniciada (`user_document_validation_uuid` ausente):
    *   **Retorno:**
        *   `status`: `true` *(O sistema força como true)*
        *   `UserAuth`: `true`
        *   `UserInfo`: `true`
        *   `Address`: `true`
        *   `UserValidation`: Todos `pending_to_send`

*   **Condição 2.E:** Se possui vínculo com validação de documentos, busca na respectiva tabela (`appUserValidationRepository.findStatuses`):
    *   Se ocorrer uma falha e **NÃO** encontrar as validações:
        *   **Retorno:**
            *   `status`: `true` *(O sistema força como true)*
            *   `UserAuth`: `true`
            *   `UserInfo`: `true`
            *   `Address`: `true`
            *   `UserValidation`: Todos `pending_to_send`
    *   Se **ENCONTRAR** as validações com sucesso (Cenário completo esperado):
        *   **Retorno:**
            *   `status`: Valor extraído inicialmente do `getUserInfo.status === 'active'`
            *   `UserAuth`: `true`
            *   `UserInfo`: `true`
            *   `Address`: `true`
            *   `UserValidation`: Preenchido com os status reais do banco de dados para cada documento (ex: `approved`, `under_analysis`, `rejected`, `pending_to_send`).
