import { Page } from '@playwright/test';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  get logoutButton() {
    return this.page.getByText('Or click here to logout');
  }

  get updateSettingsButton() {
    return this.page.getByRole('button', { name: 'Update Settings' })
  }

  get profilePictureURLInput() {
    return this.page.getByPlaceholder('URL of profile picture')
  }

  get profileBioTextarea() {
    return this.page.getByPlaceholder('Short bio about you');
  }
}
