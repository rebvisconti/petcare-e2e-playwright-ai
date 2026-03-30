# Testes de Validação do Formulário de Agendamento

## 📋 Visão Geral

Este conjunto de testes valida completamente o formulário de agendamento do PetCare, certificando-se de que:

- ✅ Todos os campos obrigatórios são validados
- ✅ Mensagens de erro corretas são exibidas
- ✅ Validações de formato (telefone, data) funcionam
- ✅ Limites de caracteres são respeitados
- ✅ Estados de erro são gerenciados corretamente
- ✅ Caracteres especiais são suportados

## 🧪 Testes Implementados

### 1. **Validação de Campos Obrigatórios**

#### `deve validar que campo Nome do Pet é obrigatório`
- **Objetivo:** Confirmar que o campo não aceita submissão vazia
- **Passos:** Deixar vazio, preencher outros campos, tentar enviar
- **Esperado:** Mensagem de erro "Campo obrigatório"

#### `deve validar que campo Nome do Tutor é obrigatório`
- **Objetivo:** Confirmar que o tutor deve ser informado
- **Passos:** Deixar vazio, preencher outros campos, tentar enviar
- **Esperado:** Mensagem de erro "Campo obrigatório"

#### `deve validar que campo Telefone é obrigatório`
- **Objetivo:** Confirmar que telefone é obrigatório
- **Passos:** Deixar vazio, preencher outros campos, tentar enviar
- **Esperado:** Mensagem de erro "Campo obrigatório"

#### `deve validar que campo Serviço é obrigatório`
- **Objetivo:** Confirmar que pelo menos um serviço deve ser selecionado
- **Passos:** Deixar vazio, preencher outros campos, tentar enviar
- **Esperado:** Mensagem de erro "Campo obrigatório"

#### `deve validar que campo Porte é obrigatório`
- **Objetivo:** Confirmar que o porte do pet é obrigatório
- **Passos:** Deixar vazio, preencher outros campos, tentar enviar
- **Esperado:** Mensagem de erro "Campo obrigatório"

#### `deve validar que campo Data é obrigatório`
- **Objetivo:** Confirmar que a data é obrigatória
- **Passos:** Deixar vazio, preencher outros campos, tentar enviar
- **Esperado:** Mensagem de erro "Campo obrigatório"

#### `deve validar que campo Horário é obrigatório`
- **Objetivo:** Confirmar que o horário é obrigatório
- **Passos:** Deixar vazio, preencher outros campos, tentar enviar
- **Esperado:** Mensagem de erro "Campo obrigatório"

---

### 2. **Validações de Formato**

#### `deve validar formato do Telefone`
- **Objetivo:** Rejeitar telefones com formato inválido
- **Dados:** Telefone com menos de 9 dígitos (ex: "123")
- **Esperado:** Mensagem "Telefone inválido"

#### `deve validar que Data não pode ser anterior à hoje`
- **Objetivo:** Rejeitar datas do passado
- **Dados:** Data anterior à hoje (ex: "2020-01-01")
- **Esperado:** Mensagem "Data inválida"

---

### 3. **Validações de Comprimento**

#### `deve validar comprimento máximo do Nome do Pet`
- **Objetivo:** Validar limite de caracteres
- **Dados:** Nome com 101+ caracteres
- **Esperado:** Mensagem de erro ou truncamento

#### `deve validar comprimento máximo do Nome do Tutor`
- **Objetivo:** Validar limite de caracteres
- **Dados:** Nome com 101+ caracteres
- **Esperado:** Mensagem de erro ou truncamento

---

### 4. **Validações de Aceitação**

#### `deve aceitar telefone com ou sem formatação`
- **Objetivo:** Flexibilidade no formato do telefone
- **Dados:** Telefones diversos (ex: "91234-5678", "912345678")
- **Esperado:** Aceitação bem-sucedida

#### `deve permitir caracteres especiais no Nome do Pet`
- **Objetivo:** Suportar nomes compostos
- **Dados:** "Rex-José", "Maria's Pet"
- **Esperado:** Submissão bem-sucedida

---

### 5. **Validações de Espaços em Branco**

#### `deve validar espaços em branco como campos vazios`
- **Objetivo:** Evitar que campos preenchidos apenas com espaços sejam aceitos
- **Dados:** Campos preenchidos com "   "
- **Esperado:** Múltiplas mensagens de erro

---

### 6. **Comportamentos de Estado**

#### `deve exibir múltiplas mensagens de erro simultaneamente`
- **Objetivo:** Mostrar todos os erros ao uma vez
- **Dados:** Formulário completamente vazio
- **Esperado:** Todas as 7 mensagens de erro visíveis

#### `deve limpar mensagem de erro quando campo é preenchido`
- **Objetivo:** Feedback em tempo real
- **Dados:** Preencher campo após erro
- **Esperado:** Mensagem de erro desaparece

#### `deve permitir edição após erro de validação`
- **Objetivo:** Permitir recuperação de erros
- **Dados:** Preencher corretamente após erro inicial
- **Esperado:** Submissão bem-sucedida na segunda tentativa

#### `deve desabilitar botão de envio enquanto valida`
- **Objetivo:** Evitar duplas submissões
- **Esperado:** Botão desabilitado durante validação (opcional, depende da implementação)

---

## 🏃 Como Executar

### Executar todos os testes de validação
```bash
npx playwright test appointment-form-validation.spec.ts
```

### Executar um teste específico
```bash
npx playwright test appointment-form-validation.spec.ts -g "deve validar que campo Nome do Pet"
```

### Executar com interface gráfica
```bash
npx playwright test appointment-form-validation.spec.ts --ui
```

### Executar com modo debug
```bash
npx playwright test appointment-form-validation.spec.ts --debug
```

### Gerar relatório HTML
```bash
npx playwright test appointment-form-validation.spec.ts --reporter=html
```

---

## 📊 Cobertura de Testes

| Categoria | Quantidade | Status |
|-----------|-----------|--------|
| Campos Obrigatórios | 7 | ✅ |
| Validações de Formato | 2 | ✅ |
| Limites de Comprimento | 2 | ✅ |
| Aceitação de Valores | 2 | ✅ |
| Espaços em Branco | 1 | ✅ |
| Estados e Comportamentos | 5 | ✅ |
| **TOTAL** | **19** | **✅** |

---

## 🔍 Estrutura de Dados de Teste

### Arquivos Relacionados

- `appointment-form-validation.spec.ts` - Suite de testes principal
- `validation-data.ts` - Constantes e dados de teste
- `appointment-form.component.ts` - Componente POM

### Constantes Disponíveis em `validation-data.ts`

```typescript
// Mensagens de validação esperadas
VALIDATION_MESSAGES.REQUIRED_FIELD
VALIDATION_MESSAGES.INVALID_PHONE
VALIDATION_MESSAGES.INVALID_DATE

// Dados de teste pré-construídos
ValidationTestData.EMPTY_FORM_SUBMISSION
ValidationTestData.VALID_COMPLETE_FORM
ValidationTestData.INVALID_PHONE_FORM

// Seletores do formulário
FORM_FIELD_SELECTORS.PET_NAME
ERROR_SELECTORS.PHONE
SUCCESS_SELECTORS.MESSAGE
```

---

## ⏱️ Timeouts Utilizados

- **SHORT_TIMEOUT** (5s): Validações locais e mensagens de erro
- **MEDIUM_TIMEOUT** (10s): Chamadas de API

---

## 🛡️ Boas Práticas Aplicadas

✅ **Web-first Assertions:** Todas as asserções usam `await expect()`

✅ **POM Pattern:** Uso de `AppointmentFormComponent` para encapsular seletores

✅ **test.step():** Cada passo é documentado e aparece em traces

✅ **Timeouts Nomeados:** Constantes `SHORT_TIMEOUT` e `MEDIUM_TIMEOUT`

✅ **Cleanup:** `test.afterEach()` garante limpeza de recursos

✅ **Independência:** Cada teste é independente e pode rodar em qualquer ordem

---

## 🔧 Como Adicionar Novos Testes

### Template para novo teste

```typescript
test('deve validar [descrição]', async ({ page }) => {
  await test.step('Setup', async () => {
    // Preparar dados
  })

  await test.step('Ação', async () => {
    // Executar ação
  })

  await test.step('Verificação', async () => {
    // Validar resultado
  })
})
```

### Adicionar nova mensagem de validação

1. Adicione em `validation-data.ts`:
```typescript
export const VALIDATION_MESSAGES = {
  // ... existentes
  NEW_MESSAGE: 'Descrição da mensagem',
}
```

2. Use no teste:
```typescript
await expect(errorMessage).toContainText(VALIDATION_MESSAGES.NEW_MESSAGE)
```

---

## 🐛 Troubleshooting

### Teste falha: "Timeout waiting for selector"
- Verifique se o seletor corresponde ao HTML atual
- Aumente o timeout se a validação é lenta
- Inspecione com `playwright-cli snapshot`

### Teste falha: "Element not interactable"
- Verifique se outro elemento está bloqueando
- Use `page.evaluate()` para inspecionar visibilidade

### API retorna erro inesperado
- Verifique logs de servidor
- Valide dados enviados com `page.request.post()`

---

## 📋 Checklist de Implementação

Se você está implementando validações na aplicação, garanta que:

- [ ] Validações são executadas no frontend E backend
- [ ] Mensagens de erro são específicas por campo
- [ ] Múltiplos erros são mostrados simultaneamente
- [ ] Espaços em branco são tratados como vazios
- [ ] Datas passadas são rejeitadas
- [ ] Telefones aceitem múltiplos formatos
- [ ] Nomes suportem caracteres especiais
- [ ] Limites de comprimento são documentados

---

## 📞 Suporte

Para dúvidas sobre os testes, consulte:
- Copilot Instructions: `.github/copilot-instructions.md`
- Documentação Playwright: https://playwright.dev
- Page Objects: `src/pages/`
