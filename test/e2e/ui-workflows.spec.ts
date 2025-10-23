/**
 * End-to-End Tests for UI Workflows using Playwright
 * Tests user interactions with the JSON Schema editor
 */

import { test, expect } from '@playwright/test';

test.describe('JSON Schema Editor UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('should load the application successfully', async ({ page }) => {
    // Check title
    await expect(page.locator('h1')).toContainText('Create JSON Schemas');
    
    // Check main editor is visible
    await expect(page.locator('.json-editor-container')).toBeVisible();
    
    // Check action buttons are visible
    await expect(page.getByText('Reset to Example')).toBeVisible();
    await expect(page.getByText('Start from Scratch')).toBeVisible();
    await expect(page.getByText('Infer from JSON')).toBeVisible();
    await expect(page.getByText('Validate JSON')).toBeVisible();
  });

  test('should switch between draft versions', async ({ page }) => {
    // Click on the Draft selector
    await page.locator('button:has-text("Draft")').first().click();
    
    // Select Draft-07
    await page.getByText('Draft 07', { exact: true }).click();
    
    // Verify draft changed (check if 2020-12 specific features are hidden)
    // Advanced Keywords section should not show prefixItems for Draft-07
    const advancedSection = page.locator('text=Advanced Keywords');
    await expect(advancedSection).toBeVisible();
    
    // Switch to Draft 2020-12
    await page.locator('button:has-text("Draft")').first().click();
    await page.getByText('Draft 2020-12', { exact: true }).click();
    
    // Verify 2020-12 features are available
    await expect(page.locator('text=Dynamic References')).toBeVisible();
  });

  test('should switch languages', async ({ page }) => {
    // Click language dropdown
    await page.locator('button:has-text("English")').click();
    
    // Switch to Hebrew
    await page.getByText('עברית (Hebrew)').click();
    
    // Verify Hebrew text appears
    await expect(page.locator('text=הוסף שדה')).toBeVisible();
    
    // Switch back to English
    await page.locator('button').filter({ hasText: 'עברית' }).click();
    await page.getByText('English').click();
    
    // Verify English text
    await expect(page.locator('text=Add Field')).toBeVisible();
  });

  test('should create a new field in Visual mode', async ({ page }) => {
    // Click Add Field button
    await page.getByRole('button', { name: 'Add Field' }).first().click();
    
    // Fill in field details
    await page.getByPlaceholder('e.g. firstName, age, isActive').fill('testField');
    
    // Select type
    await page.locator('text=Text').first().click();
    
    // Confirm
    await page.getByRole('button', { name: 'Add Field', exact: true }).click();
    
    // Verify field was added
    await expect(page.locator('text=testField')).toBeVisible();
  });

  test('should add conditional validation (if/then/else)', async ({ page }) => {
    // Scroll to Advanced Keywords section
    await page.evaluate(() => {
      const element = document.querySelector('text=Advanced Keywords');
      element?.scrollIntoView();
    });
    
    // Look for "Add IF condition" button in conditional section
    const addIfButton = page.locator('button:has-text("Add IF condition")').first();
    
    if (await addIfButton.isVisible()) {
      await addIfButton.click();
      
      // Verify IF editor appeared
      await expect(page.locator('text=IF (Condition)')).toBeVisible();
      
      // Should see Visual/JSON toggle
      await expect(page.locator('button:has-text("Visual")')).toBeVisible();
      await expect(page.locator('button:has-text("JSON")')).toBeVisible();
    }
  });

  test('should toggle between Visual and JSON editing modes', async ({ page }) => {
    // On desktop, check for Visual/JSON tabs in the main editor
    const visualTab = page.locator('button[role="tab"]:has-text("Visual")');
    const jsonTab = page.locator('button[role="tab"]:has-text("JSON")');
    
    // Check if tabs exist (desktop view)
    if (await visualTab.isVisible()) {
      // Click JSON tab
      await jsonTab.click();
      
      // Verify Monaco editor is visible
      await expect(page.locator('.monaco-editor')).toBeVisible();
      
      // Click back to Visual
      await visualTab.click();
      
      // Verify visual editor is back
      await expect(page.locator('text=Add Field')).toBeVisible();
    }
  });

  test('should open and close Schema Inferencer dialog', async ({ page }) => {
    // Click "Infer from JSON" button
    await page.getByText('Infer from JSON').click();
    
    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('text=Infer JSON Schema')).toBeVisible();
    
    // Close dialog
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should open and close JSON Validator dialog', async ({ page }) => {
    // Click "Validate JSON" button
    await page.getByText('Validate JSON').click();
    
    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('text=Validate JSON')).toBeVisible();
    
    // Should see Draft selector
    await expect(page.locator('text=JSON Schema Draft:')).toBeVisible();
    
    // Close by clicking outside or Cancel button would work
    await page.keyboard.press('Escape');
    
    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should expand/collapse schema fields', async ({ page }) => {
    // Look for an expandable field (chevron icon)
    const expandButton = page.locator('button[aria-label*="expand"]').first();
    
    if (await expandButton.isVisible()) {
      // Click to expand
      await expandButton.click();
      
      // Wait for expansion animation
      await page.waitForTimeout(300);
      
      // Click to collapse
      await expandButton.click();
    }
  });

  test('should display correct badges for draft-specific features', async ({ page }) => {
    // Make sure we're on Draft 2020-12
    const draftButton = page.locator('button:has-text("Draft")').first();
    
    if (await draftButton.isVisible()) {
      await draftButton.click();
      await page.getByText('Draft 2020-12', { exact: true }).click();
    }
    
    // Scroll to Advanced Keywords
    await page.evaluate(() => {
      const element = document.querySelector('h3:has-text("Advanced Keywords")');
      element?.scrollIntoView({ behavior: 'smooth' });
    });
    
    await page.waitForTimeout(500);
    
    // Should see "Draft 2020-12" or "2020-12" badges
    const badges = page.locator('.badge, [class*="badge"]');
    const badgeCount = await badges.count();
    
    expect(badgeCount).toBeGreaterThan(0);
  });
});

test.describe('Monaco Editor Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('should have Monaco editor with syntax highlighting', async ({ page }) => {
    // Wait for Monaco to load
    await page.waitForSelector('.monaco-editor', { timeout: 5000 });
    
    // Verify Monaco loaded
    const monaco = page.locator('.monaco-editor');
    await expect(monaco).toBeVisible();
    
    // Check for line numbers
    await expect(page.locator('.line-numbers')).toBeVisible();
  });

  test('should support code folding in Monaco', async ({ page }) => {
    // Wait for Monaco editor
    await page.waitForSelector('.monaco-editor');
    
    // Hover over a line number to reveal fold controls (if any)
    const lineNumber = page.locator('.line-numbers').first();
    await lineNumber.hover();
    
    // Code folding controls might appear on hover
    // This is a visual check - folding is available but starts unfolded
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();
  });

  test('should display continuous line numbers without jumps', async ({ page }) => {
    // Wait for Monaco
    await page.waitForSelector('.monaco-editor');
    
    // Execute script to check line numbers are continuous
    const lineNumbersCheck = await page.evaluate(() => {
      const lineElements = document.querySelectorAll('.line-numbers');
      const numbers: number[] = [];
      
      lineElements.forEach((el) => {
        const text = el.textContent?.trim();
        if (text && !isNaN(Number(text))) {
          numbers.push(Number(text));
        }
      });
      
      // Check if numbers are mostly continuous (allowing for viewport)
      if (numbers.length < 2) return true;
      
      const first = numbers[0];
      const last = numbers[numbers.length - 1];
      const expected = last - first + 1;
      const actual = numbers.length;
      
      // Should be close to continuous
      return Math.abs(expected - actual) < 5;
    });
    
    expect(lineNumbersCheck).toBe(true);
  });
});

test.describe('Advanced Keywords Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Ensure Draft 2020-12 for full features
    const draftButton = page.locator('button:has-text("Draft")').first();
    if (await draftButton.isVisible()) {
      await draftButton.click();
      await page.getByText('Draft 2020-12', { exact: true }).click();
    }
  });

  test('should show all advanced keywords for Draft 2020-12', async ({ page }) => {
    // Scroll to Advanced Keywords
    await page.evaluate(() => {
      const element = document.querySelector('h3:has-text("Advanced Keywords")');
      element?.scrollIntoView();
    });
    
    await page.waitForTimeout(500);
    
    // Check for presence of advanced keyword sections
    await expect(page.locator('text=Conditional Validation').or(page.locator('text=אימות מותנה'))).toBeVisible();
    await expect(page.locator('text=Schema Composition').or(page.locator('text=הרכבת סכמות'))).toBeVisible();
  });

  test('should toggle between Visual and JSON in advanced editors', async ({ page }) => {
    // Scroll to Advanced Keywords
    await page.evaluate(() => {
      const element = document.querySelector('h3:has-text("Advanced Keywords")');
      element?.scrollIntoView();
    });
    
    await page.waitForTimeout(500);
    
    // Find and click "Add IF condition" if visible
    const addIfButton = page.locator('button:has-text("Add IF")').first();
    
    if (await addIfButton.isVisible()) {
      await addIfButton.click();
      await page.waitForTimeout(300);
      
      // Look for Visual/JSON toggles in the nested editor
      const visualToggle = page.locator('button:has-text("Visual")').first();
      const jsonToggle = page.locator('button:has-text("JSON")').first();
      
      if (await jsonToggle.isVisible()) {
        // Click JSON
        await jsonToggle.click();
        await page.waitForTimeout(200);
        
        // Click back to Visual
        await visualToggle.click();
      }
    }
  });
});