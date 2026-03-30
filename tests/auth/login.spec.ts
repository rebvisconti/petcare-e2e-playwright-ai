import { test, expect } from '@playwright/test'
import { AuthHelper } from '../../src/utils/auth.helper'

const SHORT_TIMEOUT = 5_000
const MEDIUM_TIMEOUT = 10_000

test.describe('Autenticação de Administrador @auth @smoke', () => {
  test('deve autenticar com credenciais válidas e redirecionar para dashboard', async ({
    page,
  }) => {
    await test.step('Navegar para página de login', async () => {
      await page.goto('/login.html')
      await expect(page).toHaveURL(/.*login\.html/, { timeout: SHORT_TIMEOUT })
    })

    await test.step('Preencher credenciais válidas', async () => {
      await page.fill('[data-testid="input-usuario"]', 'admin')
      await page.fill('[data-testid="input-senha"]', 'petcare123')

      await expect(page.locator('[data-testid="input-usuario"]')).toHaveValue('admin', {
        timeout: SHORT_TIMEOUT,
      })
      await expect(page.locator('[data-testid="input-senha"]')).toHaveValue('petcare123', {
        timeout: SHORT_TIMEOUT,
      })
    })

    await test.step('Submeter login', async () => {
      const navigationPromise = page.waitForURL(/.*index\.html/, {
        timeout: MEDIUM_TIMEOUT,
      })

      await page.click('[data-testid="btn-entrar"]')

      await navigationPromise
      await expect(page).toHaveURL(/.*index\.html/, { timeout: SHORT_TIMEOUT })
    })

    await test.step('Verificar acesso ao dashboard', async () => {
      // Verifica que lista de agendamentos está visível (indicador de admin autenticado)
      const appointmentsList = page.locator('[data-testid="lista-agendamentos"]')
      await expect(appointmentsList).toBeVisible({ timeout: MEDIUM_TIMEOUT })

      // Verifica que botão de logout está disponível
      const logoutButton = page.locator('[data-testid="btn-logout"]')
      await expect(logoutButton).toBeVisible({ timeout: SHORT_TIMEOUT })
    })
  })

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await test.step('Navegar para página de login', async () => {
      await page.goto('/login.html')
      await expect(page).toHaveURL(/.*login\.html/, { timeout: SHORT_TIMEOUT })
    })

    await test.step('Preencher credenciais inválidas', async () => {
      await page.fill('[data-testid="input-usuario"]', 'admin')
      await page.fill('[data-testid="input-senha"]', 'senhaErrada123')

      await expect(page.locator('[data-testid="input-usuario"]')).toHaveValue('admin', {
        timeout: SHORT_TIMEOUT,
      })
      await expect(page.locator('[data-testid="input-senha"]')).toHaveValue(
        'senhaErrada123',
        { timeout: SHORT_TIMEOUT }
      )
    })

    await test.step('Submeter login', async () => {
      await page.click('[data-testid="btn-entrar"]')
    })

    await test.step('Verificar mensagem de erro', async () => {
      // Aguarda a mensagem de erro aparecer
      const errorMessage = page.locator('[data-testid="mensagem-login"]')
      await expect(errorMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })

      // Valida que contém texto de erro
      const errorText = await errorMessage.textContent()
      expect(errorText).toBeTruthy()
      expect(errorText).toMatch(/inválid|incorret|credencial/i)
    })

    await test.step('Verificar que continua na página de login', async () => {
      // URL não deve ter mudado para index.html
      await expect(page).toHaveURL(/.*login\.html/, { timeout: SHORT_TIMEOUT })

      // Lista de agendamentos não deve estar visível
      const appointmentsList = page.locator('[data-testid="lista-agendamentos"]')
      await expect(appointmentsList).not.toBeVisible({ timeout: SHORT_TIMEOUT })
    })
  })
})
