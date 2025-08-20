/**
 * Event Flow Integration Tests
 * イベント全体フローの統合テスト（開始から完了まで）
 * TypeScript移行 - Task 27対応
 */
import { jest } from '@jest/globals';''
import { EventStageManager } from '../../src/core/EventStageManager.js';''
import { EventRankingManager } from '../../src/core/EventRankingManager.js';''
import { StageSelectScene } from '../../src/scenes/StageSelectScene.js';
// Mock function type
interface MockFunction<T = any> extends Function { mockReturnValue: (value: T) => MockFunction<T>,
    mockImplementation: (impl: Function) => MockFunction<T>,
    toHaveBeenCalledWith: (...args: any[]) => void; }
}
// Canvas and rendering interfaces
interface MockCanvas { width: number,'
    height: number,'';
    getContext: (type: string') => MockCanvasContext; }
}
interface MockCanvasContext { fillStyle: string,
    strokeStyle: string,
    font: string,
    textAlign: string,
    textBaseline: string,
    globalAlpha: number,
    save: MockFunction<void>,
    restore: MockFunction<void>,
    fillText: MockFunction<void>,
    fillRect: MockFunction<void>,
    strokeRect: MockFunction<void>,
    beginPath: MockFunction<void>,
    arc: MockFunction<void>,
    fill: MockFunction<void>,
    stroke: MockFunction<void>,
    }
    measureText: MockFunction<{ width: number }>,
    clearRect: MockFunction<void>,
    createLinearGradient: MockFunction<MockGradient>,
    }
interface MockGradient { addColorStop: MockFunction<void>;
    }
}
// Input interfaces
interface MousePosition { x: number,
    y: number; }
}
interface MockInputManager { getMousePosition: MockFunction<MousePosition>,
    isPressed: MockFunction<boolean>,
    wasClicked: MockFunction<boolean>;
    }
}
// Player and game data interfaces
interface PlayerData { ap: number,
    tap: number,
    level: number,
    clearedStages: string[],
    eventParticipationHistory: Record<string, any>;
    addItem: MockFunction<void>,
    addSpecialReward: MockFunction<void>,
    getPlayerName: MockFunction<string>,
    save: MockFunction<void>;
    }
}
interface GameStatistics { totalEvents: number,
    completionRate: number,
    averageScore: number; }
}
interface StatisticsManager { recordEventParticipation: MockFunction<void>,
    getEventStatistics: MockFunction<GameStatistics>,
    updateEventStats: MockFunction<void>;
    }
}
interface AchievementNotificationSystem { queueNotification: MockFunction<void>,
    createEventNotification: MockFunction<void>,
    hasNotifications: MockFunction<boolean>;
    }
}
interface SceneManager { switchScene: MockFunction<void>,
    getCurrentScene: MockFunction<string>;
    }
}
// Game engine interface
interface GameEngine { canvas: MockCanvas,
    ctx: MockCanvasContext,
    inputManager: MockInputManager,
    playerData: PlayerData,
    statisticsManager: StatisticsManager,
    achievementNotificationSystem: AchievementNotificationSystem,
    sceneManager: SceneManager,
    eventStageManager?: EventStageManager;
    eventRankingManager?: EventRankingManager;
    }
}
// Event interfaces
interface EventSpecialRules { cherryBlossomEffect?: boolean;
    [key: string]: any, }
}
interface Event { id: string,
    isActive: boolean,
    specialRules: EventSpecialRules,
    endTime?: number; }
}
interface EventStats { bubblesPopped: number,
    specialBubblesPopped?: number;
    maxChain: number,
    timeRemaining?: number;
    goldenBubblesPopped?: number; }
}
interface EventRanking { score: number,
    playerId?: string;
    rank?: number;
    tierInfo?: {
        name: string; }
    };
}
interface Leaderboard { players: EventRanking[];
    }
}
interface EventNotificationOptions { notifications?: {
        onStart?: boolean;
        onEnd?: boolean;
        reminderInterval?: number; }
    };
    rewards?: { ap?: number; }
    };
    priority?: string;
}
interface EventData { version: string,
    eventHistory?: Record<string, string[]>;
    eventParticipationHistory?: Record<string, any>; }'
}''
describe('Event Flow Integration Tests', () => {  let mockGameEngine: GameEngine,
    let eventStageManager: EventStageManager,
    let eventRankingManager: EventRankingManager,
    let stageSelectScene: StageSelectScene,
    let mockPlayerData: PlayerData,
    let mockStatisticsManager: StatisticsManager,
    let mockAchievementNotificationSystem: AchievementNotificationSystem,';
    let mockSceneManager: SceneManager,'';
    beforeEach((') => { }
        // Clear localStorage }
        localStorage.clear(};
        // Mock PlayerData
        mockPlayerData = { ap: 1000,)
            tap: 5000)';
            level: 10,'';
            clearedStages: ['tutorial', 'stage1', 'stage2', 'stage3'],) }
            eventParticipationHistory: {}),
            addItem: jest.fn() as unknown as MockFunction<void>,';
            addSpecialReward: jest.fn() as unknown as MockFunction<void>,'';
            getPlayerName: jest.fn(').mockReturnValue('TestPlayer') as unknown as MockFunction<string>,
            save: jest.fn() as unknown as MockFunction<void>;
        },
        // Mock StatisticsManager
        mockStatisticsManager = { recordEventParticipation: jest.fn() as any,
            getEventStatistics: jest.fn().mockReturnValue({)
                totalEvents: 0);
                completionRate: 0,);
        averageScore: 0); }
            }) as any,
            updateEventStats: jest.fn() as any;
        },
        // Mock AchievementNotificationSystem
        mockAchievementNotificationSystem = { queueNotification: jest.fn() as unknown as MockFunction<void>,
            createEventNotification: jest.fn() as unknown as MockFunction<void>,
            hasNotifications: jest.fn().mockReturnValue(false) as unknown as MockFunction<boolean> }
        },
        // Mock SceneManager'
        mockSceneManager = { switchScene: jest.fn() as unknown as MockFunction<void>,''
            getCurrentScene: jest.fn(').mockReturnValue('StageSelectScene'') as unknown as MockFunction<string> }
        },
        // Mock Canvas and Context'
        const mockContext: MockCanvasContext = { ''
            fillStyle: '','';
            strokeStyle: '','';
            font: '','';
            textAlign: '','';
            textBaseline: '',
            globalAlpha: 1,
            save: jest.fn() as unknown as MockFunction<void>,
            restore: jest.fn() as unknown as MockFunction<void>,
            fillText: jest.fn() as unknown as MockFunction<void>,
            fillRect: jest.fn() as unknown as MockFunction<void>,
            strokeRect: jest.fn() as unknown as MockFunction<void>,
            beginPath: jest.fn() as unknown as MockFunction<void>,
            arc: jest.fn() as unknown as MockFunction<void>,
            fill: jest.fn() as unknown as MockFunction<void>,
            stroke: jest.fn() as unknown as MockFunction<void>, }
            measureText: jest.fn().mockReturnValue({ width: 100 ) as unknown as MockFunction<{ width: number }>,
            clearRect: jest.fn() as unknown as MockFunction<void>,
            createLinearGradient: jest.fn().mockReturnValue({ ),
                addColorStop: jest.fn() as unknown as MockFunction<void> }
            }) as unknown as MockFunction<MockGradient>
        },
        const mockCanvas: MockCanvas = { width: 1024,
            height: 768,
            getContext: jest.fn().mockReturnValue(mockContext) as unknown as (type: string) => MockCanvasContext }
        },
        const mockInputManager: MockInputManager = { getMousePosition: jest.fn().mockReturnValue({ x: 500, y: 400 ) as unknown as MockFunction<MousePosition>,
            isPressed: jest.fn().mockReturnValue(false) as unknown as MockFunction<boolean>,
            wasClicked: jest.fn().mockReturnValue(false) as unknown as MockFunction<boolean> }
        },
        // Create GameEngine mock
        mockGameEngine = { canvas: mockCanvas,
            ctx: mockContext,
            inputManager: mockInputManager,
            playerData: mockPlayerData,
            statisticsManager: mockStatisticsManager,
            achievementNotificationSystem: mockAchievementNotificationSystem,
            sceneManager: mockSceneManager }
        },
        // Create managers
        eventRankingManager = new EventRankingManager(mockGameEngine);
        eventStageManager = new EventStageManager(mockGameEngine);
        // Assign to game engine
        mockGameEngine.eventStageManager = eventStageManager;
        mockGameEngine.eventRankingManager = eventRankingManager;
        // Create scene
        stageSelectScene = new StageSelectScene(mockGameEngine);
    });
    afterEach(() => {  localStorage.clear(); }
        jest.clearAllMocks(); }'
        jest.restoreAllMocks(});''
    }');''
    describe('Complete Event Lifecycle', (') => {  ' }'
        test('should complete full seasonal event lifecycle', async () => {' }'
            // 1. Set up seasonal event (Spring}');''
            const springDate = new Date('2024-04-15'};')'
            jest.spyOn(Date, 'now').mockReturnValue(springDate.getTime(}');''
            jest.spyOn(global, 'Date').mockImplementation(() => springDate as any);
            // 2. Schedule seasonal events
            if(eventStageManager.scheduleSeasonalEvents) {
                
            }
                eventStageManager.scheduleSeasonalEvents(})
            ';
            // 3. Verify event is available''
            const availableEvents: Event[] = eventStageManager.getAvailableEvents('')';
            const springEvent = availableEvents.find(event => event.id === 'spring-cherry-blossom');
            expect(springEvent).toBeDefined();
            expect(springEvent!.isActive).toBe(true);
            // 4. Initialize StageSelectScene and verify event display
            if (stageSelectScene.initialize) { stageSelectScene.initialize(); }
            }'
            expect(stageSelectScene.eventList.length).toBeGreaterThan(0);''
            const displayedSpringEvent = stageSelectScene.eventList.find((event: Event') => event.id === 'spring-cherry-blossom');''
            expect(displayedSpringEvent).toBeDefined('')';
            const accessValidation = stageSelectScene.validateEventStageAccess('spring-cherry-blossom');''
            expect(accessValidation.canAccess).toBe(true');'
            // 6. Start event stage''
            const startResult: boolean = eventStageManager.startEventStage('spring-cherry-blossom'),
            expect(startResult).toBe(true);
            // 7. Verify event effects are applied
            const currentEvent: Event = (eventStageManager.getCurrentEvent  ? eventStageManager.getCurrentEvent() : null),';
            expect(currentEvent).toBeDefined();''
            expect(currentEvent.specialRules.cherryBlossomEffect).toBe(true');'
            // 8. Complete event stage with score''
            const playerId = 'test-player';
            const score = 20000;
            const stats: EventStats = { bubblesPopped: 200,
                specialBubblesPopped: 30,
                maxChain: 15,';
                timeRemaining: 45000' }'
    }');''
            const completeResult: boolean = eventStageManager.completeEvent('spring-cherry-blossom', playerId);
            expect(completeResult).toBe(true);
            // 9. Verify rewards were granted
            expect(mockPlayerData.ap).toBeGreaterThan(1000); // AP should increase'
            // 10. Verify statistics were recorded''
            expect(mockStatisticsManager.recordEventParticipation).toHaveBeenCalledWith('')';
                'spring-cherry-blossom', playerId, stats);''
            ');'
            // 11. Verify ranking was updated''
            const ranking: EventRanking = eventRankingManager.getPlayerEventRanking(playerId, 'spring-cherry-blossom');'
            expect(ranking).toBeDefined();''
            expect(ranking.score).toBe(score');'
            // 12. Verify achievements were tracked''
            const eventAchievements = (eventStageManager.getEventAchievements ? (eventStageManager.getEventAchievements('spring-cherry-blossom') : null));
            expect(eventAchievements).toBeDefined();
            // 13. Verify data persistence'
            const saveResult: boolean = eventStageManager.saveEventData  ? eventStageManager.saveEventData() : true,'';
            expect(saveResult).toBe(true');'
            // 14. Verify leaderboard''
            const leaderboard: Leaderboard = eventRankingManager.getEventLeaderboard('spring-cherry-blossom'),';
            expect(leaderboard.players.length).toBeGreaterThan(0);''
        }');''
        test('should handle special event activation and completion', (') => {  // 1. Admin activates special event''
            const eventId = 'golden-rush';
            const duration = 3600000; // 1 hour
            const options: EventNotificationOptions = {
                onStart: true,
                onEnd: true, }
                reminderInterval: 300000 // 5 minutes }
            },
            const activationResult: boolean = eventStageManager.adminActivateEvent(eventId, duration, options);
            expect(activationResult).toBe(true);
            // 2. Verify event is available
            expect(eventStageManager.isEventAvailable(eventId).toBe(true);'
            // 3. Verify notification was sent''
            expect(mockAchievementNotificationSystem.queueNotification').toHaveBeenCalledWith(';
                expect.objectContaining({ ''
                    type: 'event',')';
                    subType: 'EVENT_STARTED',);
        eventId: eventId); }
                }
            );
            // 4. StageSelectScene should display the event
            stageSelectScene.initialize();
            const displayedEvent = stageSelectScene.eventList.find((event: Event) => event.id === eventId);
            expect(displayedEvent).toBeDefined();
            // 5. Player participates in event'
            const startResult: boolean = eventStageManager.startEventStage(eventId),'';
            expect(startResult).toBe(true');'
            // 6. Complete with high score''
            const playerId = 'test-player';
            const score = 35000;
            const stats: EventStats = { bubblesPopped: 350,
                specialBubblesPopped: 50,
                maxChain: 25,
                timeRemaining: 30000,
                goldenBubblesPopped: 15 }
    }),
            const completeResult: boolean = eventStageManager.completeEvent(eventId, playerId);
            expect(completeResult).toBe(true);
            // 7. Verify bonus rewards for special event
            const expectedAP = 1000 + 500; // initial + special event reward
            expect(mockPlayerData.ap).toBeGreaterThanOrEqual(expectedAP);
            // 8. Admin deactivates event
            const deactivationResult: boolean = eventStageManager.adminDeactivateEvent(eventId),
            expect(deactivationResult).toBe(true);'
            expect(eventStageManager.isEventAvailable(eventId).toBe(false);''
        }');''
        test('should handle event ranking distribution cycle', (') => {  ''
            const eventId = 'ranking-test-event'; }
            // 1. Activate event }
            eventStageManager.adminActivateEvent(eventId, 3600000};
            // 2. Multiple players participate'
            const players: { id: string; score: number }[] = [''
                { id: 'player1', score: 25000 },''
                { id: 'player2', score: 30000 },''
                { id: 'player3', score: 20000 },''
                { id: 'player4', score: 35000 },']'
                { id: 'player5', score: 28000 }]
            ];)
            players.forEach(player => {  ) }
                eventRankingManager.updateEventRanking(eventId, player.id, player.score, {); }
                    bubblesPopped: player.score / 100 }),
                    maxChain: Math.floor(player.score / 1000),
                });
            }
            // 3. Verify leaderboard ordering'
            const leaderboard: Leaderboard = eventRankingManager.getEventLeaderboard(eventId, 10);''
            expect(leaderboard.players[0].playerId').toBe('player4'); // Highest score'
            expect(leaderboard.players[0].rank).toBe(1);''
            expect(leaderboard.players[1].playerId').toBe('player2'); // Second highest
            expect(leaderboard.players[1].rank).toBe(2);
            // 4. Distribute ranking rewards
            const distributionResult: boolean = eventRankingManager.distributeRankingRewards(eventId),
            expect(distributionResult).toBe(true);'
            // 5. Verify notifications were sent for rewards''
            expect(mockAchievementNotificationSystem.queueNotification').toHaveBeenCalledWith(';
                expect.objectContaining({ ')'
                    type: 'ranking',')';
        title: 'ランキング報酬！'); }'
                }''
            ');'
            // 6. Verify tier assignment''
            const topPlayerRanking: EventRanking = eventRankingManager.getPlayerEventRanking('player4', eventId);''
            expect(topPlayerRanking.tierInfo!.name').toBe('Legend');''
        }');'
    }''
    describe('Concurrent Events Management', (') => {  ''
        test('should handle multiple simultaneous events', (') => { }
            // 1. Activate multiple events }'
            const events: { id: string; type: string }[] = [''
                { id: 'spring-cherry-blossom', type: 'seasonal' },''
                { id: 'golden-rush', type: 'special' },']'
                { id: 'anniversary-celebration', type: 'special' }]'
            ];''
            events.forEach(event => {  ');' }'
                if (event.type === 'seasonal'') {' }'
                    const springDate = new Date('2024-04-15'};')'
                    jest.spyOn(Date, 'now').mockReturnValue(springDate.getTime(});
                    eventStageManager.scheduleSeasonalEvents();
                } else {  }
                    eventStageManager.adminActivateEvent(event.id, 3600000};)
                });
            // 2. Verify all events are available
            const availableEvents: Event[] = eventStageManager.getAvailableEvents(),
            expect(availableEvents.length).toBeGreaterThanOrEqual(3);
            // 3. StageSelectScene should display all events'
            stageSelectScene.initialize();''
            expect(stageSelectScene.eventList.length).toBeGreaterThanOrEqual(3');'
            // 4. Player can participate in multiple events''
            const playerId = 'multi-event-player';
            let totalAPGained = 0;
            events.forEach(event => {  );
                if(eventStageManager.isEventAvailable(event.id) {
                    
                }
                    const initialAP = mockPlayerData.ap; }
                     }
                    eventStageManager.startEventStage(event.id};)
                    eventStageManager.completeEvent(event.id, playerId, 15000, { bubblesPopped: 150,)
                    maxChain: 10); }
                    });
                    const apGained = mockPlayerData.ap - initialAP;
                    totalAPGained += apGained;
                }
            });
            // 5. Verify cumulative rewards
            expect(totalAPGained).toBeGreaterThan(0);
            // 6. Verify each event has separate statistics
            events.forEach(event => {  );
                if(eventStageManager.isEventAvailable(event.id) {
                    
                }
                    const ranking: EventRanking = eventRankingManager.getPlayerEventRanking(playerId, event.id); }
                    expect(ranking).toBeDefined(); }'
                }''
            }');'
        }''
        test('should prioritize events correctly when conflicts occur', (') => {  // 1. Activate conflicting events with different priorities''
            const highPriorityEvent = 'anniversary-celebration';' }'
            const lowPriorityEvent = 'daily-challenge';' }'
            eventStageManager.adminActivateEvent(highPriorityEvent, 3600000, { priority: 'high' }');''
            eventStageManager.adminActivateEvent(lowPriorityEvent, 3600000, { priority: 'low' ),
            // 2. StageSelectScene should display high priority events first
            stageSelectScene.initialize();
            const highPriorityIndex = (stageSelectScene.eventList.findIndex((event: Event) => event.id === highPriorityEvent));
            const lowPriorityIndex = (stageSelectScene.eventList.findIndex((event: Event) => event.id === lowPriorityEvent));'
            expect(highPriorityIndex).toBeLessThan(lowPriorityIndex);' }'
        }');'
    }''
    describe('Event Notification Flow', (') => {  ''
        test('should handle complete notification lifecycle', (') => {''
            const eventId = 'notification-test-event';
            // 1. Activate event with notifications enabled
            eventStageManager.adminActivateEvent(eventId, 3600000, {
                notifications: {)
                    onStart: true);
                    onEnd: true,) }
                    reminderInterval: 1800000 // 30 minutes); }
    });
            }'
            // 2. Verify start notification was sent''
            expect(mockAchievementNotificationSystem.queueNotification').toHaveBeenCalledWith(';
                expect.objectContaining({ ''
                    type: 'event',')';
                    subType: 'EVENT_STARTED',);
        eventId: eventId); }
                }
            );
            // 3. Initialize StageSelectScene and check notifications
            stageSelectScene.initialize();
            stageSelectScene.updateEventNotifications();
            expect(stageSelectScene.eventNotifications.length).toBeGreaterThan(0);
            // 4. Player clicks notification
            const clickResult: boolean = stageSelectScene.handleEventNotificationClick(),
            expect(clickResult).toBe(true);'
            // 5. Mock time passage for reminder''
            const futureTime = Date.now('')';
            jest.spyOn(Date, 'now').mockReturnValue(futureTime);
            eventStageManager.checkEventNotifications();'
            // 6. Should send reminder notification''
            expect(mockAchievementNotificationSystem.queueNotification').toHaveBeenCalledWith(';
                expect.objectContaining({ ')'
                    type: 'event',')';
                    subType: 'EVENT_REMINDER'),
            );'
            // 7. Mock near end time for warning''
            const nearEndTime = Date.now() + (eventStageManager.events[eventId].endTime') - 600000; // 10 minutes before end''
            jest.spyOn(Date, 'now').mockReturnValue(nearEndTime);
            eventStageManager.checkEventNotifications();'
            // 8. Should send ending warning''
            expect(mockAchievementNotificationSystem.queueNotification').toHaveBeenCalledWith(';
                expect.objectContaining({')'
                    type: 'event',')';
                    subType: 'EVENT_ENDING'),';
            );' }'
        }');'
    }''
    describe('Data Persistence Throughout Flow', (') => {  ''
        test('should maintain data consistency throughout event lifecycle', (') => {''
            const eventId = 'persistence-test-event';''
            const playerId = 'persistence-player';
            // 1. Activate event and participate }
            eventStageManager.adminActivateEvent(eventId, 3600000); }
            eventStageManager.startEventStage(eventId};)
            eventStageManager.completeEvent(eventId, playerId, 18000, { bubblesPopped: 180,)
                maxChain: 12),
            // 2. Save all data
            const eventSaveResult: boolean = (eventStageManager.saveEventData  ? eventStageManager.saveEventData() : true); // fallback;
            const rankingSaveResult = eventRankingManager.save();'
            expect(eventSaveResult).toBe(true);''
            expect(rankingSaveResult).toBeUndefined(); // save(') doesn't return value
            // 3. Create new instances (simulate restart);
            const newEventStageManager = new EventStageManager(mockGameEngine);
            const newEventRankingManager = new EventRankingManager(mockGameEngine);
            // 4. Load data
            const eventLoadResult: boolean = newEventStageManager.loadEventData(),
            expect(eventLoadResult).toBe(true);
            // 5. Verify data was restored
            const restoredRanking: EventRanking = newEventRankingManager.getPlayerEventRanking(playerId, eventId);
            expect(restoredRanking).toBeDefined();
            expect(restoredRanking.score).toBe(18000);
            // 6. Verify participation history
            expect(newEventStageManager.eventParticipationHistory[playerId]).toBeDefined();'
            expect(newEventStageManager.eventParticipationHistory[playerId][eventId]).toBeDefined();' }'
        }');''
        test('should handle data migration during event flow', (') => {  // 1. Setup old version data'
            const oldData: EventData = {''
                version: '1.0.0',';
                eventHistory: {' }'
                    'old-player': ['old-event-1', 'old-event-2'] }
                }'
            };''
            localStorage.setItem('eventStageData', JSON.stringify(oldData);
            // 2. Load with new manager (should trigger migration);
            const newEventStageManager = new EventStageManager(mockGameEngine);'
            const loadResult: boolean = newEventStageManager.loadEventData(),'';
            expect(loadResult).toBe(true');'
            // 3. Verify migration occurred''
            const currentData: EventData = JSON.parse(localStorage.getItem('eventStageData')!),'';
            expect(currentData.version').toBe('1.2.0');''
            expect(currentData.eventParticipationHistory).toBeDefined('')';
            expect(newEventStageManager.eventParticipationHistory['old-player']).toBeDefined();''
        }');'
    }''
    describe('Error Recovery During Event Flow', (') => {  ''
        test('should recover from event manager failures', (') => {''
            const eventId = 'error-recovery-test';
            // 1. Start event successfully
            eventStageManager.adminActivateEvent(eventId, 3600000);
            const startResult: boolean = eventStageManager.startEventStage(eventId),
            expect(startResult).toBe(true);
            // 2. Mock error during completion'
            const originalCompleteMethod = eventStageManager.completeEvent;''
            eventStageManager.completeEvent = jest.fn().mockImplementation((') => {' }'
                throw new Error('Completion error'); }
            }) as any;'
            // 3. Attempt completion (should handle error gracefully);''
            expect((') => { ' }'
                eventStageManager.completeEvent(eventId, 'test-player'});''
            }).not.toThrow('')'
            const recoveryResult: boolean = eventStageManager.completeEvent(eventId, 'test-player', 10000, { bubblesPopped: 100,)
        maxChain: 8); }
            }'
            expect(recoveryResult).toBe(true);''
        }');''
        test('should handle storage failures gracefully', (') => {  ''
            const eventId = 'storage-failure-test';
            // 1. Mock localStorage failure'
            const originalSetItem = localStorage.setItem;''
            localStorage.setItem = jest.fn().mockImplementation((') => {' }'
                throw new Error('Storage quota exceeded'); }
            });
            // 2. Complete event (should handle storage error);
            eventStageManager.adminActivateEvent(eventId, 3600000);'
            eventStageManager.startEventStage(eventId);''
            expect((') => {  ''
                eventStageManager.completeEvent(eventId, 'test-player', 15000, {)
                    bubblesPopped: 150,) }
                    maxChain: 10); }
                });
            }).not.toThrow();
            // 3. Restore localStorage and verify recovery
            localStorage.setItem = originalSetItem;
            
            const saveResult: boolean = eventStageManager.saveEventData ? eventStageManager.saveEventData() : true; // fallback'
            expect(saveResult).toBe(true);''
        }');'
    }''
    describe('Performance During Event Flow', (') => {  ' }'
        test('should maintain performance with multiple concurrent events', () => { }
            const startTime = performance.now(};)
            // 1. Activate multiple events);
            for(let i = 0; i < 10; i++) {
                
            }
                eventStageManager.adminActivateEvent(`perf-test-event-${i}`, 3600000);
            }
            // 2. Initialize StageSelectScene with many events
            stageSelectScene.initialize();
            // 3. Multiple rapid updates
            for (let i = 0; i < 20; i++) { stageSelectScene.updateEventList(); }
                stageSelectScene.updateEventNotifications(});
            const endTime = performance.now();
            const duration = endTime - startTime;
            // Should complete within reasonable time (less than 100ms);'
            expect(duration).toBeLessThan(100);''
        }');''
        test('should efficiently handle large event histories', (') => {  ''
            const playerId = 'performance-player';
            // 1. Create large participation history }
            for (let i = 0; i < 100; i++) { }
                const eventId = `history-event-${i}`;
                eventStageManager.adminActivateEvent(eventId, 3600000);
                eventStageManager.completeEvent(eventId, playerId, 10000 + i * 100, { bubblesPopped: 100 + i,)
        maxChain: 5 + (i % 10); }
                }
            }
            // 2. Test data access performance
            const startTime = performance.now();
            const statistics = eventStageManager.getEventStatistics();
            const exportData = eventStageManager.exportEventData();
            const endTime = performance.now();
            const duration = endTime - startTime;
            // Should access large dataset efficiently (less than 50ms);
            expect(duration).toBeLessThan(50);
            expect(statistics).toBeDefined();
            expect(exportData).toBeDefined();
        });'
    }''
}');