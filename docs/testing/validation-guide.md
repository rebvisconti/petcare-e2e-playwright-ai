# Guia de Uso - Testes de Validação do Formulário

## 🎯 Propósito dos Testes

Este arquivo contém exemplos práticos de como executar, debugar e estender os testes de validação do formulário de agendamento.

---

## 📌 Exemplos de Execução

### Exemplo 1: Rodar todos os testes de uma vez
```bash
npx playwright test appointment-form-validation.spec.ts
```
**Saída esperada:**
```
Creating Appointment ✓ (multiple tests...)
✓ 19 passed (45.2s)
```

### Exemplo 2: Rodar apenas um teste específico
```bash
npx playwright test appointment-form-validation.spec.ts -g "Nome do Pet"
```
**Resultado:** Executa apenas testes que correspondem ao padrão "Nome do Pet"

### Exemplo 3: Rodar com visualização em tempo real (UI Mode)
```bash
npx playwright test appointment-form-validation.spec.ts --ui
```
**O que você verá:**
- Barra de progresso dos testes
- Snapshots da página para cada step
- Rastreamento de rede
- Console output

### Exemplo 4: Modo Debug - Pausar e Inspecionar
```bash
npx playwright test appointment-form-validation.spec.ts --debug -g "Múltiplas mensagens"
```
**Como usar:**
1. O Playwright abrirá um navegador e pausará na primeira ação
2. Use os botões na barra de ferramentas para avançar
3. Inspecione o DOM no DevTools integrado
4. Coloque breakpoints clicando nas linhas do código

### Exemplo 5: Gerar relatório em HTML
```bash
npx playwright test appointment-form-validation.spec.ts
npx playwright show-report
```
**Acesso:** Abre automaticamente `http://localhost:9323`

---

## 🔍 Debugging Prático

### Situação 1: Teste falha porque seletor não encontra elemento

**Erro típico:**
```
Error: locator.fill: Timeout 5000ms exceeded waiting for locator [data-testid="erro-nome-pet"]
```

**Solução passo a passo:**

1. **Tire um snapshot da página:**
```bash
playwright-cli open http://localhost:3001
playwright-cli goto http://localhost:3001/appointments
playwright-cli snapshot
```

2. **Inspecione o HTML gerado:**
```bash
# Procure pelo erro no HTML renderizado
playwright-cli eval "document.querySelector('[data-testid=\"erro-nome-pet\"]')"
```

3. **Se o seletor mudou, atualize:**
```typescript
// Em appointment-form.component.ts
readonly errorPetName = page.locator('[data-testid="validation-error-pet-name"]')
```

### Situação 2: Validação não funciona - formulário aceita valores inválidos

**Passos para investigar:**

1. **Verifique se a validação está no frontend ou backend:**
```bash
# Inspecione a request enviada
playwright-cli open http://localhost:3001
playwright-cli network  # Ativa monitor de rede
playwright-cli click e7  # Clique no botão submit
```

2. **Se a request foi enviada, problema é no backend:**
- Adicione logs no servidor
- Verifique endpoint POST

3. **Se a request não foi enviada, problema é no frontend:**
- Valide que JavaScript de validação está carregando
- Verifique console para erros:
```bash
playwright-cli console error
```

---

## 🚀 Cenários de Uso Real

### Cenário A: Antes de Fazer Deploy

Garanta que todas as validações funcionam:

```bash
# 1. Rodar testes localmente
npx playwright test appointment-form-validation.spec.ts

# 2. Se todos passarem, fazer deploy
git push origin feature/validation

# 3. CI/CD rodará novamente automaticamente
```

### Cenário B: Implementação de Nova Validação

Você adicionou validação de CPF ao formulário:

1. **Adicione o teste:**
```typescript
test('deve validar formato do CPF', async ({ page }) => {
  await homePage.appointmentForm.cpfInput.fill('123.456.789-00')  // Inválido
  await homePage.appointmentForm.submitButton.click()
  
  const error = page.locator('[data-testid="erro-cpf"]')
  await expect(error).toBeVisible()
  await expect(error).toContainText('CPF inválido')
})
```

2. **Rode apenas esse teste:**
```bash
npx playwright test appointment-form-validation.spec.ts -g "CPF"
```

3. **Quando falhar (esperado), implemente a validação na UI**

4. **Rode novamente até passar**

### Cenário C: Teste Flaky (às vezes passa, às vezes falha)

**Sintomas:**
```
✓ Passou na 1ª vez
✗ Falhou na 2ª vez
✓ Passou na 3ª vez
```

**Investigação:**

1. **Aumente timeout temporariamente:**
```typescript
//await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
await expect(errorMessage).toBeVisible({ timeout: 15_000 })  // Teste com timeout maior
```

2. **Se passar com timeout maior, há race condition:**
- Adicione `page.waitForLoadState()` antes da verificação
- Use `expect.poll()` ao invés de esperar uma única vez

3. **Se ainda falhar, inspecione ordem de execução:**
```bash
npx playwright test --debug  # Use step-by-step
```

---

## 🔄 Integração com CI/CD

### Configuração para GitHub Actions

No arquivo `.github/workflows/tests.yml`:

```yaml
name: Testes de Validação

on: [push, pull_request]

jobs:
  validation-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npx playwright install
      
      # Rodar testes de validação com 1 worker (mais estável em CI)
      - run: npx playwright test appointment-form-validation.spec.ts --workers=1
      
      # Se falhar, fazer upload do relatório
      - if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Rodar apenas testes de validação em PR

```yaml
- run: |
    if [[ ${{ github.event_name }} == "pull_request" ]]; then
      npx playwright test appointment-form-validation.spec.ts
    else
      npx playwright test
    fi
```

---

## 📝 Exemplos de Asserções

### Exemplo 1: Verificar visibilidade de erro
```typescript
const error = page.locator('[data-testid="erro-telefone"]')
await expect(error).toBeVisible({ timeout: 5_000 })
```

### Exemplo 2: Verificar conteúdo de erro
```typescript
await expect(error).toContainText('Telefone inválido')
```

### Exemplo 3: Verificar que erro desapareceu
```typescript
await expect(error).not.toBeVisible()
```

### Exemplo 4: Verificar valor de input após erro
```typescript
const input = page.locator('[data-testid="input-telefone"]')
const value = await input.inputValue()
expect(value).toBe('91234-5678')
```

### Exemplo 5: Verificar múltiplos erros com toPass
```typescript
await expect(async () => {
  await expect(page.locator('[data-testid="erro-nome-pet"]')).toBeVisible({ timeout: 1_000 })
  await expect(page.locator('[data-testid="erro-telefone"]')).toBeVisible({ timeout: 1_000 })
}).toPass({ timeout: 30_000 })
```

---

## 🧱 Estrutura de um Teste Bem Escrito

```typescript
test('deve fazer algo específico @tag', async ({ page }) => {
  // 1️⃣ ARRANGE - Preparar
  await test.step('Preparar dados', async () => {
    // Setup inicial
  })

  // 2️⃣ ACT - Executar
  await test.step('Executar ação', async () => {
    // Interagir com a página
  })

  // 3️⃣ ASSERT - Validar
  await test.step('Validar resultado', async () => {
    // Fazer asserção
  })
})
```

---

## 🎓 Lições Aprendidas

### O que NÃO fazer em testes:

❌ **ERRADO:**
```typescript
// Não esperar com waitForTimeout
await page.waitForTimeout(2000)
await expect(error).toBeVisible()
```

✅ **CORRETO:**
```typescript
// Usar asserção web-first
await expect(error).toBeVisible({ timeout: 2000 })
```

---

❌ **ERRADO:**
```typescript
// Não fazer checks one-shot
const isVisible = await error.isVisible()
expect(isVisible).toBe(true)
```

✅ **CORRETO:**
```typescript
// Usar asserção nativa
await expect(error).toBeVisible()
```

---

❌ **ERRADO:**
```typescript
// Não forçar cliques
await button.click({ force: true })
```

✅ **CORRETO:**
```typescript
// Se não conseguir clicar, outro elemento está bloqueando
await button.click()  // Lança erro informativo
```

---

## 📊 Métricas de Teste

Após rodar os testes, você verá:

```
✓ 19 passed (45.2s)

Platform: linux -- Node.js 18.12.0
Browsers: chromium 120.0.6099.129
Device: Desktop Chrome
```

### Interpretar Resultados

| Métrica | O que significa |
|---------|-----------------|
| `19 passed` | Todos os 19 testes funcionaram |
| `45.2s` | Tempo total de execução |
| `chromium 120.0` | Versão do navegador usado |

---

## 🔗 Links Úteis

- [Documentação Playwright](https://playwright.dev)
- [Web-first Assertions](https://playwright.dev/docs/test-assertions)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Trace Viewer](https://trace.playwright.dev)

---

## 💡 Quick Tips

### Tip 1: Use o Trace Viewer para entender falhas
```bash
npx playwright show-trace test-results/<test_name>/trace.zip
```
Você verá EXATAMENTE o que a página fazia em cada passo.

### Tip 2: Veja logs do servidor enquanto testa
```bash
# Terminal 1: Seu servidor
npm start

# Terminal 2: Seus testes
npx playwright test --debug
```

### Tip 3: Teste um cenário manualmente primeiro
```bash
playwright-cli open http://localhost:3001
# Simule o teste manualmente
# Depois replique os passos no arquivo .spec.ts
```

### Tip 4: Use o modo headed para ver o navegador abrir
```bash
npx playwright test --headed
# Você verá o navegador executar os testes em tempo real
```

### Tip 5: Incremente verbosidade para mais logs
```bash
DEBUG=pw:api npx playwright test --workers=1
```
