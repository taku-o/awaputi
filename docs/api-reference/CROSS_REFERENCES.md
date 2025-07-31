# Cross References

このドキュメントは、APIの相互関係と依存性を示します。

## 継承関係

### ResponsiveCanvasManager

**継承クラス**:
- [AdvancedResponsiveLayoutManager](AdvancedResponsiveLayoutManager.md#advancedresponsivelayoutmanager) (core/AdvancedResponsiveLayoutManager.js)

### BaseDialog

**継承クラス**:
- [TutorialOverlay](TutorialOverlay.md#tutorialoverlay) (core/help/TutorialOverlay.js)
- [ExportDialog](ExportDialog.md#exportdialog) (scenes/components/ExportDialog.js)
- [ImportDialog](ImportDialog.md#importdialog) (scenes/components/ImportDialog.js)
- [UsernameDialog](UsernameDialog.md#usernamedialog) (scenes/components/UsernameDialog.js)

### LocalizationManager

**継承クラス**:
- [EnhancedLocalizationManager](EnhancedLocalizationManager.md#enhancedlocalizationmanager) (core/i18n/EnhancedLocalizationManager.js)

### EffectDebugInterface

**継承クラス**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)

### ErrorHandler

**継承クラス**:
- [ErrorReporter](ErrorReporter.md#errorreporter) (debug/ErrorReporter.js)

### EffectManager

**継承クラス**:
- [EnhancedEffectManager](EnhancedEffectManager.md#enhancedeffectmanager) (effects/EnhancedEffectManager.js)

### ParticleManager

**継承クラス**:
- [EnhancedParticleManager](EnhancedParticleManager.md#enhancedparticlemanager) (effects/EnhancedParticleManager.js)

### InputManager

**継承クラス**:
- [GameInputManager](GameInputManager.md#gameinputmanager) (scenes/GameInputManager.js)

### Scene

**継承クラス**:
- [GameScene](GameScene.md#gamescene) (scenes/GameScene.js)
- [HelpScene](HelpScene.md#helpscene) (scenes/HelpScene.js)
- [MainMenuScene](MainMenuScene.md#mainmenuscene) (scenes/MainMenuScene.js)
- [ShopScene](ShopScene.md#shopscene) (scenes/ShopScene.js)
- [StageSelectScene](StageSelectScene.md#stageselectscene) (scenes/StageSelectScene.js)
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)

### TabComponent

**継承クラス**:
- [AchievementsTab](AchievementsTab.md#achievementstab) (scenes/components/AchievementsTab.js)
- [HelpTab](HelpTab.md#helptab) (scenes/components/HelpTab.js)
- [ManagementTab](ManagementTab.md#managementtab) (scenes/components/ManagementTab.js)
- [StatisticsTab](StatisticsTab.md#statisticstab) (scenes/components/StatisticsTab.js)

### ObjectPool

**継承クラス**:
- [ParticlePool](ObjectPool.md#particlepool) (utils/ObjectPool.js)
- [BubblePool](ObjectPool.md#bubblepool) (utils/ObjectPool.js)
- [FloatingTextPool](ObjectPool.md#floatingtextpool) (utils/ObjectPool.js)

## モジュール依存関係

### ../../../utils/ErrorHandler.js

**使用箇所**:
- [AdvancedFormatterEngine](AdvancedFormatterEngine.md#advancedformatterengine) (core/i18n/advanced/AdvancedFormatterEngine.js)
  - インポート項目: getErrorHandler
- [TranslationFileGenerator](TranslationFileGenerator.md#translationfilegenerator) (core/i18n/automation/TranslationFileGenerator.js)
  - インポート項目: getErrorHandler
- [TranslationImportExport](TranslationImportExport.md#translationimportexport) (core/i18n/automation/TranslationImportExport.js)
  - インポート項目: getErrorHandler
- [CulturalAdaptationSystem](CulturalAdaptationSystem.md#culturaladaptationsystem) (core/i18n/cultural/CulturalAdaptationSystem.js)
  - インポート項目: getErrorHandler
- [ProgressTracker](ProgressTracker.md#progresstracker) (core/i18n/management/ProgressTracker.js)
  - インポート項目: getErrorHandler
- [TranslationKeyManager](TranslationKeyManager.md#translationkeymanager) (core/i18n/management/TranslationKeyManager.js)
  - インポート項目: getErrorHandler
- [ValidationCommands](ValidationCommands.md#validationcommands) (core/i18n/management/ValidationCommands.js)
  - インポート項目: getErrorHandler
- [QualityChecker](QualityChecker.md#qualitychecker) (core/i18n/quality/QualityChecker.js)
  - インポート項目: getErrorHandler
- [QualityReporter](QualityReporter.md#qualityreporter) (core/i18n/quality/QualityReporter.js)
  - インポート項目: getErrorHandler
- [RTLLanguageDetector](RTLLanguageDetector.md#rtllanguagedetector) (core/i18n/rtl/RTLLanguageDetector.js)
  - インポート項目: getErrorHandler
- [RTLLayoutManager](RTLLayoutManager.md#rtllayoutmanager) (core/i18n/rtl/RTLLayoutManager.js)
  - インポート項目: getErrorHandler
- [RTLUIComponents](RTLUIComponents.md#rtluicomponents) (core/i18n/rtl/RTLUIComponents.js)
  - インポート項目: getErrorHandler
- [SystemIntegrationTester](SystemIntegrationTester.md#systemintegrationtester) (core/i18n/testing/SystemIntegrationTester.js)
  - インポート項目: getErrorHandler

### ../../scenes/components/BaseDialog.js

**使用箇所**:
- [TutorialOverlay](TutorialOverlay.md#tutorialoverlay) (core/help/TutorialOverlay.js)
  - インポート項目: BaseDialog

### ../../src/bubbles/Bubble.js

**使用箇所**:
- [TestConfigurationGenerator](TestConfigurationGenerator.md#testconfigurationgenerator) (utils/TestConfigurationGenerator.js)
  - インポート項目: Bubble

### ../../src/managers/BubbleManager.js

**使用箇所**:
- [TestConfigurationGenerator](TestConfigurationGenerator.md#testconfigurationgenerator) (utils/TestConfigurationGenerator.js)
  - インポート項目: BubbleManager

### ../../utils/ErrorHandler.js

**使用箇所**:
- [ContentLoader](ContentLoader.md#contentloader) (core/help/ContentLoader.js)
  - インポート項目: ErrorHandler
- [ContextManager](ContextManager.md#contextmanager) (core/help/ContextManager.js)
  - インポート項目: ErrorHandler
- [FAQSystem](FAQSystem.md#faqsystem) (core/help/FAQSystem.js)
  - インポート項目: ErrorHandler
- [HelpErrorHandler](HelpErrorHandler.md#helperrorhandler) (core/help/HelpErrorHandler.js)
  - インポート項目: ErrorHandler
- [HelpManager](HelpManager.md#helpmanager) (core/help/HelpManager.js)
  - インポート項目: ErrorHandler
- [MultilingualContentManager](MultilingualContentManager.md#multilingualcontentmanager) (core/help/MultilingualContentManager.js)
  - インポート項目: ErrorHandler
- [SearchEngine](SearchEngine.md#searchengine) (core/help/SearchEngine.js)
  - インポート項目: ErrorHandler
- [TooltipSystem](TooltipSystem.md#tooltipsystem) (core/help/TooltipSystem.js)
  - インポート項目: ErrorHandler
- [TutorialActions](TutorialActions.md#tutorialactions) (core/help/TutorialActions.js)
  - インポート項目: ErrorHandler
- [TutorialManager](TutorialManager.md#tutorialmanager) (core/help/TutorialManager.js)
  - インポート項目: ErrorHandler
- [TutorialOverlay](TutorialOverlay.md#tutorialoverlay) (core/help/TutorialOverlay.js)
  - インポート項目: ErrorHandler
- [AnimationOptimizer](AnimationOptimizer.md#animationoptimizer) (core/i18n/AnimationOptimizer.js)
  - インポート項目: getErrorHandler
- [EnhancedLocalizationManager](EnhancedLocalizationManager.md#enhancedlocalizationmanager) (core/i18n/EnhancedLocalizationManager.js)
  - インポート項目: getErrorHandler
- [FontManager](FontManager.md#fontmanager) (core/i18n/FontManager.js)
  - インポート項目: getErrorHandler
- [FormatterEngine](FormatterEngine.md#formatterengine) (core/i18n/FormatterEngine.js)
  - インポート項目: getErrorHandler
- [NumberFormatter](FormatterEngine.md#numberformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getErrorHandler
- [DateFormatter](FormatterEngine.md#dateformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getErrorHandler
- [CurrencyFormatter](FormatterEngine.md#currencyformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getErrorHandler
- [RelativeTimeFormatter](FormatterEngine.md#relativetimeformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getErrorHandler
- [ListFormatter](FormatterEngine.md#listformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getErrorHandler
- [PluralFormatter](FormatterEngine.md#pluralformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getErrorHandler
- [I18nPerformanceMonitor](I18nPerformanceMonitor.md#i18nperformancemonitor) (core/i18n/I18nPerformanceMonitor.js)
  - インポート項目: getErrorHandler
- [I18nRenderOptimizer](I18nRenderOptimizer.md#i18nrenderoptimizer) (core/i18n/I18nRenderOptimizer.js)
  - インポート項目: getErrorHandler
- [I18nSecurityManager](I18nSecurityManager.md#i18nsecuritymanager) (core/i18n/I18nSecurityManager.js)
  - インポート項目: getErrorHandler
- [I18nSecurityTester](I18nSecurityTester.md#i18nsecuritytester) (core/i18n/I18nSecurityTester.js)
  - インポート項目: getErrorHandler
- [KoreanInputHandler](KoreanInputHandler.md#koreaninputhandler) (core/i18n/KoreanInputHandler.js)
  - インポート項目: getErrorHandler
- [LanguageDetector](LanguageDetector.md#languagedetector) (core/i18n/LanguageDetector.js)
  - インポート項目: getErrorHandler
- [LazyTranslationLoader](LazyTranslationLoader.md#lazytranslationloader) (core/i18n/LazyTranslationLoader.js)
  - インポート項目: getErrorHandler
- [OptimizedTranslationLoader](OptimizedTranslationLoader.md#optimizedtranslationloader) (core/i18n/OptimizedTranslationLoader.js)
  - インポート項目: getErrorHandler
- [RegionalSettingsManager](RegionalSettingsManager.md#regionalsettingsmanager) (core/i18n/RegionalSettingsManager.js)
  - インポート項目: getErrorHandler
- [RenderingOptimizer](RenderingOptimizer.md#renderingoptimizer) (core/i18n/RenderingOptimizer.js)
  - インポート項目: getErrorHandler
- [TranslationCache](TranslationCache.md#translationcache) (core/i18n/TranslationCache.js)
  - インポート項目: getErrorHandler
- [TranslationLoader](TranslationLoader.md#translationloader) (core/i18n/TranslationLoader.js)
  - インポート項目: getErrorHandler
- [UIUpdateOptimizer](UIUpdateOptimizer.md#uiupdateoptimizer) (core/i18n/UIUpdateOptimizer.js)
  - インポート項目: getErrorHandler
- [AccessibilityEffectIntegrator](AccessibilityEffectIntegrator.md#accessibilityeffectintegrator) (effects/accessibility/AccessibilityEffectIntegrator.js)
  - インポート項目: getErrorHandler
- [AccessibilitySettingsIntegrator](AccessibilitySettingsIntegrator.md#accessibilitysettingsintegrator) (effects/accessibility/AccessibilitySettingsIntegrator.js)
  - インポート項目: getErrorHandler
- [AlternativeFeedbackManager](AlternativeFeedbackManager.md#alternativefeedbackmanager) (effects/accessibility/AlternativeFeedbackManager.js)
  - インポート項目: getErrorHandler
- [VisualEffectAccessibilityManager](VisualEffectAccessibilityManager.md#visualeffectaccessibilitymanager) (effects/accessibility/VisualEffectAccessibilityManager.js)
  - インポート項目: getErrorHandler
- [MobileEffectIntegrator](MobileEffectIntegrator.md#mobileeffectintegrator) (effects/mobile/MobileEffectIntegrator.js)
  - インポート項目: getErrorHandler
- [MobileEffectOptimizer](MobileEffectOptimizer.md#mobileeffectoptimizer) (effects/mobile/MobileEffectOptimizer.js)
  - インポート項目: getErrorHandler
- [MobileResourceManager](MobileResourceManager.md#mobileresourcemanager) (effects/mobile/MobileResourceManager.js)
  - インポート項目: getErrorHandler
- [BubbleEffectRenderer](BubbleEffectRenderer.md#bubbleeffectrenderer) (effects/renderers/BubbleEffectRenderer.js)
  - インポート項目: getErrorHandler
- [ComboEffectRenderer](ComboEffectRenderer.md#comboeffectrenderer) (effects/renderers/ComboEffectRenderer.js)
  - インポート項目: getErrorHandler
- [SeasonalEffectRenderer](SeasonalEffectRenderer.md#seasonaleffectrenderer) (effects/renderers/SeasonalEffectRenderer.js)
  - インポート項目: getErrorHandler
- [SpecialEffectRenderer](SpecialEffectRenderer.md#specialeffectrenderer) (effects/renderers/SpecialEffectRenderer.js)
  - インポート項目: getErrorHandler
- [MobileTestSuite](MobileTestSuite.md#mobiletestsuite) (tests/mobile/MobileTestSuite.js)
  - インポート項目: ErrorHandler
- [TouchTestSuite](MobileTestSuite.md#touchtestsuite) (tests/mobile/MobileTestSuite.js)
  - インポート項目: ErrorHandler
- [GestureTestSuite](MobileTestSuite.md#gesturetestsuite) (tests/mobile/MobileTestSuite.js)
  - インポート項目: ErrorHandler
- [ResponsiveTestSuite](MobileTestSuite.md#responsivetestsuite) (tests/mobile/MobileTestSuite.js)
  - インポート項目: ErrorHandler
- [PerformanceTestSuite](MobileTestSuite.md#performancetestsuite) (tests/mobile/MobileTestSuite.js)
  - インポート項目: ErrorHandler
- [PWATestSuite](MobileTestSuite.md#pwatestsuite) (tests/mobile/MobileTestSuite.js)
  - インポート項目: ErrorHandler
- [AccessibilityTestSuite](MobileTestSuite.md#accessibilitytestsuite) (tests/mobile/MobileTestSuite.js)
  - インポート項目: ErrorHandler
- [CompatibilityTestSuite](MobileTestSuite.md#compatibilitytestsuite) (tests/mobile/MobileTestSuite.js)
  - インポート項目: ErrorHandler

### ../advanced/AdvancedFormatterEngine.js

**使用箇所**:
- [SystemIntegrationTester](SystemIntegrationTester.md#systemintegrationtester) (core/i18n/testing/SystemIntegrationTester.js)
  - インポート項目: getAdvancedFormatterEngine

### ../AdvancedPerformanceMonitor.js

**使用箇所**:
- [PerformancePanel](PerformancePanel.md#performancepanel) (debug/panels/PerformancePanel.js)
  - インポート項目: AdvancedPerformanceMonitor

### ../audio/AudioManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: AudioManager

### ../bubbles/Bubble.js

**使用箇所**:
- [BubbleManager](BubbleManager.md#bubblemanager) (managers/BubbleManager.js)
  - インポート項目: Bubble

### ../CacheSystem.js

**使用箇所**:
- [ContentLoader](ContentLoader.md#contentloader) (core/help/ContentLoader.js)
  - インポート項目: CacheSystem
- [HelpManager](HelpManager.md#helpmanager) (core/help/HelpManager.js)
  - インポート項目: CacheSystem
- [TutorialManager](TutorialManager.md#tutorialmanager) (core/help/TutorialManager.js)
  - インポート項目: CacheSystem

### ../charts/PerformanceChart.js

**使用箇所**:
- [PerformancePanel](PerformancePanel.md#performancepanel) (debug/panels/PerformancePanel.js)
  - インポート項目: PerformanceChart

### ../config/AudioConfig.js

**使用箇所**:
- [AudioManager](AudioManager.md#audiomanager) (audio/AudioManager.js)
  - インポート項目: getAudioConfig

### ../config/EffectsConfig.js

**使用箇所**:
- [AnimationManager](AnimationManager.md#animationmanager) (effects/AnimationManager.js)
  - インポート項目: getEffectsConfig
- [EffectManager](EffectManager.md#effectmanager) (effects/EffectManager.js)
  - インポート項目: getEffectsConfig
- [EnhancedEffectManager](EnhancedEffectManager.md#enhancedeffectmanager) (effects/EnhancedEffectManager.js)
  - インポート項目: getEffectsConfig
- [ParticleManager](ParticleManager.md#particlemanager) (effects/ParticleManager.js)
  - インポート項目: getEffectsConfig

### ../config/GameConfig.js

**使用箇所**:
- [BalanceHelperCompatibility](GameBalanceCompatibility.md#balancehelpercompatibility) (core/GameBalanceCompatibility.js)
  - インポート項目: getGameConfig

### ../config/PerformanceConfig.js

**使用箇所**:
- [PerformanceOptimizer](PerformanceOptimizer.md#performanceoptimizer) (utils/PerformanceOptimizer.js)
  - インポート項目: getPerformanceConfig

### ../core/AchievementStatsUI.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: AchievementStatsUI

### ../core/ChartRenderer.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: ChartRenderer

### ../core/ConfigurationManager.js

**使用箇所**:
- [AudioAccessibilitySupport](AudioAccessibilitySupport.md#audioaccessibilitysupport) (audio/AudioAccessibilitySupport.js)
  - インポート項目: getConfigurationManager
- [CacheNode](AudioCacheManager.md#cachenode) (audio/AudioCacheManager.js)
  - インポート項目: getConfigurationManager
- [LRUCache](AudioCacheManager.md#lrucache) (audio/AudioCacheManager.js)
  - インポート項目: getConfigurationManager
- [AudioCacheManager](AudioCacheManager.md#audiocachemanager) (audio/AudioCacheManager.js)
  - インポート項目: getConfigurationManager
- [AudioController](AudioController.md#audiocontroller) (audio/AudioController.js)
  - インポート項目: getConfigurationManager
- [AudioDataOptimizer](AudioDataOptimizer.md#audiodataoptimizer) (audio/AudioDataOptimizer.js)
  - インポート項目: getConfigurationManager
- [AudioErrorHandler](AudioErrorHandler.md#audioerrorhandler) (audio/AudioErrorHandler.js)
  - インポート項目: getConfigurationManager
- [AudioManager](AudioManager.md#audiomanager) (audio/AudioManager.js)
  - インポート項目: getConfigurationManager
- [PerformanceMetrics](AudioPerformanceMonitor.md#performancemetrics) (audio/AudioPerformanceMonitor.js)
  - インポート項目: getConfigurationManager
- [AudioPerformanceMonitor](AudioPerformanceMonitor.md#audioperformancemonitor) (audio/AudioPerformanceMonitor.js)
  - インポート項目: getConfigurationManager
- [AudioVisualizer](AudioVisualizer.md#audiovisualizer) (audio/AudioVisualizer.js)
  - インポート項目: getConfigurationManager
- [BGMSystem](BGMSystem.md#bgmsystem) (audio/BGMSystem.js)
  - インポート項目: getConfigurationManager
- [EnvironmentalAudioManager](EnvironmentalAudioManager.md#environmentalaudiomanager) (audio/EnvironmentalAudioManager.js)
  - インポート項目: getConfigurationManager
- [Equalizer](Equalizer.md#equalizer) (audio/Equalizer.js)
  - インポート項目: getConfigurationManager
- [PresetManager](PresetManager.md#presetmanager) (audio/PresetManager.js)
  - インポート項目: getConfigurationManager
- [SoundEffectSystem](SoundEffectSystem.md#soundeffectsystem) (audio/SoundEffectSystem.js)
  - インポート項目: getConfigurationManager
- [Bubble](Bubble.md#bubble) (bubbles/Bubble.js)
  - インポート項目: getConfigurationManager
- [AudioConfig](AudioConfig.md#audioconfig) (config/AudioConfig.js)
  - インポート項目: getConfigurationManager
- [EffectsConfig](EffectsConfig.md#effectsconfig) (config/EffectsConfig.js)
  - インポート項目: getConfigurationManager
- [GameConfig](GameConfig.md#gameconfig) (config/GameConfig.js)
  - インポート項目: getConfigurationManager
- [PerformanceConfig](PerformanceConfig.md#performanceconfig) (config/PerformanceConfig.js)
  - インポート項目: getConfigurationManager
- [AudioVisualSynchronizer](AudioVisualSynchronizer.md#audiovisualsynchronizer) (effects/AudioVisualSynchronizer.js)
  - インポート項目: getConfigurationManager
- [EffectConfigurationIntegrator](EffectConfigurationIntegrator.md#effectconfigurationintegrator) (effects/EffectConfigurationIntegrator.js)
  - インポート項目: getConfigurationManager
- [EffectQualityController](EffectQualityController.md#effectqualitycontroller) (effects/EffectQualityController.js)
  - インポート項目: getConfigurationManager
- [SeasonalEffectManager](SeasonalEffectManager.md#seasonaleffectmanager) (effects/SeasonalEffectManager.js)
  - インポート項目: getConfigurationManager
- [AudioSettingsUI](AudioSettingsUI.md#audiosettingsui) (ui/AudioSettingsUI.js)
  - インポート項目: getConfigurationManager
- [AdaptiveQualityController](AdaptiveQualityController.md#adaptivequalitycontroller) (utils/AdaptiveQualityController.js)
  - インポート項目: getConfigurationManager
- [AdvancedRenderingOptimizer](AdvancedRenderingOptimizer.md#advancedrenderingoptimizer) (utils/AdvancedRenderingOptimizer.js)
  - インポート項目: getConfigurationManager
- [QuadTree](AdvancedRenderingOptimizer.md#quadtree) (utils/AdvancedRenderingOptimizer.js)
  - インポート項目: getConfigurationManager
- [BalanceGuidelinesManager](BalanceGuidelinesManager.md#balanceguidelinesmanager) (utils/BalanceGuidelinesManager.js)
  - インポート項目: getConfigurationManager
- [ConfigurationMigrationUtility](ConfigurationMigrationUtility.md#configurationmigrationutility) (utils/ConfigurationMigrationUtility.js)
  - インポート項目: getConfigurationManager
- [ConfigurationSynchronizer](ConfigurationSynchronizer.md#configurationsynchronizer) (utils/ConfigurationSynchronizer.js)
  - インポート項目: getConfigurationManager
- [MobilePerformanceOptimizer](MobilePerformanceOptimizer.md#mobileperformanceoptimizer) (utils/MobilePerformanceOptimizer.js)
  - インポート項目: getConfigurationManager
- [ParticlePerformanceOptimizer](ParticlePerformanceOptimizer.md#particleperformanceoptimizer) (utils/ParticlePerformanceOptimizer.js)
  - インポート項目: getConfigurationManager

### ../core/EnhancedTouchManager.js

**使用箇所**:
- [GameInputManager](GameInputManager.md#gameinputmanager) (scenes/GameInputManager.js)
  - インポート項目: EnhancedTouchManager

### ../core/InputManager.js

**使用箇所**:
- [GameInputManager](GameInputManager.md#gameinputmanager) (scenes/GameInputManager.js)
  - インポート項目: InputManager

### ../core/ItemSystem.js

**使用箇所**:
- [ShopScene](ShopScene.md#shopscene) (scenes/ShopScene.js)
  - インポート項目: ITEM_DEFINITIONS

### ../core/LocalizationManager.js

**使用箇所**:
- [AudioAccessibilitySupport](AudioAccessibilitySupport.md#audioaccessibilitysupport) (audio/AudioAccessibilitySupport.js)
  - インポート項目: getLocalizationManager
- [AudioErrorHandler](AudioErrorHandler.md#audioerrorhandler) (audio/AudioErrorHandler.js)
  - インポート項目: getLocalizationManager
- [AudioSettingsUI](AudioSettingsUI.md#audiosettingsui) (ui/AudioSettingsUI.js)
  - インポート項目: getLocalizationManager
- [AudioTestPanel](AudioTestPanel.md#audiotestpanel) (ui/AudioTestPanel.js)
  - インポート項目: getLocalizationManager

### ../core/LoggingSystem.js

**使用箇所**:
- [HelpScene](HelpScene.md#helpscene) (scenes/HelpScene.js)
  - インポート項目: LoggingSystem

### ../core/Scene.js

**使用箇所**:
- [GameScene](GameScene.md#gamescene) (scenes/GameScene.js)
  - インポート項目: Scene
- [HelpScene](HelpScene.md#helpscene) (scenes/HelpScene.js)
  - インポート項目: Scene
- [MainMenuScene](MainMenuScene.md#mainmenuscene) (scenes/MainMenuScene.js)
  - インポート項目: Scene
- [ShopScene](ShopScene.md#shopscene) (scenes/ShopScene.js)
  - インポート項目: Scene
- [StageSelectScene](StageSelectScene.md#stageselectscene) (scenes/StageSelectScene.js)
  - インポート項目: Scene
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: Scene

### ../core/StatisticsDashboard.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: StatisticsDashboard

### ../core/StatisticsExporter.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: StatisticsExporter

### ../core/StatisticsFilterManager.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: StatisticsFilterManager

### ../cultural/CulturalAdaptationSystem.js

**使用箇所**:
- [SystemIntegrationTester](SystemIntegrationTester.md#systemintegrationtester) (core/i18n/testing/SystemIntegrationTester.js)
  - インポート項目: getCulturalAdaptationSystem

### ../debug/EnhancedDebugInterface.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EnhancedDebugInterface

### ../effects/AnimationManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: AnimationManager

### ../effects/AudioVisualSynchronizer.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getAudioVisualSynchronizer

### ../effects/EffectConfigurationIntegrator.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getEffectConfigurationIntegrator

### ../effects/EffectDebugInterface.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EffectDebugInterface
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: EffectDebugInterface

### ../effects/EffectErrorHandler.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EffectErrorHandler

### ../effects/EffectManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EffectManager

### ../effects/EffectOptimizationAdvisor.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EffectOptimizationAdvisor

### ../effects/EffectPerformanceMonitor.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getEffectPerformanceMonitor

### ../effects/EffectPerformanceOptimizer.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EffectPerformanceOptimizer

### ../effects/EffectProfiler.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EffectProfiler

### ../effects/EffectQualityController.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getEffectQualityController

### ../effects/EnhancedEffectManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EnhancedEffectManager

### ../effects/EnhancedParticleManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EnhancedParticleManager

### ../effects/ParticleManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: ParticleManager

### ../effects/SeasonalEffectManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getSeasonalEffectManager

### ../effects/VisualPolishEnhancements.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: VisualPolishEnhancements

### ../FormatterEngine.js

**使用箇所**:
- [RegionalFormattingTest](RegionalFormattingTest.md#regionalformattingtest) (core/i18n/test/RegionalFormattingTest.js)
  - インポート項目: FormatterEngine

### ../LocalizationManager.js

**使用箇所**:
- [ContentLoader](ContentLoader.md#contentloader) (core/help/ContentLoader.js)
  - インポート項目: LocalizationManager
- [HelpManager](HelpManager.md#helpmanager) (core/help/HelpManager.js)
  - インポート項目: LocalizationManager
- [MultilingualContentManager](MultilingualContentManager.md#multilingualcontentmanager) (core/help/MultilingualContentManager.js)
  - インポート項目: LocalizationManager
- [EnhancedLocalizationManager](EnhancedLocalizationManager.md#enhancedlocalizationmanager) (core/i18n/EnhancedLocalizationManager.js)
  - インポート項目: LocalizationManager
- [SystemIntegrationTester](SystemIntegrationTester.md#systemintegrationtester) (core/i18n/testing/SystemIntegrationTester.js)
  - インポート項目: getEnhancedLocalizationManager

### ../LoggingSystem.js

**使用箇所**:
- [ContentLoader](ContentLoader.md#contentloader) (core/help/ContentLoader.js)
  - インポート項目: LoggingSystem
- [ContentValidation](ContentValidation.md#contentvalidation) (core/help/ContentValidation.js)
  - インポート項目: LoggingSystem
- [ContextManager](ContextManager.md#contextmanager) (core/help/ContextManager.js)
  - インポート項目: LoggingSystem
- [FAQSystem](FAQSystem.md#faqsystem) (core/help/FAQSystem.js)
  - インポート項目: LoggingSystem
- [HelpErrorHandler](HelpErrorHandler.md#helperrorhandler) (core/help/HelpErrorHandler.js)
  - インポート項目: LoggingSystem
- [HelpManager](HelpManager.md#helpmanager) (core/help/HelpManager.js)
  - インポート項目: LoggingSystem
- [MultilingualContentManager](MultilingualContentManager.md#multilingualcontentmanager) (core/help/MultilingualContentManager.js)
  - インポート項目: LoggingSystem
- [SearchEngine](SearchEngine.md#searchengine) (core/help/SearchEngine.js)
  - インポート項目: LoggingSystem
- [TooltipSystem](TooltipSystem.md#tooltipsystem) (core/help/TooltipSystem.js)
  - インポート項目: LoggingSystem
- [TutorialActions](TutorialActions.md#tutorialactions) (core/help/TutorialActions.js)
  - インポート項目: LoggingSystem
- [TutorialManager](TutorialManager.md#tutorialmanager) (core/help/TutorialManager.js)
  - インポート項目: LoggingSystem
- [TutorialOverlay](TutorialOverlay.md#tutorialoverlay) (core/help/TutorialOverlay.js)
  - インポート項目: LoggingSystem

### ../management/ProgressTracker.js

**使用箇所**:
- [TranslationFileGenerator](TranslationFileGenerator.md#translationfilegenerator) (core/i18n/automation/TranslationFileGenerator.js)
  - インポート項目: getProgressTracker
- [TranslationImportExport](TranslationImportExport.md#translationimportexport) (core/i18n/automation/TranslationImportExport.js)
  - インポート項目: getProgressTracker

### ../management/TranslationKeyManager.js

**使用箇所**:
- [TranslationFileGenerator](TranslationFileGenerator.md#translationfilegenerator) (core/i18n/automation/TranslationFileGenerator.js)
  - インポート項目: getTranslationKeyManager
- [TranslationImportExport](TranslationImportExport.md#translationimportexport) (core/i18n/automation/TranslationImportExport.js)
  - インポート項目: getTranslationKeyManager

### ../managers/BubbleManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: BubbleManager

### ../managers/ScoreManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: ScoreManager

### ../models/BalanceChange.js

**使用箇所**:
- [BalanceChangeDocumentationSystem](BalanceChangeDocumentationSystem.md#balancechangedocumentationsystem) (utils/BalanceChangeDocumentationSystem.js)
  - インポート項目: BalanceChange

### ../quality/QualityChecker.js

**使用箇所**:
- [ValidationCommands](ValidationCommands.md#validationcommands) (core/i18n/management/ValidationCommands.js)
  - インポート項目: getQualityChecker

### ../RegionalSettingsManager.js

**使用箇所**:
- [RegionalFormattingTest](RegionalFormattingTest.md#regionalformattingtest) (core/i18n/test/RegionalFormattingTest.js)
  - インポート項目: getRegionalSettingsManager

### ../rtl/RTLLanguageDetector.js

**使用箇所**:
- [SystemIntegrationTester](SystemIntegrationTester.md#systemintegrationtester) (core/i18n/testing/SystemIntegrationTester.js)
  - インポート項目: getRTLLanguageDetector

### ../scenes/GameScene.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: GameScene

### ../scenes/MainMenuScene.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: MainMenuScene

### ../scenes/ShopScene.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: ShopScene

### ../scenes/StageSelectScene.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: StageSelectScene

### ../scenes/UserInfoScene.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: UserInfoScene

### ../ui/AchievementHelpSystem.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: AchievementHelpSystem

### ../ui/FloatingTextManager.js

**使用箇所**:
- [GameScene](GameScene.md#gamescene) (scenes/GameScene.js)
  - インポート項目: FloatingTextManager

### ../utils/BrowserCompatibility.js

**使用箇所**:
- [AdvancedResponsiveLayoutManager](AdvancedResponsiveLayoutManager.md#advancedresponsivelayoutmanager) (core/AdvancedResponsiveLayoutManager.js)
  - インポート項目: getBrowserCompatibility
- [EnhancedTouchManager](EnhancedTouchManager.md#enhancedtouchmanager) (core/EnhancedTouchManager.js)
  - インポート項目: getBrowserCompatibility
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getBrowserCompatibility
- [InputManager](InputManager.md#inputmanager) (core/InputManager.js)
  - インポート項目: getBrowserCompatibility
- [PWAManager](PWAManager.md#pwamanager) (core/PWAManager.js)
  - インポート項目: getBrowserCompatibility
- [GameInputManager](GameInputManager.md#gameinputmanager) (scenes/GameInputManager.js)
  - インポート項目: getBrowserCompatibility

### ../utils/ErrorHandler.js

**使用箇所**:
- [AccessibilityDeploymentPreparation](AccessibilityDeploymentPreparation.md#accessibilitydeploymentpreparation) (accessibility/AccessibilityDeploymentPreparation.js)
  - インポート項目: getErrorHandler
- [AccessibilityErrorHandler](AccessibilityErrorHandler.md#accessibilityerrorhandler) (accessibility/AccessibilityErrorHandler.js)
  - インポート項目: getErrorHandler
- [AccessibilityIntegrationTester](AccessibilityIntegrationTester.md#accessibilityintegrationtester) (accessibility/AccessibilityIntegrationTester.js)
  - インポート項目: getErrorHandler
- [AccessibilityOnboarding](AccessibilityOnboarding.md#accessibilityonboarding) (accessibility/AccessibilityOnboarding.js)
  - インポート項目: getErrorHandler
- [AccessibilityProfileManager](AccessibilityProfileManager.md#accessibilityprofilemanager) (accessibility/AccessibilityProfileManager.js)
  - インポート項目: getErrorHandler
- [AccessibilitySettingsUI](AccessibilitySettingsUI.md#accessibilitysettingsui) (accessibility/AccessibilitySettingsUI.js)
  - インポート項目: getErrorHandler
- [AccessibilityUserTesting](AccessibilityUserTesting.md#accessibilityusertesting) (accessibility/AccessibilityUserTesting.js)
  - インポート項目: getErrorHandler
- [ColorContrastAnalyzer](ColorContrastAnalyzer.md#colorcontrastanalyzer) (accessibility/ColorContrastAnalyzer.js)
  - インポート項目: getErrorHandler
- [KeyboardNavigationTester](KeyboardNavigationTester.md#keyboardnavigationtester) (accessibility/KeyboardNavigationTester.js)
  - インポート項目: getErrorHandler
- [LanguageSpecificAccessibility](LanguageSpecificAccessibility.md#languagespecificaccessibility) (accessibility/LanguageSpecificAccessibility.js)
  - インポート項目: getErrorHandler
- [ScreenReaderSimulator](ScreenReaderSimulator.md#screenreadersimulator) (accessibility/ScreenReaderSimulator.js)
  - インポート項目: getErrorHandler
- [WCAGValidator](WCAGValidator.md#wcagvalidator) (accessibility/WCAGValidator.js)
  - インポート項目: getErrorHandler
- [AudioAccessibilitySupport](AudioAccessibilitySupport.md#audioaccessibilitysupport) (audio/AudioAccessibilitySupport.js)
  - インポート項目: getErrorHandler
- [CacheNode](AudioCacheManager.md#cachenode) (audio/AudioCacheManager.js)
  - インポート項目: getErrorHandler
- [LRUCache](AudioCacheManager.md#lrucache) (audio/AudioCacheManager.js)
  - インポート項目: getErrorHandler
- [AudioCacheManager](AudioCacheManager.md#audiocachemanager) (audio/AudioCacheManager.js)
  - インポート項目: getErrorHandler
- [AudioController](AudioController.md#audiocontroller) (audio/AudioController.js)
  - インポート項目: getErrorHandler
- [AudioDataOptimizer](AudioDataOptimizer.md#audiodataoptimizer) (audio/AudioDataOptimizer.js)
  - インポート項目: getErrorHandler
- [AudioErrorHandler](AudioErrorHandler.md#audioerrorhandler) (audio/AudioErrorHandler.js)
  - インポート項目: getErrorHandler
- [AudioManager](AudioManager.md#audiomanager) (audio/AudioManager.js)
  - インポート項目: getErrorHandler
- [PerformanceMetrics](AudioPerformanceMonitor.md#performancemetrics) (audio/AudioPerformanceMonitor.js)
  - インポート項目: getErrorHandler
- [AudioPerformanceMonitor](AudioPerformanceMonitor.md#audioperformancemonitor) (audio/AudioPerformanceMonitor.js)
  - インポート項目: getErrorHandler
- [AudioVisualizer](AudioVisualizer.md#audiovisualizer) (audio/AudioVisualizer.js)
  - インポート項目: getErrorHandler
- [BGMGenerator](BGMGenerator.md#bgmgenerator) (audio/BGMGenerator.js)
  - インポート項目: getErrorHandler
- [BGMPlayer](BGMPlayer.md#bgmplayer) (audio/BGMPlayer.js)
  - インポート項目: getErrorHandler
- [BGMSystem](BGMSystem.md#bgmsystem) (audio/BGMSystem.js)
  - インポート項目: getErrorHandler
- [BGMTransitionManager](BGMTransitionManager.md#bgmtransitionmanager) (audio/BGMTransitionManager.js)
  - インポート項目: getErrorHandler
- [EnvironmentalAudioManager](EnvironmentalAudioManager.md#environmentalaudiomanager) (audio/EnvironmentalAudioManager.js)
  - インポート項目: getErrorHandler
- [Equalizer](Equalizer.md#equalizer) (audio/Equalizer.js)
  - インポート項目: getErrorHandler
- [PresetManager](PresetManager.md#presetmanager) (audio/PresetManager.js)
  - インポート項目: getErrorHandler
- [SoundEffectSystem](SoundEffectSystem.md#soundeffectsystem) (audio/SoundEffectSystem.js)
  - インポート項目: getErrorHandler
- [AudioConfig](AudioConfig.md#audioconfig) (config/AudioConfig.js)
  - インポート項目: getErrorHandler
- [EffectsConfig](EffectsConfig.md#effectsconfig) (config/EffectsConfig.js)
  - インポート項目: getErrorHandler
- [GameConfig](GameConfig.md#gameconfig) (config/GameConfig.js)
  - インポート項目: ErrorHandler
- [PerformanceConfig](PerformanceConfig.md#performanceconfig) (config/PerformanceConfig.js)
  - インポート項目: getErrorHandler
- [ARIAManager](ARIAManager.md#ariamanager) (core/ARIAManager.js)
  - インポート項目: getErrorHandler
- [AccessibilityManager](AccessibilityManager.md#accessibilitymanager) (core/AccessibilityManager.js)
  - インポート項目: getErrorHandler
- [AccessibilityConfiguration](AccessibilityManager.md#accessibilityconfiguration) (core/AccessibilityManager.js)
  - インポート項目: getErrorHandler
- [AccessibilityState](AccessibilityManager.md#accessibilitystate) (core/AccessibilityManager.js)
  - インポート項目: getErrorHandler
- [AdvancedGestureRecognitionSystem](AdvancedGestureRecognitionSystem.md#advancedgesturerecognitionsystem) (core/AdvancedGestureRecognitionSystem.js)
  - インポート項目: ErrorHandler
- [PathAnalyzer](AdvancedGestureRecognitionSystem.md#pathanalyzer) (core/AdvancedGestureRecognitionSystem.js)
  - インポート項目: ErrorHandler
- [PatternMatcher](AdvancedGestureRecognitionSystem.md#patternmatcher) (core/AdvancedGestureRecognitionSystem.js)
  - インポート項目: ErrorHandler
- [LearningEngine](AdvancedGestureRecognitionSystem.md#learningengine) (core/AdvancedGestureRecognitionSystem.js)
  - インポート項目: ErrorHandler
- [AdvancedResponsiveLayoutManager](AdvancedResponsiveLayoutManager.md#advancedresponsivelayoutmanager) (core/AdvancedResponsiveLayoutManager.js)
  - インポート項目: getErrorHandler
- [AlternativeInputManager](AlternativeInputManager.md#alternativeinputmanager) (core/AlternativeInputManager.js)
  - インポート項目: getErrorHandler
- [AsyncOperationQueue](AsyncOperationQueue.md#asyncoperationqueue) (core/AsyncOperationQueue.js)
  - インポート項目: getErrorHandler
- [BackupManager](BackupManager.md#backupmanager) (core/BackupManager.js)
  - インポート項目: getErrorHandler
- [CacheSystem](CacheSystem.md#cachesystem) (core/CacheSystem.js)
  - インポート項目: ErrorHandler
- [CaptionManager](CaptionManager.md#captionmanager) (core/CaptionManager.js)
  - インポート項目: getErrorHandler
- [ChunkProcessor](ChunkProcessor.md#chunkprocessor) (core/ChunkProcessor.js)
  - インポート項目: getErrorHandler
- [CloudStorageAdapter](CloudStorageAdapter.md#cloudstorageadapter) (core/CloudStorageAdapter.js)
  - インポート項目: getErrorHandler
- [ColorBlindnessSupport](ColorBlindnessSupport.md#colorblindnesssupport) (core/ColorBlindnessSupport.js)
  - インポート項目: getErrorHandler
- [ConfigurationErrorHandler](ConfigurationErrorHandler.md#configurationerrorhandler) (core/ConfigurationErrorHandler.js)
  - インポート項目: getErrorHandler
- [ConfigurationManager](ConfigurationManager.md#configurationmanager) (core/ConfigurationManager.js)
  - インポート項目: getErrorHandler
- [ContrastManager](ContrastManager.md#contrastmanager) (core/ContrastManager.js)
  - インポート項目: getErrorHandler
- [DataCache](DataCache.md#datacache) (core/DataCache.js)
  - インポート項目: getErrorHandler
- [DataManager](DataManager.md#datamanager) (core/DataManager.js)
  - インポート項目: getErrorHandler
- [DataStorage](DataStorage.md#datastorage) (core/DataStorage.js)
  - インポート項目: getErrorHandler
- [LocalStorageAdapter](DataStorage.md#localstorageadapter) (core/DataStorage.js)
  - インポート項目: getErrorHandler
- [IndexedDBAdapter](DataStorage.md#indexeddbadapter) (core/DataStorage.js)
  - インポート項目: getErrorHandler
- [DeviceSpecificHandler](DeviceSpecificHandler.md#devicespecifichandler) (core/DeviceSpecificHandler.js)
  - インポート項目: ErrorHandler
- [EnhancedTouchManager](EnhancedTouchManager.md#enhancedtouchmanager) (core/EnhancedTouchManager.js)
  - インポート項目: getErrorHandler
- [ExportManager](ExportManager.md#exportmanager) (core/ExportManager.js)
  - インポート項目: getErrorHandler
- [JSONExporter](ExportManager.md#jsonexporter) (core/ExportManager.js)
  - インポート項目: getErrorHandler
- [CompressedExporter](ExportManager.md#compressedexporter) (core/ExportManager.js)
  - インポート項目: getErrorHandler
- [EncryptedExporter](ExportManager.md#encryptedexporter) (core/ExportManager.js)
  - インポート項目: getErrorHandler
- [CSVExporter](ExportManager.md#csvexporter) (core/ExportManager.js)
  - インポート項目: getErrorHandler
- [TextExporter](ExportManager.md#textexporter) (core/ExportManager.js)
  - インポート項目: getErrorHandler
- [FocusManager](FocusManager.md#focusmanager) (core/FocusManager.js)
  - インポート項目: getErrorHandler
- [GameContentDescriber](GameContentDescriber.md#gamecontentdescriber) (core/GameContentDescriber.js)
  - インポート項目: getErrorHandler
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getErrorHandler
- [GestureCustomizer](GestureCustomizer.md#gesturecustomizer) (core/GestureCustomizer.js)
  - インポート項目: getErrorHandler
- [ImportManager](ImportManager.md#importmanager) (core/ImportManager.js)
  - インポート項目: getErrorHandler
- [FormatValidator](ImportManager.md#formatvalidator) (core/ImportManager.js)
  - インポート項目: getErrorHandler
- [VersionValidator](ImportManager.md#versionvalidator) (core/ImportManager.js)
  - インポート項目: getErrorHandler
- [IntegrityValidator](ImportManager.md#integrityvalidator) (core/ImportManager.js)
  - インポート項目: getErrorHandler
- [SizeValidator](ImportManager.md#sizevalidator) (core/ImportManager.js)
  - インポート項目: getErrorHandler
- [MergeResolver](ImportManager.md#mergeresolver) (core/ImportManager.js)
  - インポート項目: getErrorHandler
- [OverwriteResolver](ImportManager.md#overwriteresolver) (core/ImportManager.js)
  - インポート項目: getErrorHandler
- [KeepResolver](ImportManager.md#keepresolver) (core/ImportManager.js)
  - インポート項目: getErrorHandler
- [SelectiveResolver](ImportManager.md#selectiveresolver) (core/ImportManager.js)
  - インポート項目: getErrorHandler
- [KeyboardAccessibilityManager](KeyboardAccessibilityManager.md#keyboardaccessibilitymanager) (core/KeyboardAccessibilityManager.js)
  - インポート項目: getErrorHandler
- [KeyboardShortcutManager](KeyboardShortcutManager.md#keyboardshortcutmanager) (core/KeyboardShortcutManager.js)
  - インポート項目: getErrorHandler
- [LiveRegionManager](LiveRegionManager.md#liveregionmanager) (core/LiveRegionManager.js)
  - インポート項目: getErrorHandler
- [LocalizationManager](LocalizationManager.md#localizationmanager) (core/LocalizationManager.js)
  - インポート項目: getErrorHandler
- [LoggingSystem](LoggingSystem.md#loggingsystem) (core/LoggingSystem.js)
  - インポート項目: ErrorHandler
- [MobileAccessibilityManager](MobileAccessibilityManager.md#mobileaccessibilitymanager) (core/MobileAccessibilityManager.js)
  - インポート項目: ErrorHandler
- [MobileSystemIntegrator](MobileSystemIntegrator.md#mobilesystemintegrator) (core/MobileSystemIntegrator.js)
  - インポート項目: ErrorHandler
- [MobilePerformanceMonitor](MobileSystemIntegrator.md#mobileperformancemonitor) (core/MobileSystemIntegrator.js)
  - インポート項目: ErrorHandler
- [MobileErrorAnalyzer](MobileSystemIntegrator.md#mobileerroranalyzer) (core/MobileSystemIntegrator.js)
  - インポート項目: ErrorHandler
- [MobileUIUXManager](MobileUIUXManager.md#mobileuiuxmanager) (core/MobileUIUXManager.js)
  - インポート項目: ErrorHandler
- [VisualFeedbackManager](MobileUIUXManager.md#visualfeedbackmanager) (core/MobileUIUXManager.js)
  - インポート項目: ErrorHandler
- [AudioFeedbackManager](MobileUIUXManager.md#audiofeedbackmanager) (core/MobileUIUXManager.js)
  - インポート項目: ErrorHandler
- [MotionManager](MotionManager.md#motionmanager) (core/MotionManager.js)
  - インポート項目: getErrorHandler
- [OfflineManager](OfflineManager.md#offlinemanager) (core/OfflineManager.js)
  - インポート項目: getErrorHandler
- [PWAManager](PWAManager.md#pwamanager) (core/PWAManager.js)
  - インポート項目: getErrorHandler
- [PlayerData](PlayerData.md#playerdata) (core/PlayerData.js)
  - インポート項目: getErrorHandler
- [RecoveryManager](RecoveryManager.md#recoverymanager) (core/RecoveryManager.js)
  - インポート項目: getErrorHandler
- [AutoRecoveryStrategy](RecoveryManager.md#autorecoverystrategy) (core/RecoveryManager.js)
  - インポート項目: getErrorHandler
- [BackupRecoveryStrategy](RecoveryManager.md#backuprecoverystrategy) (core/RecoveryManager.js)
  - インポート項目: getErrorHandler
- [PartialRecoveryStrategy](RecoveryManager.md#partialrecoverystrategy) (core/RecoveryManager.js)
  - インポート項目: getErrorHandler
- [FactoryResetStrategy](RecoveryManager.md#factoryresetstrategy) (core/RecoveryManager.js)
  - インポート項目: getErrorHandler
- [ManualRecoveryStrategy](RecoveryManager.md#manualrecoverystrategy) (core/RecoveryManager.js)
  - インポート項目: getErrorHandler
- [SecurityManager](SecurityManager.md#securitymanager) (core/SecurityManager.js)
  - インポート項目: getErrorHandler
- [KeyManager](SecurityManager.md#keymanager) (core/SecurityManager.js)
  - インポート項目: getErrorHandler
- [IntegrityChecker](SecurityManager.md#integritychecker) (core/SecurityManager.js)
  - インポート項目: getErrorHandler
- [PrivacyManager](SecurityManager.md#privacymanager) (core/SecurityManager.js)
  - インポート項目: getErrorHandler
- [SettingsManager](SettingsManager.md#settingsmanager) (core/SettingsManager.js)
  - インポート項目: getErrorHandler
- [SettingsNotificationSystem](SettingsNotificationSystem.md#settingsnotificationsystem) (core/SettingsNotificationSystem.js)
  - インポート項目: getErrorHandler
- [SpeechSynthesisManager](SpeechSynthesisManager.md#speechsynthesismanager) (core/SpeechSynthesisManager.js)
  - インポート項目: getErrorHandler
- [SyncManager](SyncManager.md#syncmanager) (core/SyncManager.js)
  - インポート項目: getErrorHandler
- [TextScalingManager](TextScalingManager.md#textscalingmanager) (core/TextScalingManager.js)
  - インポート項目: getErrorHandler
- [ValidationManager](ValidationManager.md#validationmanager) (core/ValidationManager.js)
  - インポート項目: getErrorHandler
- [ValidationSystem](ValidationSystem.md#validationsystem) (core/ValidationSystem.js)
  - インポート項目: ErrorHandler
- [VibrationManager](VibrationManager.md#vibrationmanager) (core/VibrationManager.js)
  - インポート項目: getErrorHandler
- [VisualFeedbackManager](VisualFeedbackManager.md#visualfeedbackmanager) (core/VisualFeedbackManager.js)
  - インポート項目: getErrorHandler
- [VisualFocusManager](VisualFocusManager.md#visualfocusmanager) (core/VisualFocusManager.js)
  - インポート項目: getErrorHandler
- [ErrorReporter](ErrorReporter.md#errorreporter) (debug/ErrorReporter.js)
  - インポート項目: ErrorHandler
- [ErrorCollector](ErrorReporter.md#errorcollector) (debug/ErrorReporter.js)
  - インポート項目: ErrorHandler
- [ErrorAnalyzer](ErrorReporter.md#erroranalyzer) (debug/ErrorReporter.js)
  - インポート項目: ErrorHandler
- [ErrorStorage](ErrorReporter.md#errorstorage) (debug/ErrorReporter.js)
  - インポート項目: ErrorHandler
- [AnimationManager](AnimationManager.md#animationmanager) (effects/AnimationManager.js)
  - インポート項目: getErrorHandler
- [AudioVisualSynchronizer](AudioVisualSynchronizer.md#audiovisualsynchronizer) (effects/AudioVisualSynchronizer.js)
  - インポート項目: getErrorHandler
- [EffectConfigurationIntegrator](EffectConfigurationIntegrator.md#effectconfigurationintegrator) (effects/EffectConfigurationIntegrator.js)
  - インポート項目: getErrorHandler
- [EffectErrorHandler](EffectErrorHandler.md#effecterrorhandler) (effects/EffectErrorHandler.js)
  - インポート項目: getErrorHandler
- [EffectManager](EffectManager.md#effectmanager) (effects/EffectManager.js)
  - インポート項目: getErrorHandler
- [EffectPerformanceMonitor](EffectPerformanceMonitor.md#effectperformancemonitor) (effects/EffectPerformanceMonitor.js)
  - インポート項目: getErrorHandler
- [EffectQualityController](EffectQualityController.md#effectqualitycontroller) (effects/EffectQualityController.js)
  - インポート項目: getErrorHandler
- [EnhancedEffectManager](EnhancedEffectManager.md#enhancedeffectmanager) (effects/EnhancedEffectManager.js)
  - インポート項目: getErrorHandler
- [EnhancedParticleManager](EnhancedParticleManager.md#enhancedparticlemanager) (effects/EnhancedParticleManager.js)
  - インポート項目: getErrorHandler
- [ParticleManager](ParticleManager.md#particlemanager) (effects/ParticleManager.js)
  - インポート項目: getErrorHandler
- [QualityScalingSystem](QualityScalingSystem.md#qualityscalingsystem) (effects/QualityScalingSystem.js)
  - インポート項目: getErrorHandler
- [SeasonalEffectManager](SeasonalEffectManager.md#seasonaleffectmanager) (effects/SeasonalEffectManager.js)
  - インポート項目: getErrorHandler
- [BubbleManager](BubbleManager.md#bubblemanager) (managers/BubbleManager.js)
  - インポート項目: getErrorHandler
- [BalanceChange](BalanceChange.md#balancechange) (models/BalanceChange.js)
  - インポート項目: getErrorHandler
- [HelpScene](HelpScene.md#helpscene) (scenes/HelpScene.js)
  - インポート項目: ErrorHandler
- [AudioSettingsUI](AudioSettingsUI.md#audiosettingsui) (ui/AudioSettingsUI.js)
  - インポート項目: getErrorHandler
- [AudioTestPanel](AudioTestPanel.md#audiotestpanel) (ui/AudioTestPanel.js)
  - インポート項目: getErrorHandler
- [DataManagementUI](DataManagementUI.md#datamanagementui) (ui/DataManagementUI.js)
  - インポート項目: getErrorHandler

### ../utils/MemoryManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getMemoryManager

### ../utils/ObjectPool.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getPoolManager

### ../utils/PerformanceOptimizer.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getPerformanceOptimizer
- [BubbleManager](BubbleManager.md#bubblemanager) (managers/BubbleManager.js)
  - インポート項目: getPerformanceOptimizer

### ../utils/RenderOptimizer.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: RenderOptimizer, PerformanceMonitor

### ../utils/ResponsiveCanvasManager.js

**使用箇所**:
- [AdvancedResponsiveLayoutManager](AdvancedResponsiveLayoutManager.md#advancedresponsivelayoutmanager) (core/AdvancedResponsiveLayoutManager.js)
  - インポート項目: ResponsiveCanvasManager
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: ResponsiveCanvasManager

### ./accessibility/AccessibilityEffectIntegrator.js

**使用箇所**:
- [EnhancedEffectManager](EnhancedEffectManager.md#enhancedeffectmanager) (effects/EnhancedEffectManager.js)
  - インポート項目: AccessibilityEffectIntegrator

### ./AccessibilityManager.js

**使用箇所**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: AccessibilityManager

### ./AchievementEventIntegrator.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: AchievementEventIntegrator

### ./AchievementManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: AchievementManager

### ./AchievementNotificationSystem.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: AchievementNotificationSystem

### ./AchievementProgressEngine.js

**使用箇所**:
- [AchievementManager](AchievementManager.md#achievementmanager) (core/AchievementManager.js)
  - インポート項目: AchievementProgressEngine

### ./AlternativeFeedbackManager.js

**使用箇所**:
- [AccessibilityEffectIntegrator](AccessibilityEffectIntegrator.md#accessibilityeffectintegrator) (effects/accessibility/AccessibilityEffectIntegrator.js)
  - インポート項目: AlternativeFeedbackManager

### ./AsyncOperationQueue.js

**使用箇所**:
- [DataManager](DataManager.md#datamanager) (core/DataManager.js)
  - インポート項目: getAsyncOperationQueue

### ./AudioAccessibilitySupport.js

**使用箇所**:
- [AudioManager](AudioManager.md#audiomanager) (audio/AudioManager.js)
  - インポート項目: AudioAccessibilitySupport

### ./AudioController.js

**使用箇所**:
- [AudioManager](AudioManager.md#audiomanager) (audio/AudioManager.js)
  - インポート項目: AudioController

### ./AudioTestPanel.js

**使用箇所**:
- [AudioSettingsUI](AudioSettingsUI.md#audiosettingsui) (ui/AudioSettingsUI.js)
  - インポート項目: AudioTestPanel

### ./AudioVisualizer.js

**使用箇所**:
- [AudioManager](AudioManager.md#audiomanager) (audio/AudioManager.js)
  - インポート項目: AudioVisualizer

### ./AutocompleteEngine.js

**使用箇所**:
- [DeveloperConsole](DeveloperConsole.md#developerconsole) (debug/DeveloperConsole.js)
  - インポート項目: AutocompleteEngine

### ./BalanceConfigurationValidator.js

**使用箇所**:
- [BalanceGuidelinesManager](BalanceGuidelinesManager.md#balanceguidelinesmanager) (utils/BalanceGuidelinesManager.js)
  - インポート項目: getBalanceConfigurationValidator

### ./BaseDialog.js

**使用箇所**:
- [ExportDialog](ExportDialog.md#exportdialog) (scenes/components/ExportDialog.js)
  - インポート項目: BaseDialog
- [ImportDialog](ImportDialog.md#importdialog) (scenes/components/ImportDialog.js)
  - インポート項目: BaseDialog
- [UsernameDialog](UsernameDialog.md#usernamedialog) (scenes/components/UsernameDialog.js)
  - インポート項目: BaseDialog

### ./BGMGenerator.js

**使用箇所**:
- [BGMSystem](BGMSystem.md#bgmsystem) (audio/BGMSystem.js)
  - インポート項目: BGMGenerator

### ./BGMPlayer.js

**使用箇所**:
- [BGMSystem](BGMSystem.md#bgmsystem) (audio/BGMSystem.js)
  - インポート項目: BGMPlayer

### ./BGMSystem.js

**使用箇所**:
- [AudioManager](AudioManager.md#audiomanager) (audio/AudioManager.js)
  - インポート項目: BGMSystem

### ./BGMTransitionManager.js

**使用箇所**:
- [BGMSystem](BGMSystem.md#bgmsystem) (audio/BGMSystem.js)
  - インポート項目: BGMTransitionManager

### ./BrowserCompatibility.js

**使用箇所**:
- [ResponsiveCanvasManager](ResponsiveCanvasManager.md#responsivecanvasmanager) (utils/ResponsiveCanvasManager.js)
  - インポート項目: getBrowserCompatibility

### ./CacheSystem.js

**使用箇所**:
- [ConfigurationManager](ConfigurationManager.md#configurationmanager) (core/ConfigurationManager.js)
  - インポート項目: getCacheSystem

### ./CalculationEngine.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getCalculationEngine

### ./ChunkProcessor.js

**使用箇所**:
- [DataManager](DataManager.md#datamanager) (core/DataManager.js)
  - インポート項目: getChunkProcessor

### ./components/AchievementsTab.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: AchievementsTab

### ./components/ComponentEventBus.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: ComponentEventBus

### ./components/DialogManager.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: DialogManager

### ./components/ExportDialog.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: ExportDialog

### ./components/HelpSectionSelector.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: HelpSectionSelector

### ./components/HelpTab.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: HelpTab

### ./components/ImportDialog.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: ImportDialog

### ./components/ManagementTab.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: ManagementTab

### ./components/SceneState.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: SceneState

### ./components/StatisticsTab.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: StatisticsTab

### ./components/UsernameDialog.js

**使用箇所**:
- [UserInfoScene](UserInfoScene.md#userinfoscene) (scenes/UserInfoScene.js)
  - インポート項目: UsernameDialog

### ./ConfigurationCommands.js

**使用箇所**:
- [DeveloperConsole](DeveloperConsole.md#developerconsole) (debug/DeveloperConsole.js)
  - インポート項目: ConfigurationCommands

### ./ConfigurationManager.js

**使用箇所**:
- [AdvancedResponsiveLayoutManager](AdvancedResponsiveLayoutManager.md#advancedresponsivelayoutmanager) (core/AdvancedResponsiveLayoutManager.js)
  - インポート項目: getConfigurationManager
- [EnhancedTouchManager](EnhancedTouchManager.md#enhancedtouchmanager) (core/EnhancedTouchManager.js)
  - インポート項目: getConfigurationManager
- [BalanceHelperCompatibility](GameBalanceCompatibility.md#balancehelpercompatibility) (core/GameBalanceCompatibility.js)
  - インポート項目: getConfigurationManager
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: getConfigurationManager
- [PWAManager](PWAManager.md#pwamanager) (core/PWAManager.js)
  - インポート項目: getConfigurationManager
- [SettingsManager](SettingsManager.md#settingsmanager) (core/SettingsManager.js)
  - インポート項目: getConfigurationManager

### ./ContentLoader.js

**使用箇所**:
- [MultilingualContentManager](MultilingualContentManager.md#multilingualcontentmanager) (core/help/MultilingualContentManager.js)
  - インポート項目: ContentLoader, getContentLoader
- [TutorialManager](TutorialManager.md#tutorialmanager) (core/help/TutorialManager.js)
  - インポート項目: ContentLoader, getContentLoader

### ./core/GameEngine.js

**使用箇所**:
- [LoadingManager](main.md#loadingmanager) (main.js)
  - インポート項目: GameEngine

### ./DataCache.js

**使用箇所**:
- [DataManager](DataManager.md#datamanager) (core/DataManager.js)
  - インポート項目: getDataCache

### ./DataModels.js

**使用箇所**:
- [ContentLoader](ContentLoader.md#contentloader) (core/help/ContentLoader.js)
  - インポート項目: HelpContentModel, TutorialModel, FAQModel, UserProgressModel
- [TutorialManager](TutorialManager.md#tutorialmanager) (core/help/TutorialManager.js)
  - インポート項目: TutorialModel

### ./DebugPerformanceMonitor.js

**使用箇所**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: DebugPerformanceMonitor

### ./EffectManager.js

**使用箇所**:
- [EnhancedEffectManager](EnhancedEffectManager.md#enhancedeffectmanager) (effects/EnhancedEffectManager.js)
  - インポート項目: EffectManager

### ./EffectPerformanceMonitor.js

**使用箇所**:
- [EnhancedParticleManager](EnhancedParticleManager.md#enhancedparticlemanager) (effects/EnhancedParticleManager.js)
  - インポート項目: getEffectPerformanceMonitor

### ./EffectQualityController.js

**使用箇所**:
- [EffectConfigurationIntegrator](EffectConfigurationIntegrator.md#effectconfigurationintegrator) (effects/EffectConfigurationIntegrator.js)
  - インポート項目: getEffectQualityController
- [EffectPerformanceMonitor](EffectPerformanceMonitor.md#effectperformancemonitor) (effects/EffectPerformanceMonitor.js)
  - インポート項目: getEffectQualityController
- [EnhancedParticleManager](EnhancedParticleManager.md#enhancedparticlemanager) (effects/EnhancedParticleManager.js)
  - インポート項目: getEffectQualityController
- [SeasonalEffectManager](SeasonalEffectManager.md#seasonaleffectmanager) (effects/SeasonalEffectManager.js)
  - インポート項目: getEffectQualityController

### ./EnhancedAutocompleteEngine.js

**使用箇所**:
- [DeveloperConsole](DeveloperConsole.md#developerconsole) (debug/DeveloperConsole.js)
  - インポート項目: EnhancedAutocompleteEngine

### ./EnhancedHistoryManager.js

**使用箇所**:
- [DeveloperConsole](DeveloperConsole.md#developerconsole) (debug/DeveloperConsole.js)
  - インポート項目: EnhancedHistoryManager

### ./EnvironmentalAudioManager.js

**使用箇所**:
- [AudioController](AudioController.md#audiocontroller) (audio/AudioController.js)
  - インポート項目: EnvironmentalAudioManager

### ./Equalizer.js

**使用箇所**:
- [AudioController](AudioController.md#audiocontroller) (audio/AudioController.js)
  - インポート項目: Equalizer

### ./ErrorHandler.js

**使用箇所**:
- [AdaptiveQualityController](AdaptiveQualityController.md#adaptivequalitycontroller) (utils/AdaptiveQualityController.js)
  - インポート項目: getErrorHandler
- [AdvancedRenderingOptimizer](AdvancedRenderingOptimizer.md#advancedrenderingoptimizer) (utils/AdvancedRenderingOptimizer.js)
  - インポート項目: getErrorHandler
- [QuadTree](AdvancedRenderingOptimizer.md#quadtree) (utils/AdvancedRenderingOptimizer.js)
  - インポート項目: getErrorHandler
- [BalanceAdjustmentValidationRules](BalanceAdjustmentValidationRules.md#balanceadjustmentvalidationrules) (utils/BalanceAdjustmentValidationRules.js)
  - インポート項目: getErrorHandler
- [BalanceChangeDocumentationSystem](BalanceChangeDocumentationSystem.md#balancechangedocumentationsystem) (utils/BalanceChangeDocumentationSystem.js)
  - インポート項目: getErrorHandler
- [BalanceConfigurationValidator](BalanceConfigurationValidator.md#balanceconfigurationvalidator) (utils/BalanceConfigurationValidator.js)
  - インポート項目: getErrorHandler
- [BalanceGuidelinesManager](BalanceGuidelinesManager.md#balanceguidelinesmanager) (utils/BalanceGuidelinesManager.js)
  - インポート項目: getErrorHandler
- [ConfigurationMigrationUtility](ConfigurationMigrationUtility.md#configurationmigrationutility) (utils/ConfigurationMigrationUtility.js)
  - インポート項目: getErrorHandler
- [ConfigurationSynchronizer](ConfigurationSynchronizer.md#configurationsynchronizer) (utils/ConfigurationSynchronizer.js)
  - インポート項目: getErrorHandler
- [FrameStabilizer](FrameStabilizer.md#framestabilizer) (utils/FrameStabilizer.js)
  - インポート項目: getErrorHandler
- [MobilePerformanceOptimizer](MobilePerformanceOptimizer.md#mobileperformanceoptimizer) (utils/MobilePerformanceOptimizer.js)
  - インポート項目: getErrorHandler
- [ParticlePerformanceOptimizer](ParticlePerformanceOptimizer.md#particleperformanceoptimizer) (utils/ParticlePerformanceOptimizer.js)
  - インポート項目: getErrorHandler
- [PerformanceOptimizer](PerformanceOptimizer.md#performanceoptimizer) (utils/PerformanceOptimizer.js)
  - インポート項目: getErrorHandler
- [PerformanceWarningSystem](PerformanceWarningSystem.md#performancewarningsystem) (utils/PerformanceWarningSystem.js)
  - インポート項目: getErrorHandler

### ./ErrorNotificationSystem.js

**使用箇所**:
- [ErrorReporter](ErrorReporter.md#errorreporter) (debug/ErrorReporter.js)
  - インポート項目: ErrorNotificationSystem
- [ErrorCollector](ErrorReporter.md#errorcollector) (debug/ErrorReporter.js)
  - インポート項目: ErrorNotificationSystem
- [ErrorAnalyzer](ErrorReporter.md#erroranalyzer) (debug/ErrorReporter.js)
  - インポート項目: ErrorNotificationSystem
- [ErrorStorage](ErrorReporter.md#errorstorage) (debug/ErrorReporter.js)
  - インポート項目: ErrorNotificationSystem

### ./ErrorRecoveryTracker.js

**使用箇所**:
- [ErrorReporter](ErrorReporter.md#errorreporter) (debug/ErrorReporter.js)
  - インポート項目: ErrorRecoveryTracker
- [ErrorCollector](ErrorReporter.md#errorcollector) (debug/ErrorReporter.js)
  - インポート項目: ErrorRecoveryTracker
- [ErrorAnalyzer](ErrorReporter.md#erroranalyzer) (debug/ErrorReporter.js)
  - インポート項目: ErrorRecoveryTracker
- [ErrorStorage](ErrorReporter.md#errorstorage) (debug/ErrorReporter.js)
  - インポート項目: ErrorRecoveryTracker

### ./ErrorScreenshotCapture.js

**使用箇所**:
- [ErrorReporter](ErrorReporter.md#errorreporter) (debug/ErrorReporter.js)
  - インポート項目: ErrorScreenshotCapture
- [ErrorCollector](ErrorReporter.md#errorcollector) (debug/ErrorReporter.js)
  - インポート項目: ErrorScreenshotCapture
- [ErrorAnalyzer](ErrorReporter.md#erroranalyzer) (debug/ErrorReporter.js)
  - インポート項目: ErrorScreenshotCapture
- [ErrorStorage](ErrorReporter.md#errorstorage) (debug/ErrorReporter.js)
  - インポート項目: ErrorScreenshotCapture

### ./EventStageManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: EventStageManager

### ./ExecutionContext.js

**使用箇所**:
- [DeveloperConsole](DeveloperConsole.md#developerconsole) (debug/DeveloperConsole.js)
  - インポート項目: ExecutionContext

### ./FinalValidationSuite.js

**使用箇所**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: FinalValidationSuite

### ./FocusManager.js

**使用箇所**:
- [AccessibilityManager](AccessibilityManager.md#accessibilitymanager) (core/AccessibilityManager.js)
  - インポート項目: FocusManager
- [AccessibilityConfiguration](AccessibilityManager.md#accessibilityconfiguration) (core/AccessibilityManager.js)
  - インポート項目: FocusManager
- [AccessibilityState](AccessibilityManager.md#accessibilitystate) (core/AccessibilityManager.js)
  - インポート項目: FocusManager

### ./FormatterEngine.js

**使用箇所**:
- [EnhancedLocalizationManager](EnhancedLocalizationManager.md#enhancedlocalizationmanager) (core/i18n/EnhancedLocalizationManager.js)
  - インポート項目: FormatterEngine

### ./FrameStabilizer.js

**使用箇所**:
- [PerformanceOptimizer](PerformanceOptimizer.md#performanceoptimizer) (utils/PerformanceOptimizer.js)
  - インポート項目: getFrameStabilizer

### ./GameBalance.js

**使用箇所**:
- [GameConfig](GameConfig.md#gameconfig) (config/GameConfig.js)
  - インポート項目: ORIGINAL_BALANCE_CONFIG

### ./GameInputManager.js

**使用箇所**:
- [GameScene](GameScene.md#gamescene) (scenes/GameScene.js)
  - インポート項目: GameInputManager

### ./i18n/FontManager.js

**使用箇所**:
- [LocalizationManager](LocalizationManager.md#localizationmanager) (core/LocalizationManager.js)
  - インポート項目: getFontManager

### ./i18n/I18nPerformanceMonitor.js

**使用箇所**:
- [LocalizationManager](LocalizationManager.md#localizationmanager) (core/LocalizationManager.js)
  - インポート項目: I18nPerformanceMonitor

### ./i18n/I18nRenderOptimizer.js

**使用箇所**:
- [LocalizationManager](LocalizationManager.md#localizationmanager) (core/LocalizationManager.js)
  - インポート項目: I18nRenderOptimizer

### ./i18n/I18nSecurityManager.js

**使用箇所**:
- [LocalizationManager](LocalizationManager.md#localizationmanager) (core/LocalizationManager.js)
  - インポート項目: I18nSecurityManager

### ./i18n/I18nSecurityTester.js

**使用箇所**:
- [LocalizationManager](LocalizationManager.md#localizationmanager) (core/LocalizationManager.js)
  - インポート項目: I18nSecurityTester

### ./i18n/OptimizedTranslationLoader.js

**使用箇所**:
- [LocalizationManager](LocalizationManager.md#localizationmanager) (core/LocalizationManager.js)
  - インポート項目: OptimizedTranslationLoader

### ./i18n/TranslationLoader.js

**使用箇所**:
- [LocalizationManager](LocalizationManager.md#localizationmanager) (core/LocalizationManager.js)
  - インポート項目: TranslationLoader

### ./IntegrationTestSuite.js

**使用箇所**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: IntegrationTestSuite

### ./ItemSystem.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: ItemManager

### ./KeyboardAccessibilityManager.js

**使用箇所**:
- [AccessibilityManager](AccessibilityManager.md#accessibilitymanager) (core/AccessibilityManager.js)
  - インポート項目: KeyboardAccessibilityManager
- [AccessibilityConfiguration](AccessibilityManager.md#accessibilityconfiguration) (core/AccessibilityManager.js)
  - インポート項目: KeyboardAccessibilityManager
- [AccessibilityState](AccessibilityManager.md#accessibilitystate) (core/AccessibilityManager.js)
  - インポート項目: KeyboardAccessibilityManager

### ./KeyboardShortcutManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: KeyboardShortcutManager
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: KeyboardShortcutManager

### ./LanguageDetector.js

**使用箇所**:
- [EnhancedLocalizationManager](EnhancedLocalizationManager.md#enhancedlocalizationmanager) (core/i18n/EnhancedLocalizationManager.js)
  - インポート項目: LanguageDetector

### ./LazyLoadManager.js

**使用箇所**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: LazyLoadManager

### ./LocalizationManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: LocalizationManager

### ./LoggingSystem.js

**使用箇所**:
- [ConfigurationDebugger](ConfigurationDebugger.md#configurationdebugger) (core/ConfigurationDebugger.js)
  - インポート項目: getLoggingSystem
- [ConfigurationErrorHandler](ConfigurationErrorHandler.md#configurationerrorhandler) (core/ConfigurationErrorHandler.js)
  - インポート項目: getLoggingSystem
- [BalanceHelperCompatibility](GameBalanceCompatibility.md#balancehelpercompatibility) (core/GameBalanceCompatibility.js)
  - インポート項目: getLoggingSystem

### ./MobileEffectOptimizer.js

**使用箇所**:
- [MobileEffectIntegrator](MobileEffectIntegrator.md#mobileeffectintegrator) (effects/mobile/MobileEffectIntegrator.js)
  - インポート項目: MobileEffectOptimizer

### ./MobileResourceManager.js

**使用箇所**:
- [MobileEffectIntegrator](MobileEffectIntegrator.md#mobileeffectintegrator) (effects/mobile/MobileEffectIntegrator.js)
  - インポート項目: MobileResourceManager

### ./PanelManager.js

**使用箇所**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: PanelManager

### ./ParticleManager.js

**使用箇所**:
- [EnhancedParticleManager](EnhancedParticleManager.md#enhancedparticlemanager) (effects/EnhancedParticleManager.js)
  - インポート項目: ParticleManager

### ./PlayerData.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: PlayerData

### ./PresetManager.js

**使用箇所**:
- [AudioController](AudioController.md#audiocontroller) (audio/AudioController.js)
  - インポート項目: PresetManager

### ./ProgressTracker.js

**使用箇所**:
- [ValidationCommands](ValidationCommands.md#validationcommands) (core/i18n/management/ValidationCommands.js)
  - インポート項目: getProgressTracker

### ./RegionalSettingsManager.js

**使用箇所**:
- [FormatterEngine](FormatterEngine.md#formatterengine) (core/i18n/FormatterEngine.js)
  - インポート項目: getRegionalSettingsManager
- [NumberFormatter](FormatterEngine.md#numberformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getRegionalSettingsManager
- [DateFormatter](FormatterEngine.md#dateformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getRegionalSettingsManager
- [CurrencyFormatter](FormatterEngine.md#currencyformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getRegionalSettingsManager
- [RelativeTimeFormatter](FormatterEngine.md#relativetimeformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getRegionalSettingsManager
- [ListFormatter](FormatterEngine.md#listformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getRegionalSettingsManager
- [PluralFormatter](FormatterEngine.md#pluralformatter) (core/i18n/FormatterEngine.js)
  - インポート項目: getRegionalSettingsManager

### ./renderers/BubbleEffectRenderer.js

**使用箇所**:
- [EnhancedParticleManager](EnhancedParticleManager.md#enhancedparticlemanager) (effects/EnhancedParticleManager.js)
  - インポート項目: BubbleEffectRenderer

### ./renderers/ComboEffectRenderer.js

**使用箇所**:
- [EnhancedParticleManager](EnhancedParticleManager.md#enhancedparticlemanager) (effects/EnhancedParticleManager.js)
  - インポート項目: ComboEffectRenderer

### ./renderers/SeasonalEffectRenderer.js

**使用箇所**:
- [EnhancedParticleManager](EnhancedParticleManager.md#enhancedparticlemanager) (effects/EnhancedParticleManager.js)
  - インポート項目: SeasonalEffectRenderer

### ./renderers/SpecialEffectRenderer.js

**使用箇所**:
- [EnhancedParticleManager](EnhancedParticleManager.md#enhancedparticlemanager) (effects/EnhancedParticleManager.js)
  - インポート項目: SpecialEffectRenderer

### ./RequirementsValidationSuite.js

**使用箇所**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: RequirementsValidationSuite

### ./ResponsiveDebugLayout.js

**使用箇所**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: ResponsiveDebugLayout

### ./RTLLanguageDetector.js

**使用箇所**:
- [RTLLayoutManager](RTLLayoutManager.md#rtllayoutmanager) (core/i18n/rtl/RTLLayoutManager.js)
  - インポート項目: getRTLLanguageDetector
- [RTLUIComponents](RTLUIComponents.md#rtluicomponents) (core/i18n/rtl/RTLUIComponents.js)
  - インポート項目: getRTLLanguageDetector

### ./RTLLayoutManager.js

**使用箇所**:
- [RTLUIComponents](RTLUIComponents.md#rtluicomponents) (core/i18n/rtl/RTLUIComponents.js)
  - インポート項目: getRTLLayoutManager

### ./SceneManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: SceneManager

### ./SearchEngine.js

**使用箇所**:
- [MultilingualContentManager](MultilingualContentManager.md#multilingualcontentmanager) (core/help/MultilingualContentManager.js)
  - インポート項目: SearchEngine, getSearchEngine

### ./SeasonalEffectManager.js

**使用箇所**:
- [EffectConfigurationIntegrator](EffectConfigurationIntegrator.md#effectconfigurationintegrator) (effects/EffectConfigurationIntegrator.js)
  - インポート項目: getSeasonalEffectManager

### ./SettingsManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: SettingsManager

### ./SettingsNotificationSystem.js

**使用箇所**:
- [SettingsManager](SettingsManager.md#settingsmanager) (core/SettingsManager.js)
  - インポート項目: getSettingsNotificationSystem

### ./SoundEffectSystem.js

**使用箇所**:
- [AudioManager](AudioManager.md#audiomanager) (audio/AudioManager.js)
  - インポート項目: SoundEffectSystem

### ./StageManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: StageManager

### ./StatisticsDashboardRenderer.js

**使用箇所**:
- [StatisticsTab](StatisticsTab.md#statisticstab) (scenes/components/StatisticsTab.js)
  - インポート項目: StatisticsDashboardRenderer

### ./StatisticsFilterUI.js

**使用箇所**:
- [StatisticsTab](StatisticsTab.md#statisticstab) (scenes/components/StatisticsTab.js)
  - インポート項目: StatisticsFilterUI

### ./StatisticsManager.js

**使用箇所**:
- [GameEngine](GameEngine.md#gameengine) (core/GameEngine.js)
  - インポート項目: StatisticsManager

### ./StatisticsRenderer.js

**使用箇所**:
- [StatisticsTab](StatisticsTab.md#statisticstab) (scenes/components/StatisticsTab.js)
  - インポート項目: StatisticsRenderer

### ./TabComponent.js

**使用箇所**:
- [AchievementsTab](AchievementsTab.md#achievementstab) (scenes/components/AchievementsTab.js)
  - インポート項目: TabComponent
- [AchievementCategoryFilter](AchievementsTab.md#achievementcategoryfilter) (scenes/components/AchievementsTab.js)
  - インポート項目: TabComponent
- [AchievementProgressRenderer](AchievementsTab.md#achievementprogressrenderer) (scenes/components/AchievementsTab.js)
  - インポート項目: TabComponent
- [AchievementsRenderer](AchievementsTab.md#achievementsrenderer) (scenes/components/AchievementsTab.js)
  - インポート項目: TabComponent
- [HelpTab](HelpTab.md#helptab) (scenes/components/HelpTab.js)
  - インポート項目: TabComponent
- [HelpContentRenderer](HelpTab.md#helpcontentrenderer) (scenes/components/HelpTab.js)
  - インポート項目: TabComponent
- [ManagementTab](ManagementTab.md#managementtab) (scenes/components/ManagementTab.js)
  - インポート項目: TabComponent
- [UserInfoRenderer](ManagementTab.md#userinforenderer) (scenes/components/ManagementTab.js)
  - インポート項目: TabComponent
- [DataManagementRenderer](ManagementTab.md#datamanagementrenderer) (scenes/components/ManagementTab.js)
  - インポート項目: TabComponent
- [StatisticsTab](StatisticsTab.md#statisticstab) (scenes/components/StatisticsTab.js)
  - インポート項目: TabComponent

### ./TestDataGenerationCommands.js

**使用箇所**:
- [DeveloperConsole](DeveloperConsole.md#developerconsole) (debug/DeveloperConsole.js)
  - インポート項目: TestDataGenerationCommands

### ./ThemeManager.js

**使用箇所**:
- [EnhancedDebugInterface](EnhancedDebugInterface.md#enhanceddebuginterface) (debug/EnhancedDebugInterface.js)
  - インポート項目: ThemeManager

### ./TranslationCache.js

**使用箇所**:
- [EnhancedLocalizationManager](EnhancedLocalizationManager.md#enhancedlocalizationmanager) (core/i18n/EnhancedLocalizationManager.js)
  - インポート項目: TranslationCache

### ./TranslationKeyManager.js

**使用箇所**:
- [ValidationCommands](ValidationCommands.md#validationcommands) (core/i18n/management/ValidationCommands.js)
  - インポート項目: getTranslationKeyManager

### ./TranslationLoader.js

**使用箇所**:
- [EnhancedLocalizationManager](EnhancedLocalizationManager.md#enhancedlocalizationmanager) (core/i18n/EnhancedLocalizationManager.js)
  - インポート項目: TranslationLoader

### ./TutorialOverlay.js

**使用箇所**:
- [TutorialManager](TutorialManager.md#tutorialmanager) (core/help/TutorialManager.js)
  - インポート項目: TutorialOverlay, getTutorialOverlay

### ./utils/BrowserCompatibility.js

**使用箇所**:
- [LoadingManager](main.md#loadingmanager) (main.js)
  - インポート項目: getBrowserCompatibility

### ./utils/ErrorHandler.js

**使用箇所**:
- [LoadingManager](main.md#loadingmanager) (main.js)
  - インポート項目: getErrorHandler

### ./ValidationSystem.js

**使用箇所**:
- [ConfigurationErrorHandler](ConfigurationErrorHandler.md#configurationerrorhandler) (core/ConfigurationErrorHandler.js)
  - インポート項目: getValidationSystem

### ./VisualEffectAccessibilityManager.js

**使用箇所**:
- [AccessibilityEffectIntegrator](AccessibilityEffectIntegrator.md#accessibilityeffectintegrator) (effects/accessibility/AccessibilityEffectIntegrator.js)
  - インポート項目: VisualEffectAccessibilityManager

### ./VisualFocusManager.js

**使用箇所**:
- [AccessibilityManager](AccessibilityManager.md#accessibilitymanager) (core/AccessibilityManager.js)
  - インポート項目: VisualFocusManager
- [AccessibilityConfiguration](AccessibilityManager.md#accessibilityconfiguration) (core/AccessibilityManager.js)
  - インポート項目: VisualFocusManager
- [AccessibilityState](AccessibilityManager.md#accessibilitystate) (core/AccessibilityManager.js)
  - インポート項目: VisualFocusManager

### @jest/globals

**使用箇所**:
- [TestConfigurationGenerator](TestConfigurationGenerator.md#testconfigurationgenerator) (utils/TestConfigurationGenerator.js)
  - インポート項目: jest
- [TestConfigurationGenerator](TestConfigurationGenerator.md#testconfigurationgenerator) (utils/TestConfigurationGenerator.js)
  - インポート項目: jest
- [TestConfigurationGenerator](TestConfigurationGenerator.md#testconfigurationgenerator) (utils/TestConfigurationGenerator.js)
  - インポート項目: jest

### fs

**使用箇所**:
- [TestConfigurationGenerator](TestConfigurationGenerator.md#testconfigurationgenerator) (utils/TestConfigurationGenerator.js)

### path

**使用箇所**:
- [TestConfigurationGenerator](TestConfigurationGenerator.md#testconfigurationgenerator) (utils/TestConfigurationGenerator.js)

