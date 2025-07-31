# ColorContrastAnalyzer

## 概要

ファイル: `accessibility/ColorContrastAnalyzer.js`  
最終更新: 2025/7/29 0:51:16

## 目次

## クラス
- [ColorContrastAnalyzer](#colorcontrastanalyzer)
## 定数
- [startTime](#starttime)
- [textElements](#textelements)
- [analysis](#analysis)
- [endTime](#endtime)
- [analysisTime](#analysistime)
- [styles](#styles)
- [textContent](#textcontent)
- [foregroundColor](#foregroundcolor)
- [backgroundColor](#backgroundcolor)
- [contrastRatio](#contrastratio)
- [fontSize](#fontsize)
- [fontWeight](#fontweight)
- [isLargeText](#islargetext)
- [wcagRequirement](#wcagrequirement)
- [passed](#passed)
- [warnings](#warnings)
- [colorBlindnessIssues](#colorblindnessissues)
- [analysis](#analysis)
- [cacheKey](#cachekey)
- [allElements](#allelements)
- [textElements](#textelements)
- [textContent](#textcontent)
- [hasChildren](#haschildren)
- [hasDirectTextNode](#hasdirecttextnode)
- [styles](#styles)
- [cached](#cached)
- [rgbaMatch](#rgbamatch)
- [hexMatch](#hexmatch)
- [hex](#hex)
- [hslMatch](#hslmatch)
- [h](#h)
- [s](#s)
- [l](#l)
- [a](#a)
- [styles](#styles)
- [bgColor](#bgcolor)
- [alpha](#alpha)
- [invAlpha](#invalpha)
- [l1](#l1)
- [l2](#l2)
- [lighter](#lighter)
- [darker](#darker)
- [rsRGB](#rsrgb)
- [gsRGB](#gsrgb)
- [bsRGB](#bsrgb)
- [rLinear](#rlinear)
- [gLinear](#glinear)
- [bLinear](#blinear)
- [hue2rgb](#hue2rgb)
- [q](#q)
- [p](#p)
- [namedColors](#namedcolors)
- [weights](#weights)
- [standard](#standard)
- [simulatedForeground](#simulatedforeground)
- [simulatedBackground](#simulatedbackground)
- [simulatedContrast](#simulatedcontrast)
- [rNorm](#rnorm)
- [gNorm](#gnorm)
- [bNorm](#bnorm)
- [newR](#newr)
- [newG](#newg)
- [newB](#newb)
- [issues](#issues)
- [colorDependentWords](#colordependentwords)
- [hasColorDependentInfo](#hascolordependentinfo)
- [foregroundHue](#foregroundhue)
- [backgroundHue](#backgroundhue)
- [hueDifference](#huedifference)
- [max](#max)
- [min](#min)
- [d](#d)
- [contrasts](#contrasts)
- [colorPairs](#colorpairs)
- [pairKey](#pairkey)
- [count](#count)
- [recommendations](#recommendations)
- [recentlyModified](#recentlymodified)
- [analysis](#analysis)
- [saved](#saved)
- [data](#data)
- [dataToSave](#datatosave)
- [report](#report)

---

## ColorContrastAnalyzer

### コンストラクタ

```javascript
new ColorContrastAnalyzer(accessibilityManager)
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `accessibilityManager` | 説明なし |
| `gameEngine` | 説明なし |
| `config` | 色コントラスト設定 |
| `wcagStandards` | WCAGコントラスト基準 |
| `colorBlindnessTypes` | 色覚異常シミュレーション設定 |
| `results` | 分析結果 |
| `colorCache` | 色情報キャッシュ |
| `monitoring` | 監視システム |
| `performance` | パフォーマンス指標 |
| `stats` | 統計情報 |

### メソッド

#### initialize

**シグネチャ**:
```javascript
 initialize()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initialize();

// システムの初期化
await instance.initialize();
console.log('Initialization complete');
```

#### if

初回分析の実行

**シグネチャ**:
```javascript
 if (this.config.enabled)
```

**パラメーター**:
- `this.config.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runFullAnalysis

**シグネチャ**:
```javascript
async runFullAnalysis()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runFullAnalysis();

// runFullAnalysisの実用的な使用例
const result = instance.runFullAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const element of textElements)
```

**パラメーター**:
- `const element of textElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const element of textElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (analysis)
```

**パラメーター**:
- `analysis`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysis);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (analysis.passed)
```

**パラメーター**:
- `analysis.passed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysis.passed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (analysis.warnings.length > 0)
```

**パラメーター**:
- `analysis.warnings.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysis.warnings.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

色覚異常シミュレーション

**シグネチャ**:
```javascript
 if (this.config.colorBlindnessSimulation)
```

**パラメーター**:
- `this.config.colorBlindnessSimulation`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.config.colorBlindnessSimulation);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeElementContrast

**シグネチャ**:
```javascript
async analyzeElementContrast(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeElementContrast(element);

// analyzeElementContrastの実用的な使用例
const result = instance.analyzeElementContrast(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!textContent || textContent.length === 0)
```

**パラメーター**:
- `!textContent || textContent.length === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!textContent || textContent.length === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!foregroundColor || !backgroundColor)
```

**パラメーター**:
- `!foregroundColor || !backgroundColor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!foregroundColor || !backgroundColor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (contrastRatio < wcagRequirement * 1.2)
```

**パラメーター**:
- `contrastRatio < wcagRequirement * 1.2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(contrastRatio < wcagRequirement * 1.2);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getTextElements

**シグネチャ**:
```javascript
 getTextElements()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getTextElements();

// getTextElementsの実用的な使用例
const result = instance.getTextElements(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const element of allElements)
```

**パラメーター**:
- `const element of allElements`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const element of allElements);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

テキストを含み、子要素がない要素、または直接のテキストノードを持つ要素

**シグネチャ**:
```javascript
 if (textContent && textContent.length > 0)
```

**パラメーター**:
- `textContent && textContent.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(textContent && textContent.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!hasChildren || hasDirectTextNode)
```

**パラメーター**:
- `!hasChildren || hasDirectTextNode`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!hasChildren || hasDirectTextNode);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

非表示要素を除外

**シグネチャ**:
```javascript
 if (styles.display !== 'none' && 
                        styles.visibility !== 'hidden' &&
                        styles.opacity !== '0')
```

**パラメーター**:
- `styles.display !== 'none' && 
                        styles.visibility !== 'hidden' &&
                        styles.opacity !== '0'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(styles.display !== 'none' && 
                        styles.visibility !== 'hidden' &&
                        styles.opacity !== '0');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### parseColor

**シグネチャ**:
```javascript
 parseColor(colorStr)
```

**パラメーター**:
- `colorStr`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.parseColor(colorStr);

// parseColorの実用的な使用例
const result = instance.parseColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (rgbaMatch)
```

**パラメーター**:
- `rgbaMatch`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(rgbaMatch);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hexMatch)
```

**パラメーター**:
- `hexMatch`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hexMatch);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hex.length === 3)
```

**パラメーター**:
- `hex.length === 3`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hex.length === 3);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hslMatch)
```

**パラメーター**:
- `hslMatch`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hslMatch);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

名前付き色

**シグネチャ**:
```javascript
 if (!color)
```

**パラメーター**:
- `!color`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!color);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

キャッシュに保存

**シグネチャ**:
```javascript
 if (color)
```

**パラメーター**:
- `color`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(color);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getEffectiveBackgroundColor

**シグネチャ**:
```javascript
 getEffectiveBackgroundColor(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getEffectiveBackgroundColor(element);

// getEffectiveBackgroundColorの実用的な使用例
const result = instance.getEffectiveBackgroundColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### while

親要素を遡って最初の不透明な背景色を見つける

**シグネチャ**:
```javascript
 while (currentElement && currentElement !== document.body.parentElement)
```

**パラメーター**:
- `currentElement && currentElement !== document.body.parentElement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.while(currentElement && currentElement !== document.body.parentElement);

// whileの実用的な使用例
const result = instance.while(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bgColor && bgColor.a > 0)
```

**パラメーター**:
- `bgColor && bgColor.a > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bgColor && bgColor.a > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!backgroundColor)
```

**パラメーター**:
- `!backgroundColor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!backgroundColor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (bgColor.a >= 1.0)
```

**パラメーター**:
- `bgColor.a >= 1.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(bgColor.a >= 1.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

デフォルト背景色（白）

**シグネチャ**:
```javascript
 if (!backgroundColor)
```

**パラメーター**:
- `!backgroundColor`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!backgroundColor);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### blendColors

**シグネチャ**:
```javascript
 blendColors(foreground, background)
```

**パラメーター**:
- `foreground`
- `background`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.blendColors(foreground, background);

// blendColorsの実用的な使用例
const result = instance.blendColors(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### calculateContrastRatio

**シグネチャ**:
```javascript
 calculateContrastRatio(color1, color2)
```

**パラメーター**:
- `color1`
- `color2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.calculateContrastRatio(color1, color2);

// calculateContrastRatioの実用的な使用例
const result = instance.calculateContrastRatio(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getRelativeLuminance

**シグネチャ**:
```javascript
 getRelativeLuminance(color)
```

**パラメーター**:
- `color`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getRelativeLuminance(color);

// getRelativeLuminanceの実用的な使用例
const result = instance.getRelativeLuminance(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### hslToRgb

**シグネチャ**:
```javascript
 hslToRgb(h, s, l, a = 1)
```

**パラメーター**:
- `h`
- `s`
- `l`
- `a = 1`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.hslToRgb(h, s, l, a = 1);

// hslToRgbの実用的な使用例
const result = instance.hslToRgb(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (s === 0)
```

**パラメーター**:
- `s === 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(s === 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### parseNamedColor

**シグネチャ**:
```javascript
 parseNamedColor(colorName)
```

**パラメーター**:
- `colorName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.parseNamedColor(colorName);

// parseNamedColorの実用的な使用例
const result = instance.parseNamedColor(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### parseFontWeight

**シグネチャ**:
```javascript
 parseFontWeight(fontWeight)
```

**パラメーター**:
- `fontWeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.parseFontWeight(fontWeight);

// parseFontWeightの実用的な使用例
const result = instance.parseFontWeight(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### isLargeText

**シグネチャ**:
```javascript
 isLargeText(fontSize, fontWeight)
```

**パラメーター**:
- `fontSize`
- `fontWeight`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.isLargeText(fontSize, fontWeight);

// isLargeTextの実用的な使用例
const result = instance.isLargeText(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getWcagRequirement

**シグネチャ**:
```javascript
 getWcagRequirement(isLargeText)
```

**パラメーター**:
- `isLargeText`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getWcagRequirement(isLargeText);

// getWcagRequirementの実用的な使用例
const result = instance.getWcagRequirement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateCacheKey

**シグネチャ**:
```javascript
 generateCacheKey(color1, color2)
```

**パラメーター**:
- `color1`
- `color2`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateCacheKey(color1, color2);

// generateCacheKeyの実用的な使用例
const result = instance.generateCacheKey(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runColorBlindnessAnalysis

**シグネチャ**:
```javascript
async runColorBlindnessAnalysis()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runColorBlindnessAnalysis();

// runColorBlindnessAnalysisの実用的な使用例
const result = instance.runColorBlindnessAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const [element, analysis] of this.results.elementAnalysis)
```

**パラメーター**:
- `const [element`
- `analysis] of this.results.elementAnalysis`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const [element, analysis] of this.results.elementAnalysis);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (simulatedContrast < analysis.wcagRequirement)
```

**パラメーター**:
- `simulatedContrast < analysis.wcagRequirement`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(simulatedContrast < analysis.wcagRequirement);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### simulateColorBlindness

**シグネチャ**:
```javascript
 simulateColorBlindness(color, matrix)
```

**パラメーター**:
- `color`
- `matrix`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.simulateColorBlindness(color, matrix);

// simulateColorBlindnessの実用的な使用例
const result = instance.simulateColorBlindness(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### checkColorBlindnessVisibility

**シグネチャ**:
```javascript
 checkColorBlindnessVisibility(foregroundColor, backgroundColor, textContent)
```

**パラメーター**:
- `foregroundColor`
- `backgroundColor`
- `textContent`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.checkColorBlindnessVisibility(foregroundColor, backgroundColor, textContent);

// checkColorBlindnessVisibilityの実用的な使用例
const result = instance.checkColorBlindnessVisibility(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hasColorDependentInfo)
```

**パラメーター**:
- `hasColorDependentInfo`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hasColorDependentInfo);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (hueDifference < 30 || hueDifference > 330)
```

**パラメーター**:
- `hueDifference < 30 || hueDifference > 330`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(hueDifference < 30 || hueDifference > 330);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### rgbToHsl

**シグネチャ**:
```javascript
 rgbToHsl(r, g, b)
```

**パラメーター**:
- `r`
- `g`
- `b`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.rgbToHsl(r, g, b);

// rgbToHslの実用的な使用例
const result = instance.rgbToHsl(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (max === min)
```

**パラメーター**:
- `max === min`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(max === min);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### switch

**シグネチャ**:
```javascript
 switch (max)
```

**パラメーター**:
- `max`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.switch(max);

// switchの実用的な使用例
const result = instance.switch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateStatisticsReport

**シグネチャ**:
```javascript
 generateStatisticsReport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateStatisticsReport();

// generateStatisticsReportの実用的な使用例
const result = instance.generateStatisticsReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (contrasts.length > 0)
```

**パラメーター**:
- `contrasts.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(contrasts.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateRecommendations

**シグネチャ**:
```javascript
 generateRecommendations()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateRecommendations();

// generateRecommendationsの実用的な使用例
const result = instance.generateRecommendations(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

低コントラスト問題

**シグネチャ**:
```javascript
 if (this.results.contrastIssues.length > 0)
```

**パラメーター**:
- `this.results.contrastIssues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.results.contrastIssues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

色覚異常対応

**シグネチャ**:
```javascript
 if (this.results.colorBlindnessIssues.length > 0)
```

**パラメーター**:
- `this.results.colorBlindnessIssues.length > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.results.colorBlindnessIssues.length > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

平均コントラストが低い場合

**シグネチャ**:
```javascript
 if (this.results.statisticsReport.averageContrast < 7.0)
```

**パラメーター**:
- `this.results.statisticsReport.averageContrast < 7.0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.results.statisticsReport.averageContrast < 7.0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setupRealtimeMonitoring

**シグネチャ**:
```javascript
 setupRealtimeMonitoring()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setupRealtimeMonitoring();

// setupRealtimeMonitoringの実用的な使用例
const result = instance.setupRealtimeMonitoring(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (shouldAnalyze)
```

**パラメーター**:
- `shouldAnalyze`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(shouldAnalyze);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### scheduleAnalysis

**シグネチャ**:
```javascript
 scheduleAnalysis()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.scheduleAnalysis();

// scheduleAnalysisの実用的な使用例
const result = instance.scheduleAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.monitoring.analysisTimeout)
```

**パラメーター**:
- `this.monitoring.analysisTimeout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitoring.analysisTimeout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### runQuickAnalysis

**シグネチャ**:
```javascript
async runQuickAnalysis()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.runQuickAnalysis();

// runQuickAnalysisの実用的な使用例
const result = instance.runQuickAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### for

**シグネチャ**:
```javascript
 for (const element of recentlyModified)
```

**パラメーター**:
- `const element of recentlyModified`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.for(const element of recentlyModified);

// forの実用的な使用例
const result = instance.for(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (analysis && !analysis.passed)
```

**パラメーター**:
- `analysis && !analysis.passed`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(analysis && !analysis.passed);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### bindEvents

**シグネチャ**:
```javascript
 bindEvents()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.bindEvents();

// bindEventsの実用的な使用例
const result = instance.bindEvents(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ページ読み込み完了後の分析

**シグネチャ**:
```javascript
 if (document.readyState === 'loading')
```

**パラメーター**:
- `document.readyState === 'loading'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(document.readyState === 'loading');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

ゲームイベントでの分析

**シグネチャ**:
```javascript
 if (this.gameEngine)
```

**パラメーター**:
- `this.gameEngine`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.gameEngine);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### loadAnalysisHistory

**シグネチャ**:
```javascript
 loadAnalysisHistory()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.loadAnalysisHistory();

// loadAnalysisHistoryの実用的な使用例
const result = instance.loadAnalysisHistory(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (saved)
```

**パラメーター**:
- `saved`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(saved);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### saveAnalysisResults

**シグネチャ**:
```javascript
 saveAnalysisResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.saveAnalysisResults();

// saveAnalysisResultsの実用的な使用例
const result = instance.saveAnalysisResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### catch

**シグネチャ**:
```javascript
 catch (error)
```

**パラメーター**:
- `error`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.catch(error);

// catchの実用的な使用例
const result = instance.catch(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setWcagLevel

**シグネチャ**:
```javascript
 setWcagLevel(level)
```

**パラメーター**:
- `level`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setWcagLevel(level);

// setWcagLevelの実用的な使用例
const result = instance.setWcagLevel(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### toggleRealTimeAnalysis

**シグネチャ**:
```javascript
 toggleRealTimeAnalysis(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.toggleRealTimeAnalysis(enabled);

// toggleRealTimeAnalysisの実用的な使用例
const result = instance.toggleRealTimeAnalysis(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (enabled && !this.monitoring.enabled)
```

**パラメーター**:
- `enabled && !this.monitoring.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(enabled && !this.monitoring.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!enabled && this.monitoring.enabled)
```

**パラメーター**:
- `!enabled && this.monitoring.enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!enabled && this.monitoring.enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### analyzeElement

**シグネチャ**:
```javascript
async analyzeElement(element)
```

**パラメーター**:
- `element`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.analyzeElement(element);

// analyzeElementの実用的な使用例
const result = instance.analyzeElement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getColorBlindnessSimulation

**シグネチャ**:
```javascript
 getColorBlindnessSimulation(type)
```

**パラメーター**:
- `type`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getColorBlindnessSimulation(type);

// getColorBlindnessSimulationの実用的な使用例
const result = instance.getColorBlindnessSimulation(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!this.colorBlindnessTypes[type])
```

**パラメーター**:
- `!this.colorBlindnessTypes[type]`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!this.colorBlindnessTypes[type]);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### getAnalysisResults

**シグネチャ**:
```javascript
 getAnalysisResults()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.getAnalysisResults();

// getAnalysisResultsの実用的な使用例
const result = instance.getAnalysisResults(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateDetailedReport

**シグネチャ**:
```javascript
 generateDetailedReport()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateDetailedReport();

// generateDetailedReportの実用的な使用例
const result = instance.generateDetailedReport(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### applyConfig

**シグネチャ**:
```javascript
 applyConfig(config)
```

**パラメーター**:
- `config`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.applyConfig(config);

// applyConfigの実用的な使用例
const result = instance.applyConfig(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.colorContrast)
```

**パラメーター**:
- `config.colorContrast`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.colorContrast);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (config.colorContrast.realTimeAnalysis !== undefined)
```

**パラメーター**:
- `config.colorContrast.realTimeAnalysis !== undefined`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(config.colorContrast.realTimeAnalysis !== undefined);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### setEnabled

**シグネチャ**:
```javascript
 setEnabled(enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.setEnabled(enabled);

// setEnabledの実用的な使用例
const result = instance.setEnabled(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (enabled)
```

**パラメーター**:
- `enabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(enabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### destroy

**シグネチャ**:
```javascript
 destroy()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.destroy();

// リソースのクリーンアップ
instance.destroy();
console.log('Resources cleaned up');
```

#### if

監視の停止

**シグネチャ**:
```javascript
 if (this.monitoring.mutationObserver)
```

**パラメーター**:
- `this.monitoring.mutationObserver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitoring.mutationObserver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.monitoring.resizeObserver)
```

**パラメーター**:
- `this.monitoring.resizeObserver`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitoring.resizeObserver);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (this.monitoring.analysisTimeout)
```

**パラメーター**:
- `this.monitoring.analysisTimeout`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.monitoring.analysisTimeout);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `startTime` | 説明なし |
| `textElements` | 説明なし |
| `analysis` | 説明なし |
| `endTime` | 説明なし |
| `analysisTime` | 説明なし |
| `styles` | 説明なし |
| `textContent` | 説明なし |
| `foregroundColor` | 説明なし |
| `backgroundColor` | 説明なし |
| `contrastRatio` | 説明なし |
| `fontSize` | 説明なし |
| `fontWeight` | 説明なし |
| `isLargeText` | 説明なし |
| `wcagRequirement` | 説明なし |
| `passed` | 説明なし |
| `warnings` | 説明なし |
| `colorBlindnessIssues` | 説明なし |
| `analysis` | 説明なし |
| `cacheKey` | 説明なし |
| `allElements` | 説明なし |
| `textElements` | 説明なし |
| `textContent` | 説明なし |
| `hasChildren` | 説明なし |
| `hasDirectTextNode` | 説明なし |
| `styles` | 説明なし |
| `cached` | 説明なし |
| `rgbaMatch` | 説明なし |
| `hexMatch` | 説明なし |
| `hex` | 説明なし |
| `hslMatch` | 説明なし |
| `h` | 説明なし |
| `s` | 説明なし |
| `l` | 説明なし |
| `a` | 説明なし |
| `styles` | 説明なし |
| `bgColor` | 説明なし |
| `alpha` | 説明なし |
| `invAlpha` | 説明なし |
| `l1` | 説明なし |
| `l2` | 説明なし |
| `lighter` | 説明なし |
| `darker` | 説明なし |
| `rsRGB` | 説明なし |
| `gsRGB` | 説明なし |
| `bsRGB` | 説明なし |
| `rLinear` | 説明なし |
| `gLinear` | 説明なし |
| `bLinear` | 説明なし |
| `hue2rgb` | 説明なし |
| `q` | 説明なし |
| `p` | 説明なし |
| `namedColors` | 説明なし |
| `weights` | 説明なし |
| `standard` | 説明なし |
| `simulatedForeground` | 説明なし |
| `simulatedBackground` | 説明なし |
| `simulatedContrast` | 説明なし |
| `rNorm` | 説明なし |
| `gNorm` | 説明なし |
| `bNorm` | 説明なし |
| `newR` | 説明なし |
| `newG` | 説明なし |
| `newB` | 説明なし |
| `issues` | 説明なし |
| `colorDependentWords` | 説明なし |
| `hasColorDependentInfo` | 説明なし |
| `foregroundHue` | 説明なし |
| `backgroundHue` | 説明なし |
| `hueDifference` | 説明なし |
| `max` | 説明なし |
| `min` | 説明なし |
| `d` | 説明なし |
| `contrasts` | 説明なし |
| `colorPairs` | 説明なし |
| `pairKey` | 説明なし |
| `count` | 説明なし |
| `recommendations` | 説明なし |
| `recentlyModified` | 説明なし |
| `analysis` | 説明なし |
| `saved` | 説明なし |
| `data` | 説明なし |
| `dataToSave` | 説明なし |
| `report` | 説明なし |

---

