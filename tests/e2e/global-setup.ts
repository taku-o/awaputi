/**
 * Global setup for E2E tests
 */

import { chromium } from '@playwright/test';

async function globalSetup(') {'
  console.log('🚀 Setting up E2E test environment...');
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage('),'
  
  try {
    // Navigate to the application
    await page.goto('http: //localhost:3000',
    
    // Wait for the application to load
    await page.waitForSelector('#gameCanvas', { timeout: 30000 ,
    
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
      if (window.indexedDB') {'
        // Clear IndexedDB if used
        const deleteReq = indexedDB.deleteDatabase('BubblePopDB');
        deleteReq.onsuccess = (') => console.log('IndexedDB cleared') }'
    });
    
    // Set up test data
    await page.evaluate((') => {'
      const testPlayerData = {
        username: 'E2ETestPlayer',
        currentHP: 100,
        maxHP: 100,
        currentScore: 0,
        ap: 1000,
        tap: 5000,
        combo: 0,
        highScores: {
          tutorial: 500 },
          normal: 1000
        },
        unlockedStages: ['tutorial', 'normal'],
        ownedItems: []
      };
      
      localStorage.setItem('bubblePop_playerData', JSON.stringify(testPlayerData);
    };
    
    // Verify the game initializes correctly
    await page.waitForFunction((') => {'
      return typeof window.gameEngine !== 'undefined' }, { timeout: 10000 }');'
    
    console.log('✅ E2E test environment setup complete');
    
  } catch (error') {'
    console.error('❌ E2E setup failed:', error);
    throw error } finally {
    await browser.close(') }'
}

export default globalSetup;