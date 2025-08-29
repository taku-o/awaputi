#!/usr/bin/env node

import { CleanupOrchestrator } from './CleanupOrchestrator.js';

async function main() {
    const args = process.argv.slice(2);
    const options = {
        dryRun: args.includes('--dry-run'),
        verbose: args.includes('--verbose') || args.includes('-v'),
        validateOnly: args.includes('--validate-only'),
        listOnly: args.includes('--list-only')
    };

    console.log('🧹 File Cleanup Tool');
    console.log('==================');
    
    if (options.dryRun) {
        console.log('🔍 Running in DRY RUN mode - no files will be deleted');
    }
    
    if (options.verbose) {
        console.log('📝 Verbose logging enabled');
    }

    try {
        const orchestrator = new CleanupOrchestrator(options);

        if (options.listOnly) {
            console.log('\n📂 Listing target files:');
            const files = await orchestrator.listTargetFiles();
            if (files.length === 0) {
                console.log('   No files found matching cleanup criteria');
            } else {
                files.forEach(file => {
                    console.log(`   - ${file.fileName} (${file.size})`);
                });
            }
            return;
        }

        if (options.validateOnly) {
            console.log('\n🔍 Validation only mode:');
            const result = await orchestrator.validateOnly();
            console.log(`   Safe to delete: ${result.safeToDelete.length} files`);
            console.log(`   Unsafe to delete: ${result.unsafeToDelete.length} files`);
            return;
        }

        const result = await orchestrator.executeCleanup();
        
        console.log('\n✅ Cleanup completed successfully');
        if (result.summary.deletion) {
            console.log(`   Deleted: ${result.summary.deletion.successfulDeletions} files`);
            console.log(`   Space freed: ${result.summary.deletion.totalSizeDeleted}`);
        }

    } catch (error) {
        console.error('\n❌ Error during cleanup:');
        console.error(error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Export for testing
export { CleanupOrchestrator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}