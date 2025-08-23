import { getErrorHandler  } from '../../utils/ErrorHandler.js';

/**
 * 韓国語入力処理クラス - 韓国語特有の入力処理と最適化
 */

// 型定義
export interface OptimizationSettings {
    debounceDelay: number;
    autoComplete: boolean;
    smartSpacing: boolean;
    predictiveText: boolean;
}

export interface HangulComponent {
    char: string;
    chosung: string;
    jungsung: string;
    jongsung: string;
}

export interface JamoComponent {
    char: string;
    type: JamoType;
}

export interface HangulAnalysis {
    char: string;
    chosung?: string;
    jungsung?: string;
    jongsung?: string;
    type?: JamoType;
}

export interface KoreanTextAnalysis {
    length: number;
    syllables: number;
    jamo: number;
    words: string[];
    particles: string[];
}

export interface InputEventHandlers {
    compositionstart: (event: CompositionEvent) => void;
    compositionupdate: (event: CompositionEvent) => void;
    compositionend: (event: CompositionEvent) => void;
    input: (event: InputEvent) => void;
    keydown: (event: KeyboardEvent) => void;
}

export interface SpacingPattern {
    pattern: RegExp;
    replace: string;
}

export interface HangulDecomposition {
    chosung: string;
    jungsung: string;
    jongsung: string;
}

export interface KoreanInputStats {
    isComposing: boolean;
    compositionText: string;
    attachedInputs: number;
    settings: OptimizationSettings;
    hasKoreanIME: boolean;
}

export interface AutoCompleteDatabase {
    [firstChar: string]: string[];
}

export type JamoType = 'chosung' | 'jungsung' | 'jongsung' | 'unknown';
export type InputElementType = HTMLInputElement | HTMLTextAreaElement;
    export class KoreanInputHandler {
    // ハングル文字の構成要素
    private readonly chosung: string[];
    private readonly jungsung: string[];
    private readonly jongsung: string[];
    
    // ハングル文字コード範囲
    private readonly HANGUL_START: number;
    private readonly HANGUL_END: number;
    
    // IME状態管理
    private isComposing: boolean;
    private compositionText: string;
    // 입력 최적화 설정
    private optimizationSettings: OptimizationSettings;
    // 이벤트 리스너
    private inputListeners: Map<HTMLElement, InputEventHandlers>;

    constructor() {
        this.chosung = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        this.jungsung = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        this.jongsung = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        
        // ハングル文字コード範囲
        this.HANGUL_START = 0xAC00; // 가
        this.HANGUL_END = 0xD7A3;   // 힣
        
        // IME状態管理
        this.isComposing = false;
        this.compositionText = '';
        
        // 입력 최적화 설정
        this.optimizationSettings = {
            debounceDelay: 100,
            autoComplete: true,
            smartSpacing: true,
            predictiveText: false
        };
        // 이벤트 리스너
        this.inputListeners = new Map<HTMLElement, InputEventHandlers>();
        this.initialize();
    }
    /**
     * 초기화
     */
    private initialize(): void {
        console.log('KoreanInputHandler initialized');
        
        // 한글 입력 최적화 감지
        if (this.detectKoreanIME()) {
            console.log('Korean IME detected');
        }
    }
    
    /**
     * 한국어 IME 감지
     */
    private detectKoreanIME(): boolean {
        const languages = navigator.languages || [];
        return languages.some(lang => lang.startsWith('ko'));
    }
    
    /**
     * 입력 필드에 한국어 최적화 적용
     */
    attachToInput(inputElement: HTMLElement): boolean {
        try {
            if (!inputElement || !(inputElement instanceof HTMLElement)) {
                throw new Error('Invalid input element');
            }
            // 이미 등록된 경우 스킵
            if (this.inputListeners.has(inputElement)) {
                console.warn('Input element already has Korean handler attached');
                return false;
            }
            
            // 이벤트 핸들러 생성
            const handlers: InputEventHandlers = {
                compositionstart: this.handleCompositionStart.bind(this),
                compositionupdate: this.handleCompositionUpdate.bind(this),
                compositionend: this.handleCompositionEnd.bind(this),
                input: this.handleInput.bind(this),
                keydown: this.handleKeyDown.bind(this)
            };
            
            // 이벤트 리스너 등록
            Object.entries(handlers).forEach(([event, handler]) => {
                inputElement.addEventListener(event, handler as EventListener);
            });
            
            // 리스너 저장
            this.inputListeners.set(inputElement, handlers);
            
            // 한국어 입력 속성 설정
            this.applyKoreanInputAttributes(inputElement);
            
            console.log('Korean input handler attached to element');
            return true;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'KOREAN_INPUT_ERROR', {
                operation: 'attachToInput'
            });
            return false;
        }
    }
    
    /**
     * 입력 필드에서 한국어 최적화 제거
     */
    detachFromInput(inputElement: HTMLElement): boolean {
        try {
            const handlers = this.inputListeners.get(inputElement);
            if (!handlers) {
                return false;
            }
            
            // 이벤트 리스너 제거
            Object.entries(handlers).forEach(([event, handler]) => {
                inputElement.removeEventListener(event, handler as EventListener);
            });
            // 리스너 삭제
            this.inputListeners.delete(inputElement);

            console.log('Korean input handler detached from element');
            return true;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'KOREAN_INPUT_ERROR', {
                operation: 'detachFromInput'
            });
            return false;
        }
    }
    
    /**
     * 한국어 입력 속성 적용
     */
    private applyKoreanInputAttributes(inputElement: HTMLElement): void {
        // IME 모드 설정
        (inputElement as any).style.imeMode = 'active';
        
        // 한국어 입력 관련 속성
        inputElement.setAttribute('lang', 'ko');
        inputElement.setAttribute('inputmode', 'text');
        
        // 자동 완성 설정
        if (this.optimizationSettings.autoComplete) {
            inputElement.setAttribute('autocomplete', 'on');
        }
        }

        // 맞춤법 검사 비활성화 (한국어는 브라우저 지원이 제한적)
        inputElement.setAttribute('spellcheck', 'false');
    }
    
    /**
     * Composition 시작 처리
     */
    private handleCompositionStart(event: CompositionEvent): void {
        this.isComposing = true;
        this.compositionText = '';
        console.log('Korean composition started');
    }
    
    /**
     * Composition 업데이트 처리
     */
    private handleCompositionUpdate(event: CompositionEvent): void {
        this.compositionText = event.data || '';
        
        // 실시간 한글 조합 분석
        if (this.isHangul(this.compositionText)) {
            const analyzed = this.analyzeHangul(this.compositionText);
            console.log('Composing Hangul:', analyzed);
        }
    }
    
    /**
     * Composition 종료 처리
     */
    private handleCompositionEnd(event: CompositionEvent): void {
        this.isComposing = false;
        
        // 최종 입력된 한글 처리
        if (event.data && this.isHangul(event.data)) {
            this.processKoreanInput(event.data, event.target as HTMLElement);
        }
        
        this.compositionText = '';
        console.log('Korean composition ended:', event.data);
    }
    
    /**
     * 일반 입력 처리
     */
    private handleInput(event: InputEvent): void {
        const target = event.target as InputElementType;
        // Composition 중이 아닐 때만 처리
        if (!this.isComposing && target.value) {
            this.optimizeKoreanText(target);
        }
    }
    
    /**
     * 키 다운 이벤트 처리
     */
    private handleKeyDown(event: KeyboardEvent): void {
        // 한국어 입력 중 특수 키 처리
        if (this.isComposing) {
            // Space 키로 조합 완료
            if (event.key === ' ' && this.optimizationSettings.smartSpacing) {
                // 스마트 띄어쓰기 처리
                this.handleSmartSpacing(event);
            }
        }
    }
    /**
     * 한국어 입력 처리
     */
    private processKoreanInput(text: string, inputElement: HTMLElement): void {
        try {
            // 입력된 텍스트 분석
            const analysis = this.analyzeKoreanText(text);
            // 최적화 적용
            if (this.optimizationSettings.autoComplete) {
                // 자동 완성 제안
                const suggestions = this.getAutoCompleteSuggestions(text);
                if (suggestions.length > 0) {
                    console.log('Auto-complete suggestions:', suggestions);
                }
            }
            
            // 입력 통계 수집
            this.collectInputStatistics(analysis);

        } catch (error) {
            console.warn('Error processing Korean input:', error);
        }
    }
    
    /**
     * 한국어 텍스트 최적화
     */
    private optimizeKoreanText(inputElement: InputElementType): void {
        const text = inputElement.value;
        
        // 자모 분리 현상 수정
        const fixed = this.fixSeparatedJamo(text);
        if (fixed !== text) {
            inputElement.value = fixed;
            console.log('Fixed separated jamo');
        }
        }
        
        // 띄어쓰기 최적화
        if (this.optimizationSettings.smartSpacing) {
            const spaced = this.optimizeSpacing(inputElement.value);
            if (spaced !== inputElement.value) {
                inputElement.value = spaced;
            }
        }
    }
    /**
     * 한글 여부 확인
     */
    private isHangul(text: string): boolean {
        if (!text) return false;
        
        const hangulRegex = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
        return hangulRegex.test(text);
    }
    /**
     * 한글 음절 분석
     */
    private analyzeHangul(text: string): HangulAnalysis[] {
        const results: HangulAnalysis[] = [];
        
        for (const char of text) {
        
            const code = char.charCodeAt(0);
            if (code >= this.HANGUL_START && code <= this.HANGUL_END) {
                // 완성형 한글 분해
                const offset = code - this.HANGUL_START;
                const chosungIndex = Math.floor(offset / (21 * 28));
                const jungsungIndex = Math.floor((offset % (21 * 28)) / 28);
                const jongsungIndex = offset % 28;
                
                results.push({
                    char: char,
                    chosung: this.chosung[chosungIndex],
                    jungsung: this.jungsung[jungsungIndex],
                    jongsung: this.jongsung[jongsungIndex] || ''
                });
            } else if (this.chosung.includes(char) || this.jungsung.includes(char) || this.jongsung.includes(char)) {
                // 자모음
                results.push({
                    char: char,
                    type: this.getJamoType(char)
                });
            }
        }
        
        return results;
    }
    
    /**
     * 자모 타입 확인
     */
    private getJamoType(char: string): JamoType {
        if (this.chosung.includes(char)) return 'chosung';
        if (this.jungsung.includes(char)) return 'jungsung';
        if (this.jongsung.includes(char)) return 'jongsung';
        return 'unknown';
    }
    
    /**
     * 분리된 자모 수정
     */
    private fixSeparatedJamo(text: string): string {
        // 분리된 자모를 조합형으로 변환
        let fixed = text;
        
        // 간단한 패턴 매칭으로 자모 조합
        // 예: ㄱ + ㅏ = 가
        const simplePatterns: SpacingPattern[] = [
            { pattern: /ㄱㅏ/g, replace: '가' },
            { pattern: /ㄴㅏ/g, replace: '나' },
            { pattern: /ㄷㅏ/g, replace: '다' }
            // ... 더 많은 패턴 추가 가능
        ];
        
        simplePatterns.forEach(({ pattern, replace }) => {
            fixed = fixed.replace(pattern, replace);
        });
        
        return fixed;
    }
    
    /**
     * 스마트 띄어쓰기 처리
     */
    private handleSmartSpacing(event: KeyboardEvent): void {
        // 한국어 띄어쓰기 규칙 적용
        const input = event.target as InputElementType;
        const text = input.value;
        const cursorPos = input.selectionStart;
        // 조사 앞 띄어쓰기 제거
        const particles = ['은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과', '의', '도', '만', '까지'];
        
        particles.forEach(particle => {
            const pattern = new RegExp(` ${particle}`, 'g');
            if (pattern.test(text)) {
                input.value = text.replace(pattern, particle);
            }
        });
    }
    /**
     * 띄어쓰기 최적화
     */
    private optimizeSpacing(text: string): string {
        // 기본적인 띄어쓰기 규칙 적용
        let optimized = text;
        // 조사 앞 공백 제거
        const particles = ['은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로'];
        
        particles.forEach(particle => {
            const regex = new RegExp(`\\s+${particle}`, 'g');
            optimized = optimized.replace(regex, particle);
        });
        
        // 중복 공백 제거
        optimized = optimized.replace(/\s+/g, ' ');
        
        return optimized.trim();
    }
    
    /**
     * 한국어 텍스트 분석
     */
    private analyzeKoreanText(text: string): KoreanTextAnalysis {
        const analysis: KoreanTextAnalysis = {
            length: text.length,
            syllables: 0,
            jamo: 0,
            words: [],
            particles: []
        };
        // 음절 수 계산
        for (const char of text) {
            const code = char.charCodeAt(0);
            if (code >= this.HANGUL_START && code <= this.HANGUL_END) {
                analysis.syllables++;
            } else if (this.isJamo(char)) {
                analysis.jamo++;
            }
        }
        
        // 단어 분리 (간단한 구현)
        analysis.words = text.split(/\s+/).filter(word => word.length > 0);
        
        return analysis;
    }
    
    /**
     * 자모 여부 확인
     */
    private isJamo(char: string): boolean {
        return this.chosung.includes(char) || 
               this.jungsung.includes(char) || 
               this.jongsung.includes(char);
    }
    
    /**
     * 자동 완성 제안 생성
     */
    private getAutoCompleteSuggestions(text: string): string[] {
        // 실제 구현에서는 사전 데이터베이스나 API를 사용
        const commonWords: AutoCompleteDatabase = {
            '안': ['안녕하세요', '안녕', '안전'],
            '감': ['감사합니다', '감사', '감동'],
            '사': ['사랑', '사람', '사과'],
            '행': ['행복', '행운', '행사']
        };
        
        const firstChar = text[0];
        return commonWords[firstChar] || [];
    }
    
    /**
     * 입력 통계 수집
     */
    private collectInputStatistics(analysis: KoreanTextAnalysis): void {
        // 향후 입력 패턴 분석을 위한 통계 수집
        console.log('Korean input statistics:', analysis);
    }

    /**
     * 한글 조합 (자모 -> 음절)
     */
    composeHangul(chosung: string, jungsung: string, jongsung: string = ''): string | null {
        const chosungIndex = this.chosung.indexOf(chosung);
        const jungsungIndex = this.jungsung.indexOf(jungsung);
        const jongsungIndex = jongsung ? this.jongsung.indexOf(jongsung) : 0;
        
        if (chosungIndex === -1 || jungsungIndex === -1 || jongsungIndex === -1) {
            return null;
        }
        
        const code = this.HANGUL_START + 
                    (chosungIndex * 21 * 28) + 
                    (jungsungIndex * 28) + 
                    jongsungIndex;
        
        return String.fromCharCode(code);
    }
    
    /**
     * 한글 분해 (음절 -> 자모)
     */
    decomposeHangul(syllable: string): HangulDecomposition | null {
        const code = syllable.charCodeAt(0);
        if (code < this.HANGUL_START || code > this.HANGUL_END) {
            return null;
        }
        
        const offset = code - this.HANGUL_START;

        const chosungIndex = Math.floor(offset / (21 * 28));
        const jungsungIndex = Math.floor((offset % (21 * 28)) / 28);
        const jongsungIndex = offset % 28;
        
        return {
            chosung: this.chosung[chosungIndex],
            jungsung: this.jungsung[jungsungIndex],
            jongsung: jongsungIndex > 0 ? this.jongsung[jongsungIndex] : ''
        };
    }
    
    /**
     * 설정 업데이트
     */
    updateSettings(settings: Partial<OptimizationSettings>): void {
        Object.assign(this.optimizationSettings, settings);
        console.log('Korean input settings updated:', this.optimizationSettings);
    }
    
    /**
     * 통계 및 상태 정보
     */
    getStats(): KoreanInputStats {
        return {
            isComposing: this.isComposing,
            compositionText: this.compositionText,
            attachedInputs: this.inputListeners.size,
            settings: this.optimizationSettings,
            hasKoreanIME: this.detectKoreanIME()
        };
    }
    
    /**
     * 모든 리스너 정리
     */
    cleanup(): void {
        // 모든 입력 필드에서 핸들러 제거
        this.inputListeners.forEach((handlers, element) => {
            this.detachFromInput(element);
        });

        console.log('Korean input handler cleaned up');
    }
}

// 싱글톤 인스턴스
let koreanInputHandlerInstance: KoreanInputHandler | null = null;

/**
 * KoreanInputHandler의 싱글톤 인스턴스 가져오기
 */
export function getKoreanInputHandler(): KoreanInputHandler {
    if (!koreanInputHandlerInstance) {
        koreanInputHandlerInstance = new KoreanInputHandler();
    }
    return koreanInputHandlerInstance;
}