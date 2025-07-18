/**
 * Simple test for new features in task 29
 */

// Import the new systems
import { AchievementManager } from './src/core/AchievementManager.js';
import { StatisticsManager } from './src/core/StatisticsManager.js';
import { EventStageManager } from './src/core/EventStageManager.js';
import { Bubble } from './src/bubbles/Bubble.js';

// Mock game engine
const mockGameEngine = {
    playerData: {
        ap: 0,
        tap: 0,
        takeDamage: () => {},
        heal: () => {}
    },
    stageManager: {
        stageConfigs: {
            tutorial: {},
            normal: {},
            hard: {}
        }
    }
};

console.log('Testing new bubble types...');

// Test new bubble types
const newBubbleTypes = ['golden', 'frozen', 'magnetic', 'explosive', 'phantom', 'multiplier'];
newBubbleTypes.forEach(type => {
    try {
        const bubble = new Bubble(type, { x: 100, y: 100 });
        console.log(`✓ ${type} bubble created successfully`);
        console.log(`  - Health: ${bubble.health}`);
        console.log(`  - Size: ${bubble.size}`);
        console.log(`  - Max Age: ${bubble.maxAge}`);
        
        // Test special effects
        bubble.triggerSpecialEffect();
        const effects = bubble.getAndClearEffects();
        console.log(`  - Effects: ${effects.length} effect(s)`);
        
    } catch (error) {
        console.error(`✗ Failed to create ${type} bubble:`, error.message);
    }
});

console.log('\nTesting Achievement System...');

// Test Achievement System
try {
    const achievementManager = new AchievementManager(mockGameEngine);
    console.log('✓ AchievementManager created successfully');
    
    // Test achievement progress
    achievementManager.updateProgress('bubblePopped', { bubbleType: 'normal' });
    achievementManager.updateProgress('bubblePopped', { bubbleType: 'golden' });
    
    const achievements = achievementManager.getAchievements();
    console.log(`✓ ${achievements.length} achievements loaded`);
    
    const stats = achievementManager.getStatistics();
    console.log(`✓ Achievement statistics: ${stats.completionRate}% completion`);
    
} catch (error) {
    console.error('✗ Achievement System failed:', error.message);
}

console.log('\nTesting Statistics System...');

// Test Statistics System
try {
    const statisticsManager = new StatisticsManager(mockGameEngine);
    console.log('✓ StatisticsManager created successfully');
    
    // Test statistics tracking
    statisticsManager.onGameStart('tutorial');
    statisticsManager.onBubblePopped('golden', 150);
    statisticsManager.onGameEnd({
        finalScore: 1000,
        stageId: 'tutorial',
        bubblesPopped: 50,
        bubblesMissed: 5,
        maxCombo: 15,
        completed: true
    });
    
    const detailedStats = statisticsManager.getDetailedStatistics();
    console.log('✓ Detailed statistics generated');
    console.log(`  - Total games: ${detailedStats.basic.totalGamesPlayed}`);
    console.log(`  - Highest score: ${detailedStats.basic.highestScore}`);
    
} catch (error) {
    console.error('✗ Statistics System failed:', error.message);
}

console.log('\nTesting Event Stage System...');

// Test Event Stage System
try {
    const eventStageManager = new EventStageManager(mockGameEngine);
    console.log('✓ EventStageManager created successfully');
    
    // Test available events
    const availableEvents = eventStageManager.getAvailableEvents();
    console.log(`✓ ${availableEvents.length} events available`);
    
    // Test event statistics
    const eventStats = eventStageManager.getEventStatistics();
    console.log('✓ Event statistics generated');
    console.log(`  - Total events played: ${eventStats.totalEventsPlayed}`);
    console.log(`  - Completion rate: ${eventStats.eventCompletionRate}%`);
    
} catch (error) {
    console.error('✗ Event Stage System failed:', error.message);
}

console.log('\nAll tests completed!');