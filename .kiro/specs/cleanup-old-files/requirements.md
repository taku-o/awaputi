# Requirements Document

## Introduction

プロジェクト内に存在する`_old`や`_original`がついた不要なファイルを特定し、安全に削除するための機能を実装します。これらのファイルは過去のリファクタリングや置き換え作業の際に残されたもので、現在は使用されていないため、プロジェクトの整理とメンテナンス性向上のために削除する必要があります。

## Requirements

### Requirement 1

**User Story:** As a developer, I want to identify and safely remove unused old files with `_old` or `_original` suffixes, so that the project remains clean and maintainable.

#### Acceptance Criteria

1. WHEN the system scans the project THEN it SHALL identify all files with `_old` or `_original` suffixes
2. WHEN a file is identified THEN the system SHALL verify that it is not referenced anywhere in the codebase
3. WHEN verification is complete THEN the system SHALL confirm the file can be safely deleted
4. WHEN deletion is performed THEN the system SHALL remove the file from the filesystem
5. WHEN deletion is complete THEN the system SHALL verify the file no longer exists

### Requirement 2

**User Story:** As a developer, I want to ensure that file deletion is performed safely with proper verification, so that no active code is accidentally removed.

#### Acceptance Criteria

1. WHEN scanning for references THEN the system SHALL exclude the target file itself from the search
2. WHEN checking imports THEN the system SHALL search for both relative and absolute import paths
3. WHEN verifying safety THEN the system SHALL confirm that corresponding current files exist
4. IF any references are found THEN the system SHALL NOT delete the file and SHALL report the references
5. WHEN deletion is performed THEN the system SHALL create a backup record of what was deleted

### Requirement 3

**User Story:** As a developer, I want to have a comprehensive report of the cleanup process, so that I can track what was removed and verify the operation was successful.

#### Acceptance Criteria

1. WHEN the cleanup process starts THEN the system SHALL log all identified files
2. WHEN verification is performed THEN the system SHALL log the verification results
3. WHEN files are deleted THEN the system SHALL log the deletion operations
4. WHEN the process completes THEN the system SHALL provide a summary report
5. IF any errors occur THEN the system SHALL log detailed error information