import { test, expect } from '@playwright/test';

test('PetBnB homepage has title and header', async ({ page }) => {
  await page.goto('/');
  
  // Check page title
  await expect(page).toHaveTitle(/PetBnB/);
  
  // Check for header content
  const header = page.locator('h1');
  await expect(header).toContainText('PetBnB');
  
  // Check for subtitle
  const subtitle = page.getByText('Find trusted pet sitters in your neighborhood');
  await expect(subtitle).toBeVisible();
});

test('map loads and shows controls', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the map to load
  await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  
  // Check that map controls are present
  const nearbyButton = page.getByText('Nearby Sitters');
  await expect(nearbyButton).toBeVisible();
  
  const allButton = page.getByText('All Sitters');
  await expect(allButton).toBeVisible();
  
  // Check that the distance control is present when "Nearby Sitters" is selected
  const distanceControl = page.getByText('Search radius:');
  await expect(distanceControl).toBeVisible();
});

test('sitter list appears', async ({ page }) => {
  await page.goto('/');
  
  // Wait for sitters to load
  await page.waitForSelector('.sitter-list', { timeout: 10000 });
  
  // Check that sitter list header is present
  const sitterListHeader = page.getByText(/Available Pet Sitters/);
  await expect(sitterListHeader).toBeVisible();
  
  // Check that sitter cards are present (might be mock data)
  const sitterCards = page.locator('.sitter-card');
  await expect(sitterCards.first()).toBeVisible({ timeout: 5000 });
});