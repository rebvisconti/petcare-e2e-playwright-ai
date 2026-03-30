import { test as setup } from '@playwright/test'
import { AuthHelper } from '../src/utils/auth.helper'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await AuthHelper.login(page)
  
  // Salva o estado de autenticação
  await page.context().storageState({ path: authFile })
})