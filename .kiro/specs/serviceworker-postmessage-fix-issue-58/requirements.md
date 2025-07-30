# Requirements Document

## Introduction

ServiceWorker内で`self.postMessage()`を直接呼び出すことによるエラーを修正する機能です。ServiceWorkerコンテキストでは`self.postMessage`は存在せず、クライアントにメッセージを送信するには`clients.matchAll()`を使用してクライアントを取得し、各クライアントに対して`client.postMessage()`を呼び出す必要があります。既に実装されている`postMessageToClients()`関数を使用して、不正なAPI使用を修正します。

## Requirements

### Requirement 1

**User Story:** As a developer, I want the ServiceWorker to properly communicate with clients, so that PWA functionality works correctly without errors.

#### Acceptance Criteria

1. WHEN ServiceWorker needs to send cache update notifications THEN the system SHALL use `postMessageToClients()` instead of `self.postMessage()`
2. WHEN ServiceWorker needs to send offline ready notifications THEN the system SHALL use `postMessageToClients()` instead of `self.postMessage()`
3. WHEN ServiceWorker is installed THEN the system SHALL not throw "self.postMessage is not a function" errors
4. WHEN ServiceWorker sends messages to clients THEN the system SHALL successfully deliver messages to all connected clients

### Requirement 2

**User Story:** As a user, I want the PWA features to initialize properly, so that I can use offline functionality without issues.

#### Acceptance Criteria

1. WHEN the application loads THEN ServiceWorker SHALL install successfully without errors
2. WHEN ServiceWorker is activated THEN offline functionality SHALL be available
3. WHEN cache updates occur THEN clients SHALL receive proper notifications
4. WHEN offline mode is ready THEN clients SHALL be notified appropriately

### Requirement 3

**User Story:** As a developer, I want consistent message handling in ServiceWorker, so that all client communications use the same pattern.

#### Acceptance Criteria

1. WHEN any ServiceWorker code needs to send messages THEN it SHALL use the `postMessageToClients()` function
2. WHEN `postMessageToClients()` is called THEN it SHALL send messages to all matched clients
3. WHEN no clients are available THEN the function SHALL handle the case gracefully
4. WHEN message sending fails THEN appropriate error handling SHALL be implemented