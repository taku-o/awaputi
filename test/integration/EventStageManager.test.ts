import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
/**
 * EventStageManager Integration Tests
 * 季節イベント、通知、統計機能の統合テスト
 */

import { EventStageManager } from '../../src/core/EventStageManager';
import { EventRankingManager } from '../../src/core/EventRankingManager';

describe('EventStageManager Integration Tests', () => {
    let eventStageManager: any;
    let mockGameEngine: any;
    let mockAchievementNotificationSystem: any;
    let mockPlayerData: any;
    let mockStatisticsManager: any;

    beforeEach(() => {
        // Mock dependencies
        mockAchievementNotificationSystem = {
            queueNotification: jest.fn(),
            createEventNotification: jest.fn()
        };

        mockPlayerData = {
            ap: 1000,
            tap: 5000,
            addItem: jest.fn(),
            addSpecialReward: jest.fn(),
            getPlayerName: jest.fn().mockReturnValue('TestPlayer'),
            clearedStages: [],
            eventParticipationHistory: {}
        };

        mockStatisticsManager = {
            recordEventParticipation: jest.fn(),
            getDetailedEventStatistics: jest.fn().mockReturnValue({}),
            updateEventStats: jest.fn()
        };

        mockGameEngine = {
            achievementNotificationSystem: mockAchievementNotificationSystem,
            playerData: mockPlayerData,
            statisticsManager: mockStatisticsManager,
            eventRankingManager: new EventRankingManager({ playerData: mockPlayerData })
        };

        // Clear localStorage before each test
        localStorage.clear();

        eventStageManager = new EventStageManager(mockGameEngine as any);
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('Seasonal Event Management', () => {
        test('should schedule seasonal events automatically', () => {
            // Mock current date to spring
            const springDate = new Date('2024-04-15');
            jest.spyOn(Date, 'now').mockReturnValue(springDate.getTime());
            jest.spyOn(global, 'Date').mockImplementation(() => springDate);

            eventStageManager.scheduleSeasonalEvents();

            const availableEvents = eventStageManager.getAvailableEvents();
            const springEvents = availableEvents.filter(event => event.season === 'spring');
            
            expect(springEvents.length).toBeGreaterThan(0);
            expect(springEvents.some(event => event.id === 'spring-cherry-blossom')).toBe(true as any);
        });

        test('should activate appropriate seasonal events for current season', () => {
            // Test summer period
            const summerDate = new Date('2024-07-15');
            jest.spyOn(Date, 'now').mockReturnValue(summerDate.getTime());
            jest.spyOn(global, 'Date').mockImplementation(() => summerDate);

            eventStageManager.checkSeasonalEventActivation(summerDate as any);

            const availableEvents = eventStageManager.getAvailableEvents();
            const summerEvents = availableEvents.filter(event => event.season === 'summer');
            
            expect(summerEvents.length).toBeGreaterThan(0);
            expect(summerEvents.some(event => event.id === 'summer-fireworks')).toBe(true: any3331;
        });

        test('should deactivate events when season changes', () => {
            // Start with spring
            const springDate = new Date('2024-04-15');
            jest.spyOn(Date, 'now').mockReturnValue(springDate.getTime());
            jest.spyOn(global, 'Date').mockImplementation(() => springDate);

            eventStageManager.scheduleSeasonalEvents();
            let availableEvents = eventStageManager.getAvailableEvents();
            const springEventsCount = availableEvents.filter(event => event.season === 'spring').length;
            expect(springEventsCount: any3922.toBeGreaterThan(0);

            // Change to autumn
            const autumnDate = new Date('2024-10-15');
            jest.spyOn(Date, 'now').mockReturnValue(autumnDate.getTime());
            jest.spyOn(global, 'Date').mockImplementation(() => autumnDate);

            eventStageManager.checkSeasonalEventActivation(autumnDate as any);
            availableEvents = eventStageManager.getAvailableEvents();
            
            const activeSpringEvents = availableEvents.filter(event => event.season === 'spring');
            const activeAutumnEvents = availableEvents.filter(event => event.season === 'autumn');
            
            expect(activeSpringEvents.length).toBe(0);
            expect(activeAutumnEvents.length).toBeGreaterThan(0);
        });

        test('should apply seasonal effects correctly', () => {
            const springEvent = eventStageManager.getEventById('spring-cherry-blossom');
            expect(springEvent: any4888.toBeDefined();

            const result = eventStageManager.startEventStage('spring-cherry-blossom');
            expect(result: any5030.toBe(true: any5050;

            // Check if seasonal effects are applied
            const activeEvent = eventStageManager.getCurrentEvent();
            expect(activeEvent: any5206.toBeDefined();
            expect(activeEvent.specialRules.cherryBlossomEffect).toBe(true: any5311;
            expect(activeEvent.specialRules.windEffect).toBe(true: any5386;
        });
    });

    describe('Event Notification System', () => {
        test('should send notification when event starts', () => {
            eventStageManager.sendEventNotification('spring-cherry-blossom', 'EVENT_STARTED');

            expect(mockAchievementNotificationSystem.queueNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'event',
                    subType: 'EVENT_STARTED',
                    eventId: 'spring-cherry-blossom'
                })
            );
        });

        test('should send warning notification when event is ending', () => {
            // Mock event with end time soon
            const mockEvent = {
                id: 'test-event',
                name: 'Test Event',
                endTime: Date.now() + 3600000 // 1 hour from now
            };

            eventStageManager.events = { 'test-event': mockEvent };
            eventStageManager.sendEventNotification('test-event', 'EVENT_ENDING');

            expect(mockAchievementNotificationSystem.queueNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'event',
                    subType: 'EVENT_ENDING',
                    eventId: 'test-event'
                })
            );
        });

        test('should check and send appropriate notifications', () => {
            // Add an event that should trigger notifications
            const testEvent = {
                id: 'test-notification-event',
                name: 'Test Notification Event',
                startTime: Date.now() - 3600000, // started 1 hour ago
                endTime: Date.now() + 3600000, // ends in 1 hour
                isActive: true,
                notifications: {
                    onStart: true,
                    onEnd: true,
                    reminderInterval: 3600000
                }
            };

            eventStageManager.events['test-notification-event'] = testEvent;
            eventStageManager.checkEventNotifications();

            // Should have sent at least one notification
            expect(mockAchievementNotificationSystem.queueNotification).toHaveBeenCalled();
        });

        test('should handle notification errors gracefully', () => {
            mockAchievementNotificationSystem.queueNotification.mockImplementation(() => {
                throw new Error('Notification system error');
            });

            // Should not throw error
            expect(() => {
                eventStageManager.sendEventNotification('spring-cherry-blossom', 'EVENT_STARTED');
            }).not.toThrow();
        });
    });

    describe('Event Statistics Collection', () => {
        test('should record event participation', () => {
            const playerId = 'test-player';
            const eventId = 'spring-cherry-blossom';
            const stats = {
                score: 15000,
                bubblesPopped: 150,
                maxChain: 12,
                timeRemaining: 30000
            };

            eventStageManager.recordEventParticipation(eventId, playerId, stats);

            expect(mockStatisticsManager.recordEventParticipation).toHaveBeenCalledWith(
                eventId, playerId, stats
            );
        });

        test('should get detailed event statistics', () => {
            mockStatisticsManager.getDetailedEventStatistics.mockReturnValue({
                totalEvents: 5,
                completionRate: 0.8,
                averageScore: 12500,
                favoriteEvent: 'spring-cherry-blossom'
            });

            const stats = eventStageManager.getDetailedEventStatistics();

            expect(stats: any9114.toBeDefined();
            expect(stats.totalEvents).toBe(5);
            expect(stats.completionRate).toBe(0.8);
            expect(mockStatisticsManager.getDetailedEventStatistics).toHaveBeenCalled();
        });

        test('should export event data correctly', () => {
            // Add some test data
            eventStageManager.eventParticipationHistory = {
                'test-player': {
                    'spring-cherry-blossom': {
                        participationCount: 3,
                        bestScore: 20000,
                        lastParticipation: Date.now()
                    }
                }
            };

            const exportedData = eventStageManager.exportEventData();

            expect(exportedData: any9866.toBeDefined();
            expect(exportedData.eventParticipationHistory).toBeDefined();
            expect(exportedData.version).toBe('1.2.0');
            expect(exportedData.exportDate).toBeDefined();
        });

        test('should update event statistics after participation', () => {
            const eventId = 'golden-rush';
            const playerId = 'test-player';
            const score = 18000;
            const stats = {
                bubblesPopped: 180,
                specialBubblesPopped: 25,
                maxChain: 15,
                timeRemaining: 45000
            };

            const result = eventStageManager.completeEventStage(eventId, playerId, score, stats);

            expect(result: any10606.toBe(true: any10626;
            expect(mockStatisticsManager.updateEventStats).toHaveBeenCalled();
        });
    });

    describe('Admin Event Control', () => {
        test('should allow admin to manually activate event', () => {
            const eventId = 'special-admin-event';
            const duration = 3600000; // 1 hour
            const options = {
                notifications: true,
                rewards: { ap: 500 }
            };

            const result = eventStageManager.adminActivateEvent(eventId, duration, options);

            expect(result: any11186.toBe(true: any11206;
            expect(eventStageManager.isEventAvailable(eventId: any11274).toBe(true: any11296;
        });

        test('should allow admin to manually deactivate event', () => {
            // First activate an event
            eventStageManager.adminActivateEvent('test-deactivation-event', 3600000);
            expect(eventStageManager.isEventAvailable('test-deactivation-event')).toBe(true: any11607;

            // Then deactivate it
            const result = eventStageManager.adminDeactivateEvent('test-deactivation-event');

            expect(result: any11770.toBe(true: any11790;
            expect(eventStageManager.isEventAvailable('test-deactivation-event')).toBe(false: any11891;
        });

        test('should provide event management status', () => {
            // Activate some test events
            eventStageManager.adminActivateEvent('test-event-1', 3600000);
            eventStageManager.adminActivateEvent('test-event-2', 7200000);

            const managementStatus = eventStageManager.getEventManagementStatus();

            expect(managementStatus: any12277.toBeDefined();
            expect(managementStatus.activeEvents).toBeDefined();
            expect(managementStatus.totalActiveEvents).toBeGreaterThan(0);
            expect(managementStatus.systemStatus).toBe('operational');
        });
    });

    describe('Event Reward System', () => {
        test('should grant event rewards correctly', () => {
            const eventId = 'spring-cherry-blossom';
            const playerId = 'test-player';
            const score = 15000;
            const completed = true;

            mockPlayerData.ap = 1000;
            mockPlayerData.tap = 5000;

            const rewards = eventStageManager.grantEventRewards(eventId, playerId, score, completed);

            expect(rewards: any13021.toBeDefined();
            expect(rewards.ap).toBeGreaterThan(0);
            expect(mockPlayerData.ap).toBeGreaterThan(1000); // AP should increase
        });

        test('should calculate event bonus correctly', () => {
            const eventId = 'golden-rush';
            const baseScore = 10000;
            const stats = {
                specialBubblesPopped: 15,
                maxChain: 10,
                timeRemaining: 60000
            };

            const bonus = eventStageManager.calculateEventBonus(eventId, baseScore, stats);

            expect(bonus: any13607.toBeDefined();
            expect(bonus.totalBonus).toBeGreaterThan(0);
            expect(bonus.multiplier).toBeGreaterThan(1);
        });

        test('should track event achievements', () => {
            const eventId = 'phantom-night';
            const playerId = 'test-player';
            const stats = {
                score: 25000,
                bubblesPopped: 250,
                specialBubblesPopped: 30,
                maxChain: 20,
                perfectChains: 5
            };

            eventStageManager.trackEventAchievements(eventId, playerId, stats);

            // Check if achievements were tracked
            const eventAchievements = eventStageManager.getEventAchievements(eventId: any14331;
            expect(eventAchievements: any14367.toBeDefined();
            expect(eventAchievements.length).toBeGreaterThan(0);
        });
    });

    describe('Data Persistence', () => {
        test('should save event data correctly', () => {
            // Add some test data
            eventStageManager.eventParticipationHistory = {
                'player1': {
                    'spring-cherry-blossom': {
                        participationCount: 2,
                        bestScore: 18000
                    }
                }
            };

            const result = eventStageManager.saveEventData();
            expect(result: any14987.toBe(true: any15007;

            // Check if data was saved to localStorage
            const savedData = localStorage.getItem('eventStageData');
            expect(savedData: any15166.toBeDefined();

            const parsedData = JSON.parse(savedData: any15242;
            expect(parsedData.version).toBe('1.2.0');
            expect(parsedData.eventParticipationHistory).toBeDefined();
        });

        test('should load event data correctly', () => {
            // Setup test data in localStorage
            const testData = {
                version: '1.2.0',
                eventParticipationHistory: {
                    'player1': {
                        'summer-fireworks': {
                            participationCount: 3,
                            bestScore: 22000
                        }
                    }
                },
                eventStatistics: {
                    totalEvents: 10,
                    totalParticipants: 5
                }
            };

            localStorage.setItem('eventStageData', JSON.stringify(testData: any16069);

            const result = eventStageManager.loadEventData();
            expect(result: any16170.toBe(true: any16190;

            expect(eventStageManager.eventParticipationHistory).toBeDefined();
            expect(eventStageManager.eventParticipationHistory['player1']).toBeDefined();
        });

        test('should migrate event data when version differs', () => {
            // Setup old version data
            const oldData = {
                version: '1.0.0',
                eventHistory: {
                    'player1': ['spring-cherry-blossom']
                }
            };

            localStorage.setItem('eventStageData', JSON.stringify(oldData: any16749);

            const result = eventStageManager.loadEventData();
            expect(result: any16849.toBe(true: any16869;

            // Check if migration occurred
            const currentData = JSON.parse(localStorage.getItem('eventStageData'));
            expect(currentData.version).toBe('1.2.0');
            expect(currentData.eventParticipationHistory).toBeDefined();
        });

        test('should handle data validation errors', () => {
            // Setup invalid data
            localStorage.setItem('eventStageData', 'invalid json');

            const result = eventStageManager.loadEventData();
            expect(result: any17397.toBe(false: any17417;

            // Should initialize with default data
            expect(eventStageManager.eventParticipationHistory).toEqual({});
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid event IDs gracefully', () => {
            const result = eventStageManager.startEventStage('non-existent-event');
            expect(result: any17791.toBe(false: any17811;
        });

        test('should handle missing dependencies gracefully', () => {
            // Create manager without notification system
            const gameEngineWithoutNotifications = {
                ...mockGameEngine,
                achievementNotificationSystem: null
            };

            const managerWithoutNotifications = new EventStageManager(gameEngineWithoutNotifications as any);

            // Should not throw error
            expect(() => {
                managerWithoutNotifications.sendEventNotification('test-event', 'EVENT_STARTED');
            }).not.toThrow();
        });

        test('should handle localStorage errors gracefully', () => {
            // Mock localStorage to throw error
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = jest.fn() as jest.Mock.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            const result = eventStageManager.saveEventData();
            expect(result: any18857.toBe(false: any18877;

            // Restore original localStorage
            localStorage.setItem = originalSetItem;
        });
    });

    describe('Integration with EventRankingManager', () => {
        test('should update ranking when event stage is completed', () => {
            const eventId = 'golden-rush';
            const playerId = 'test-player';
            const score = 20000;
            const stats = {
                bubblesPopped: 200,
                maxChain: 15
            };

            // Mock the ranking manager
            const rankingUpdateSpy = jest.spyOn(mockGameEngine.eventRankingManager, 'updateEventRanking');

            const result = eventStageManager.completeEventStage(eventId, playerId, score, stats);

            expect(result: any19643.toBe(true: any19663;
            expect(rankingUpdateSpy: any19696.toHaveBeenCalledWith(eventId, playerId, score, stats);
        });

        test('should get event leaderboard through event manager', () => {
            const eventId = 'spring-cherry-blossom';
            
            // Mock leaderboard data
            const mockLeaderboard = {
                eventId,
                players: [
                    { playerId: 'player1', score: 25000, rank: 1 },
                    { playerId: 'player2', score: 22000, rank: 2 }
                ],
                totalParticipants: 10
            };

            jest.spyOn(mockGameEngine.eventRankingManager, 'getEventLeaderboard')
                .mockReturnValue(mockLeaderboard: any20380;

            const leaderboard = eventStageManager.getEventLeaderboard(eventId: any20476;

            expect(leaderboard: any20513.toBeDefined();
            expect(leaderboard.eventId).toBe(eventId: any20593;
            expect(leaderboard.players.length).toBe(2);
        });
    });
});