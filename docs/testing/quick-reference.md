# 📋 Referência Rápida - Testes de Validação

## 🎯 Todos os 19 Testes

| # | Nome do Teste | Categoria | Campo | Tipo de Validação |
|----|---|---|---|---|
| 1 | `deve validar que campo Nome do Pet é obrigatório` | Obrigatório | Nome do Pet | Campo vazio |
| 2 | `deve validar que campo Nome do Tutor é obrigatório` | Obrigatório | Nome do Tutor | Campo vazio |
| 3 | `deve validar que campo Telefone é obrigatório` | Obrigatório | Telefone | Campo vazio |
| 4 | `deve validar formato do Telefone` | Formato | Telefone | Formato inválido |
| 5 | `deve validar que campo Serviço é obrigatório` | Obrigatório | Serviço | Campo vazio |
| 6 | `deve validar que campo Porte é obrigatório` | Obrigatório | Porte | Campo vazio |
| 7 | `deve validar que campo Data é obrigatório` | Obrigatório | Data | Campo vazio |
| 8 | `deve validar que Data não pode ser anterior à hoje` | Formato | Data | Data no passado |
| 9 | `deve validar que campo Horário é obrigatório` | Obrigatório | Horário | Campo vazio |
| 10 | `deve exibir múltiplas mensagens de erro simultaneamente` | Estado | Todos | Todos vazios |
| 11 | `deve limpar mensagem de erro quando campo é preenchido` | Estado | Nome Pet | Feedback em tempo real |
| 12 | `deve validar comprimento máximo do Nome do Pet` | Comprimento | Nome Pet | 101+ caracteres |
| 13 | `deve validar comprimento máximo do Nome do Tutor` | Comprimento | Nome Tutor | 101+ caracteres |
| 14 | `deve aceitar telefone com ou sem formatação` | Aceitação | Telefone | Múltiplos formatos |
| 15 | `deve permitir caracteres especiais no Nome do Pet` | Aceitação | Nome Pet | "Rex-José" |
| 16 | `deve validar espaços em branco como campos vazios` | Espaço | Múltiplos | Apenas espaços |
| 17 | `deve desabilitar botão de envio enquanto valida` | Estado | Button | Durante validação |
| 18 | `deve permitir edição após erro de validação` | Recuperação | Múltiplos | Erro → Correção → Sucesso |

---

## 🏃 Comandos Rápidos

### Executar
```bash
# Todos
npx playwright test appointment-form-validation.spec.ts

# Um teste específico
npx playwright test -g "Nome do Pet"

# Com interface visual
npx playwright test appointment-form-validation.spec.ts --ui

# Debug mode
npx playwright test appointment-form-validation.spec.ts --debug

# Relatório
npx playwright show-report
```

### Estrutura de Diretórios
```
✅ appointment-form-validation.spec.ts    [TESTES - 19 testes]
✅ validation-data.ts                     [DADOS - constantes]
✅ VALIDATION_TESTS.md                   [DOCS TÉCNICA]
✅ VALIDATION_GUIDE.md                   [DOCS PRÁTICA]
✅ README.md                             [RESUMO]
✅ CHECKLIST.md                          [VERIFICAÇÃO]
✅ QUICK_REFERENCE.md                    [ESTE ARQUIVO]
```

---

## 🔍 Campos & Seletores

| Campo | Data-TestId | Tipo | Validações |
|------|---|---|---|
| Nome do Pet | `input-nome-pet` | Text | Obrigatório, Max 100 |
| Nome do Tutor | `input-tutor` | Text | Obrigatório, Max 100 |
| Telefone | `input-telefone` | Phone | Obrigatório, Formato |
| Serviço | `select-servico` | Select | Obrigatório |
| Porte | `select-porte` | Select | Obrigatório |
| Data | `input-data` | Date | Obrigatório, Futuro |
| Horário | `select-horario` | Select | Obrigatório |

---

## ⏱️ Timeouts

| Timeout | Valor | Uso |
|---------|-------|-----|
| `SHORT_TIMEOUT` | 5s | Validações locais |
| `MEDIUM_TIMEOUT` | 10s | Chamadas API |

---

## 📊 Cobertura por Categoria

```
Campos Obrigatórios     ████████░░  7/7  ✅
Validações Formato     ██░░░░░░░░  2/2  ✅
Limites Chracters      ██░░░░░░░░  2/2  ✅
Aceitação Valores      ██░░░░░░░░  2/2  ✅
Espaços em Branco      ░░░░░░░░░░  1/1  ✅
Estados Erro           █████░░░░░  5/5  ✅
─────────────────────────────────────
TOTAL                  ██████████  19/19 ✅
```

---

## 🛠️ Troubleshooting Rapido

| Problema | Solução |
|----------|---------|
| Teste falha com "Timeout" | ↑ Aumentar timeout ou debugar |
| Seletor não encontra elemento | Verificar HTML com `playwright-cli` |
| Teste passa localmente, falha em CI | Verificar workers = 1 em CI |
| Múltiplos testes com falhas | Rode com `--debug` para ver seqüência |

---

## 📚 Integração com CI/CD

```yaml
# .github/workflows/tests.yml
- run: npx playwright test appointment-form-validation.spec.ts --workers=1
- if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
```

---

## ✨ Próximos Testes Sugeridos

- [ ] Teste de acessibilidade (WCAG)
- [ ] Teste multi-navegador
- [ ] Teste de performance
- [ ] Snapshot testing

---

**Última Atualização:** 28/03/2026 | **Status:** ✅ Pronto
