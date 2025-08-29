// Test file to check BalanceConfigurationValidator.ts syntax
export interface ErrorHandler {
    handleError(error: any, type: string, context: any): void;
}

export function getErrorHandler(): ErrorHandler {
    return {
        handleError: () => {}
    };
}

// Import the validator to check syntax
import './src/utils/BalanceConfigurationValidator';

console.log('Syntax check passed!');