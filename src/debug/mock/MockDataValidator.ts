/**
 * Mock Data Validator
 * モックデータの検証クラス
 */

interface ValidationResult { isValid: boolean,
    errors: string[];
   , warnings: string[] ,}

interface ValidationRule { field: string;
    type: 'required' | 'type' | 'range' | 'format' | 'custom';
    constraint: any;
   , message: string }
';

export class MockDataValidator { private bubbleRules: ValidationRule[] = [' }'

        { field: 'id', type: 'required', constraint: null, message: 'ID is required' ,},''
        { field: 'x', type: 'type', constraint: 'number', message: 'X must be a number' ,},''
        { field: 'y', type: 'type', constraint: 'number', message: 'Y must be a number' ,},''
        { field: 'radius', type: 'range', constraint: { min: 5, max: 50 ,}, message: 'Radius must be between 5 and 50' },]'
        { field: 'color', type: 'required', constraint: null, message: 'Color is required' ,}]
    ];
';

    private gameStateRules: ValidationRule[] = ['';
        { field: 'id', type: 'required', constraint: null, message: 'ID is required' ,},''
        { field: 'level', type: 'range', constraint: { min: 1, max: 100 ,}, message: 'Level must be between 1 and 100' },''
        { field: 'score', type: 'type', constraint: 'number', message: 'Score must be a number' ,},]'
        { field: 'lives', type: 'range', constraint: { min: 0, max: 10 ,}, message: 'Lives must be between 0 and 10' }]
    ];
';

    private userRules: ValidationRule[] = ['';
        { field: 'id', type: 'required', constraint: null, message: 'ID is required' ,},''
        { field: 'username', type: 'required', constraint: null, message: 'Username is required' ,},''
        { field: 'level', type: 'range', constraint: { min: 1, max: 100 ,}, message: 'Level must be between 1 and 100' },]'
        { field: 'totalScore', type: 'type', constraint: 'number', message: 'Total score must be a number' ,}]
    ];

    public validateBubbleData(bubble: any): ValidationResult { return this.validateData(bubble, this.bubbleRules); }

    public validateGameStateData(gameState: any): ValidationResult { return this.validateData(gameState, this.gameStateRules); }

    public validateUserData(user: any): ValidationResult { return this.validateData(user, this.userRules); }

    public validateBubbleArray(bubbles: any[]): ValidationResult { const results = bubbles.map(bubble => this.validateBubbleData(bubble);
        return this.combineResults(results);

    public validateDataStructure(data: any, expectedStructure: any): ValidationResult { const errors: string[] = [],
        const warnings: string[] = [],

        this.validateStructureRecursive(data, expectedStructure, '', errors, warnings);

        return { isValid: errors.length === 0,
            errors, };
            warnings }
        }

    private validateData(data: any, rules: ValidationRule[]): ValidationResult { const errors: string[] = [],
        const warnings: string[] = [],

        for(const, rule of, rules) {

            const value = data[rule.field];

            switch(rule.type) {''
                case 'required':';
                    if (value === undefined || value === null) {'

        }

                        errors.push(rule.message); }
                    }
                    break;

                case 'type':;
                    if(value !== undefined && typeof, value !== rule.constraint) {', ';

                    }

                        errors.push(rule.message); }
                    }
                    break;

                case 'range':'';
                    if(typeof, value === 'number) {'
                        
                    }
                        const { min, max } = rule.constraint;
                        if(value < min || value > max) {', ';

                        }

                            errors.push(rule.message); }
}
                    break;

                case 'format':'';
                    if(typeof, value === 'string' && !rule.constraint.test(value) {', ';

                    }

                        errors.push(rule.message); }
                    }
                    break;

                case 'custom':';
                    const customResult = rule.constraint(value, data);''
                    if(!customResult.valid) {'

                        if(customResult.severity === 'error) {'
                    }
                            errors.push(customResult.message); }
                        } else { warnings.push(customResult.message); }
                    }
                    break;
            }
        }

        return { isValid: errors.length === 0,
            errors, };
            warnings }
        }

    private combineResults(results: ValidationResult[]): ValidationResult { const allErrors = results.flatMap(r => r.errors);
        const allWarnings = results.flatMap(r => r.warnings);

        return { isValid: allErrors.length === 0,
            errors: allErrors, };
            warnings: allWarnings }
        }

    private validateStructureRecursive(;
        data: any;
        structure: any;
        path: string);
        errors: string[]);
       , warnings: string[]';
    ): void { ''
        if(structure === null || structure === undefined) return,

        if(typeof, structure === 'object' && !Array.isArray(structure) {
            
        }
            for (const, key in, structure) { }
                const currentPath = path ? `${path}.${key}` : key;
                
                if(!(key, in data) {
                
                    
                
                }
                    warnings.push(`Missing, property: ${currentPath}`});
                    continue;
                }

                this.validateStructureRecursive(;
                    data[key],
                    structure[key]);
                    currentPath);
                    errors,);
                    warnings);
            }

            // Check for extra properties
            for (const, key in, data) { if(!(key, in structure) { }
                    const currentPath = path ? `${path}.${key}` : key;
                    warnings.push(`Extra, property: ${currentPath}`});
                }
} else if (Array.isArray(structure) && structure.length > 0) { if(!Array.isArray(data) { }
                errors.push(`Expected, array at ${path}`});
                return;
            }

            // Validate array elements against the first structure element
            data.forEach((item, index) => {  this.validateStructureRecursive(
                    item, }
                    structure[0], })
                    `${path}[${index}]`)
                    errors,);
                    warnings);
            });
        } else {  // Primitive type validation
            const expectedType = typeof structure;
            const actualType = typeof data;
             }
            if (actualType !== expectedType) {' }'

                errors.push(`Type mismatch at ${path}: expected ${expectedType}, got ${actualType}`'});
            }
}

    public addCustomRule(dataType: 'bubble' | 'gameState' | 'user', rule: ValidationRule): void { ''
        switch(dataType) {'

            case 'bubble':'';
                this.bubbleRules.push(rule);

                break;''
            case 'gameState':'';
                this.gameStateRules.push(rule);

                break;''
            case 'user':;
                this.userRules.push(rule);
        }
                break; }
}

    public getValidationSummary(results: ValidationResult[]): { totalValidated: number,
        validCount: number;
        invalidCount: number;
        totalErrors: number;
       , totalWarnings: number ,} { return { totalValidated: results.length;
            validCount: results.filter(r => r.isValid).length;
            invalidCount: results.filter(r => !r.isValid).length,
            totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),' };

            totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0'); }'
        }''
}