(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  function createInitialState(options = {}){
    const standings = options.standings || { F1:{}, F2:{} };
    return {
      profile:null,
      mode:'realistic',
      currentSeries:'F2',
      currentTeam:null,
      roundIndex:0,
      money:0,
      reputation:0,
      sponsor:null,
      raceStrategy:{ plan:'balanced', startCompound:'soft', stopBias:'balanced' },
      staff:{ designers:1, mechanics:1, strategists:1, raceEngineers:1, scouts:1, pitCrew:1 },
      facilities:{ hq:1, simulator:1, factory:1, scouting:0 },
      rosters:options.rosters || {},
      driverContracts:{},
      driverProgress:{},
      seasonArchive:[],
      tutorial:{ completed:false, step:0 },
      quality:{ difficulty:'normal', betaScore:0, lastCheck:null, checks:[], performanceReport:null, performanceHistory:[], ciGate:null, mobileUx:null, i18n:null, vehiclePhysics:null, strategyAI:null, balance:null, balanceMonteCarlo:null, visual3d:null, audioUI:null },
      settings:{ language:'pt-BR', locale:'pt-BR' },
      viewport:{ hudMode:'auto', safeAreaReady:true, fullscreenPromptSeen:false, touchProfile:'auto', mobileUxPhase:7 },
      saveSlotsMeta:{},
      hallOfFame:[],
      driverDevelopmentLog:[],
      carEvolutionLog:[],
      car:{ aero:50, engine:50, chassis:50, reliability:55, tyreWear:55, pitStop:55, fuel:55 },
      setup:{ preset:'balanced', aeroBalance:50, engineMode:50, suspension:50, tyrePressure:50 },
      standings,
      f1Standings:standings.F1,
      lastQualifying:[],
      lastRace:[],
      offers:[],
      inbox:[],
      unreadMessages:0,
      seasonYear:2026,
      seasonNumber:1,
      seasonStats:{ races:0, bestFinish:null, podiums:0, wins:0, objectiveProgress:0 },
      completedRaces:0,
      saveSchema:Number(options.saveSchema || 0),
      architecture:{ version:25, persistence:'F1M_SAVE_ENVELOPE_V2', dataContracts:1, qualityGate:1, sportingDatabase:1, regulationEngine:1, vehiclePhysics:1, modules:['career','race','persistence','ui','assets','save-vault','performance','ci-gate','viewport','mobile-ux','safe-area','i18n','localization','sporting-db','calendar-f1-f2','rules-engine','weekend-sessions','official-classification','vehicle-physics','tyre-model','ers-drs','damage-model','track-evolution','strategy-ai','overtake-model','pit-strategy','neutralization-model','balance-simulator','monte-carlo','difficulty-fairness','track-visual-system','professional-3d','replay-buffer','camera-director','audio-ui','radio-box','dynamic-mix','design-system','accessibility','tutorial-contextual','living-career','factories','research-and-development','sponsor-portfolio','board-politics','academy-pipeline','multi-season-projection','backend-launch','accounts-adapter','cloud-save-adapter','telemetry-consent','crash-reporting','remote-config','rollback','release-channels','platform-targets','privacy-support','live-ops','release-candidate','commercial-rc','physical-homologation','store-checklist','legal-review','publishing-package','deployment-validation','public-beta-gate','asset-restore-wizard','vercel-preview','github-upload-memory','beta-ops','feedback-local','crash-triage','hotfix-plan','device-matrix','operations-center','tyre-stint-f27','compound-window','degradation-curve','graining-blistering','undercut-overcut-tyre','pit-wall-tyre-plan'] },
      saveVault:{ format:'F1M_SAVE_ENVELOPE_V2', backups:5, journal:'F1M_SAVE_JOURNAL_V1', lastVerifiedAt:null },
      createdAt:new Date().toISOString()
    };
  }

  function migrateState(input, options = {}){
    const state = input && typeof input === 'object' ? input : {};
    const targetSchema = Number(options.targetSchema || 0);
    const calendarLength = Math.max(1, Number(options.calendarLength || 1));
    const applied = [];
    let current = Number(state.saveSchema || 0);

    if(current < 1 && targetSchema >= 1){
      const expectedRound = Math.min(Number(state.completedRaces || 0), calendarLength - 1);
      if(state.currentSeries === 'F2' && Number(state.roundIndex || 0) !== expectedRound) state.roundIndex = expectedRound;
      current = 1; applied.push(1);
    }
    if(current < 2 && targetSchema >= 2){
      state.quality = state.quality || { difficulty:'normal', betaScore:0, lastCheck:null, checks:[] };
      state.quality.systemDiagnostics = state.quality.systemDiagnostics || null;
      state.quality.systemDiagnosticsHistory = Array.isArray(state.quality.systemDiagnosticsHistory) ? state.quality.systemDiagnosticsHistory : [];
      current = 2; applied.push(2);
    }
    if(current < 3 && targetSchema >= 3){
      state.architecture = {
        version:1,
        persistence:'F1M_SAVE_ENVELOPE_V1',
        dataContracts:1,
        modules:['career','race','persistence','ui','assets'],
        migratedAt:new Date().toISOString(),
        migratedBy:String(options.buildCode || 'dev')
      };
      state.session = state.session || { lastScreen:'home', lastTab:'dashboard', lastActiveAt:new Date().toISOString() };
      current = 3; applied.push(3);
    }
    if(current < 4 && targetSchema >= 4){
      state.assetIntegrity = state.assetIntegrity || { registryVersion:1, lastAuditAt:null, lastScore:null, fallbackCount:0 };
      state.architecture = {...(state.architecture || {}), version:2, assetRegistry:1, modules:[...new Set([...(state.architecture?.modules || []),'assets'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 4; applied.push(4);
    }
    if(current < 5 && targetSchema >= 5){
      state.saveVault = state.saveVault || {};
      state.saveVault = {
        format:'F1M_SAVE_ENVELOPE_V2',
        journal:'F1M_SAVE_JOURNAL_V1',
        backups:5,
        portableExport:'F1M_PORTABLE_SAVE_V1',
        lastVerifiedAt:new Date().toISOString(),
        migratedBy:String(options.buildCode || 'dev'),
        ...state.saveVault
      };
      state.architecture = {...(state.architecture || {}), version:3, persistence:'F1M_SAVE_ENVELOPE_V2', saveVault:1, modules:[...new Set([...(state.architecture?.modules || []),'save-vault'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 5; applied.push(5);
    }
    if(current < 6 && targetSchema >= 6){
      state.quality = state.quality || {};
      state.quality.performanceReport = state.quality.performanceReport || null;
      state.quality.performanceHistory = Array.isArray(state.quality.performanceHistory) ? state.quality.performanceHistory : [];
      state.quality.ciGate = state.quality.ciGate || { status:'not-run', requiredScripts:['audit','test:performance','test:visual','test:ci'], migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:4, qualityGate:1, modules:[...new Set([...(state.architecture?.modules || []),'performance','ci-gate'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 6; applied.push(6);
    }
    if(current < 7 && targetSchema >= 7){
      state.viewport = state.viewport || {};
      state.viewport = {
        hudMode:'auto',
        safeAreaReady:true,
        fullscreenPromptSeen:false,
        touchProfile:'auto',
        mobileUxPhase:7,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.viewport
      };
      state.quality = state.quality || {};
      state.quality.mobileUx = state.quality.mobileUx || { status:'not-run', safeArea:true, hudAdaptive:true, fullscreen:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:5, viewportManager:1, modules:[...new Set([...(state.architecture?.modules || []),'viewport','mobile-ux','safe-area','i18n','localization'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 7; applied.push(7);
    }
    if(current < 8 && targetSchema >= 8){
      state.settings = state.settings || {};
      state.settings.language = state.settings.language || 'pt-BR';
      state.settings.locale = state.settings.locale || 'pt-BR';
      state.quality = state.quality || {};
      state.quality.i18n = state.quality.i18n || { status:'not-run', supported:['pt-BR','en','es'], fallback:'pt-BR', migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:6, i18n:1, modules:[...new Set([...(state.architecture?.modules || []),'i18n','localization'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 8; applied.push(8);
    }
    if(current < 9 && targetSchema >= 9){
      state.sporting = state.sporting || {};
      state.sporting = {
        season:2026,
        dataPack:'official-snapshot-2026-06-18',
        activeCalendarBySeries:true,
        f1Rounds:22,
        f2Rounds:14,
        rulesVersion:1,
        legalReview:'requires-licensing-review',
        migratedBy:String(options.buildCode || 'dev'),
        ...state.sporting
      };
      state.quality = state.quality || {};
      state.quality.sportingData = state.quality.sportingData || { status:'not-run', f1Rounds:22, f2Rounds:14, f2Drivers:22, f2Teams:11, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:7, sportingDatabase:1, modules:[...new Set([...(state.architecture?.modules || []),'sporting-db','calendar-f1-f2','rules-engine','legal-mode'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 9; applied.push(9);
    }

    if(current < 10 && targetSchema >= 10){
      state.regulations = state.regulations || {};
      state.regulations = {
        season:2026,
        dataPack:'official-regulations-snapshot-2026-06-18',
        f1Qualifying:'Q1_Q2_Q3',
        f1Sprint:true,
        f2SprintFeature:true,
        penalties:true,
        flags:true,
        parcFerme:true,
        officialClassification:true,
        legalReview:'requires-licensing-review',
        migratedBy:String(options.buildCode || 'dev'),
        ...state.regulations
      };
      state.weekend = state.weekend || { practiceDone:false, setupConfidence:50, tyreKnowledge:50, qualyFocus:'balanced', engineerNote:'Regulamento Fase 10 ativo: treinos, classificação e direção de prova.' };
      state.quality = state.quality || {};
      state.quality.regulations = state.quality.regulations || { status:'not-run', f1QStages:3, f2Weekend:'sprint-feature', penalties:true, flags:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:8, regulationEngine:1, modules:[...new Set([...(state.architecture?.modules || []),'rules-engine','weekend-sessions','official-classification','penalties','flags','parc-ferme'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 10; applied.push(10);
    }

    if(current < 11 && targetSchema >= 11){
      state.vehiclePhysics = state.vehiclePhysics || {};
      state.vehiclePhysics = {
        dataPack:'vehicle-physics-development-model-2026-06-18',
        tyres:true,
        tyreTemperature:true,
        fuelMass:true,
        ers:true,
        drs:true,
        brakes:true,
        engineTemperature:true,
        damage:true,
        reliability:true,
        dirtyAir:true,
        trackEvolution:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.vehiclePhysics
      };
      state.quality = state.quality || {};
      state.quality.vehiclePhysics = state.quality.vehiclePhysics || { status:'not-run', systems:10, telemetry:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:9, vehiclePhysics:1, modules:[...new Set([...(state.architecture?.modules || []),'vehicle-physics','tyre-model','ers-drs','brake-thermal','engine-thermal','damage-model','dirty-air','track-evolution','strategy-ai','overtake-model','pit-strategy','neutralization-model'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 11; applied.push(11);
    }

    if(current < 12 && targetSchema >= 12){
      state.strategyAI = state.strategyAI || {};
      state.strategyAI = {
        dataPack:'race-ai-strategy-development-model-2026-06-18',
        undercutOvercut:true,
        trafficModel:true,
        attackDefense:true,
        humanError:true,
        pitCrew:true,
        doubleStacking:true,
        unsafeRelease:true,
        safetyCar:true,
        vsc:true,
        redFlag:true,
        restarts:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.strategyAI
      };
      state.quality = state.quality || {};
      state.quality.strategyAI = state.quality.strategyAI || { status:'not-run', systems:13, overtaking:true, neutralizations:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:10, strategyAI:1, balanceSimulator:1, modules:[...new Set([...(state.architecture?.modules || []),'strategy-ai','undercut-overcut','overtake-model','pit-crew','neutralization-model','restarts'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 12; applied.push(12);
    }


    if(current < 13 && targetSchema >= 13){
      state.balance = state.balance || {};
      state.balance = {
        dataPack:'balance-monte-carlo-development-model-2026-06-19',
        monteCarlo:true,
        deterministicSeeds:true,
        dnfDistribution:true,
        overtakeDistribution:true,
        pitStopDistribution:true,
        gapDistribution:true,
        teamProgression:true,
        noInvisibleDifficultyCheats:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.balance
      };
      state.quality = state.quality || {};
      state.quality.balance = state.quality.balance || { status:'not-run', systems:12, monteCarloRuns:0, noHiddenGrip:true, migratedBy:String(options.buildCode || 'dev') };
      state.quality.balanceMonteCarlo = state.quality.balanceMonteCarlo || null;
      state.architecture = {...(state.architecture || {}), version:11, balanceSimulator:1, modules:[...new Set([...(state.architecture?.modules || []),'balance-simulator','monte-carlo','dnf-distribution','overtake-distribution','pit-stop-distribution','gap-distribution','team-progression','difficulty-fairness'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 13; applied.push(13);
    }


    if(current < 14 && targetSchema >= 14){
      state.visual3d = state.visual3d || {};
      state.visual3d = {
        dataPack:'professional-track-visuals-development-model-2026-06-19',
        realTrackWidth:true,
        elevation:true,
        pitLane:true,
        sectors:true,
        drsZones:true,
        racingLines:true,
        carLod:true,
        damageVisuals:true,
        rainSpray:true,
        cameras:['tv','follow','onboard','pitwall','overhead','replay'],
        replayBuffer:true,
        proceduralNoBinaryAssets:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.visual3d
      };
      state.quality = state.quality || {};
      state.quality.visual3d = state.quality.visual3d || { status:'not-run', systems:15, cameras:6, replay:true, noBinaryAssets:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:12, visual3d:1, trackVisualSystem:1, modules:[...new Set([...(state.architecture?.modules || []),'track-visual-system','professional-3d','real-track-width','elevation-mesh','pit-lane','sector-boards','drs-markers','racing-lines','car-lod','damage-visuals','rain-spray','camera-director','replay-buffer'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 14; applied.push(14);
    }


    if(current < 15 && targetSchema >= 15){
      state.audioUI = state.audioUI || {};
      state.audioUI = {
        dataPack:'audio-ui-accessibility-development-model-2026-06-19',
        proceduralAudio:true,
        engineSynthesis:true,
        radioBox:true,
        dynamicMix:true,
        designSystem:true,
        motionSystem:true,
        contextualTutorial:true,
        accessibility:true,
        noBinaryAudioAssets:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.audioUI
      };
      state.quality = state.quality || {};
      state.quality.audioUI = state.quality.audioUI || { status:'not-run', channels:6, procedural:true, accessibility:true, noBinaryAssets:true, migratedBy:String(options.buildCode || 'dev') };
      state.tutorial = state.tutorial || { completed:false, step:0 };
      state.settings = {...(state.settings || {}), audioMuted: state.settings?.audioMuted ?? true, reducedMotion: state.settings?.reducedMotion ?? false };
      state.architecture = {...(state.architecture || {}), version:13, audioUI:1, designSystem:1, accessibility:1, modules:[...new Set([...(state.architecture?.modules || []),'audio-ui','procedural-engine-audio','radio-box','dynamic-mix','design-system','motion-system','contextual-tutorial','accessibility'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 15; applied.push(15);
    }


    if(current < 16 && targetSchema >= 16){
      state.livingCareer = state.livingCareer || {};
      state.livingCareer = {
        dataPack:'living-career-development-model-2026-06-19',
        staffDepth:true,
        factories:true,
        departments:true,
        researchAndDevelopment:true,
        sponsorPortfolio:true,
        budgetGovernance:true,
        boardPolitics:true,
        academyPipeline:true,
        livingMarket:true,
        pressNarratives:true,
        rivalries:true,
        regulationChanges:true,
        teamEvolution:true,
        multiSeasonProjection:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.livingCareer
      };
      state.quality = state.quality || {};
      state.quality.livingCareer = state.quality.livingCareer || { status:'not-run', systems:14, multiSeason:true, boardReview:true, noBinaryAssets:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:14, livingCareer:1, careerDepth:1, modules:[...new Set([...(state.architecture?.modules || []),'living-career','staff-depth','factories','departments','research-and-development','sponsor-portfolio','budget-governance','board-politics','academy-pipeline','living-market','press-narratives','rivalries','regulation-changes','team-evolution','multi-season-projection'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 16; applied.push(16);
    }


    if(current < 17 && targetSchema >= 17){
      state.backendLaunch = state.backendLaunch || {};
      state.backendLaunch = {
        dataPack:'backend-launch-foundation-2026-06-19',
        accountsReady:true,
        cloudSaveAdapterReady:true,
        conflictResolutionReady:true,
        telemetryConsentRequired:true,
        telemetryEnabled:false,
        crashReportingLocal:true,
        remoteConfigLocal:true,
        rollbackReady:true,
        releaseChannelsReady:4,
        platformTargetsReady:4,
        privacyReviewRequired:true,
        ageRatingReviewRequired:true,
        supportPlanReady:true,
        liveOpsPlanned:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.backendLaunch
      };
      state.release = state.release || { channel:'development', candidate:null, gates:{}, lastPreparedAt:null };
      state.privacy = state.privacy || { telemetryConsent:false, telemetryConsentVersion:'F1M_TELEMETRY_CONSENT_V1', dataSale:false, exportAvailable:true };
      state.support = state.support || { diagnosticsExport:true, contactPending:true, localCrashBuffer:true };
      state.quality = state.quality || {};
      state.quality.backendLaunch = state.quality.backendLaunch || { status:'not-run', systems:14, releaseReady:true, backendAdapter:true, noSecretsInClient:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:15, backendLaunch:1, releaseReadiness:1, modules:[...new Set([...(state.architecture?.modules || []),'backend-launch','accounts-adapter','cloud-save-adapter','conflict-resolution','telemetry-consent','crash-reporting','remote-config','rollback','security-hardening','alpha-beta-rc','platform-targets','privacy-policy','age-rating','support-diagnostics','live-ops'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 17; applied.push(17);
    }

    if(current < 18 && targetSchema >= 18){
      state.releaseCandidate = state.releaseCandidate || {};
      state.releaseCandidate = {
        dataPack:'commercial-release-candidate-2026-06-19',
        channel:'release-candidate',
        physicalHomologation:'manual-required',
        pwaReady:true,
        androidReady:false,
        iosReady:false,
        windowsReady:false,
        privacyDocsReady:true,
        supportDocsReady:true,
        legalReviewRequired:true,
        assetsHeavyRestoreRequired:true,
        backendProductionRequired:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.releaseCandidate
      };
      state.quality = state.quality || {};
      state.quality.releaseCandidateF18 = state.quality.releaseCandidateF18 || { status:'not-run', systems:12, physicalHomologation:'manual-required', storeChecklist:true, legalReviewRequired:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:16, releaseCandidate:1, commercialReadiness:1, modules:[...new Set([...(state.architecture?.modules || []),'release-candidate','commercial-rc','physical-homologation','store-checklist','privacy-support-final','legal-review','performance-device-matrix','publishing-package','deployment-validation','public-beta-gate','asset-restore-wizard','vercel-preview','github-upload-memory','beta-ops','feedback-local','crash-triage','hotfix-plan','device-matrix','operations-center','tyre-stint-f27','compound-window','degradation-curve','graining-blistering','undercut-overcut-tyre','pit-wall-tyre-plan'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 18; applied.push(18);
    }

    if(current < 19 && targetSchema >= 19){
      state.deployment = state.deployment || {};
      state.deployment = {
        dataPack:'public-beta-deploy-2026-06-19',
        channel:'public-beta-candidate',
        productionBlocked:true,
        betaGate:'manual-controlled',
        assetRestoreRequired:true,
        githubReady:false,
        vercelPreviewRequired:true,
        pwaDeviceTestRequired:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.deployment
      };
      state.quality = state.quality || {};
      state.quality.deploymentF19 = state.quality.deploymentF19 || { status:'not-run', score:null, systems:10, assetRestore:true, productionBlocked:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:17, deploymentValidation:1, publicBetaGate:1, modules:[...new Set([...(state.architecture?.modules || []),'deployment-validation','public-beta-gate','asset-restore-wizard','vercel-preview','github-upload-memory','pwa-cache-bust','manual-evidence-matrix'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 19; applied.push(19);
    }


    if(current < 20 && targetSchema >= 20){
      state.operations = state.operations || {};
      state.operations = {
        dataPack:'beta-ops-hotfix-2026-06-19',
        channel:'public-beta-ops',
        productionBlocked:true,
        feedbackQueue:Array.isArray(state.operations?.feedbackQueue) ? state.operations.feedbackQueue : [],
        crashBuckets:state.operations?.crashBuckets || {},
        hotfixPlans:Array.isArray(state.operations?.hotfixPlans) ? state.operations.hotfixPlans : [],
        lastAuditAt:state.operations?.lastAuditAt || null,
        lastFeedbackAt:state.operations?.lastFeedbackAt || null,
        lastHotfixAt:state.operations?.lastHotfixAt || null,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.operations
      };
      state.quality = state.quality || {};
      state.quality.operationsF20 = state.quality.operationsF20 || { status:'not-run', score:null, systems:10, feedback:true, hotfix:true, productionBlocked:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:18, betaOperations:1, feedbackOps:1, hotfixControl:1, modules:[...new Set([...(state.architecture?.modules || []),'beta-ops','feedback-local','crash-triage','hotfix-plan','device-matrix','rollback-control','manual-evidence','operations-center','tyre-stint-f27','compound-window','degradation-curve','graining-blistering','undercut-overcut-tyre','pit-wall-tyre-plan'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 20; applied.push(20);
    }

    if(current < 21 && targetSchema >= 21){
      state.assetRestore = state.assetRestore || {};
      state.assetRestore = {
        dataPack:'asset-restore-preview-2026-06-20',
        channel:'public-beta-assets-restore',
        productionBlocked:true,
        previewChecks:Array.isArray(state.assetRestore?.previewChecks) ? state.assetRestore.previewChecks : [],
        restorePlans:Array.isArray(state.assetRestore?.restorePlans) ? state.assetRestore.restorePlans : [],
        manualEvidence:Array.isArray(state.assetRestore?.manualEvidence) ? state.assetRestore.manualEvidence : [],
        lastAuditAt:state.assetRestore?.lastAuditAt || null,
        lastPlanAt:state.assetRestore?.lastPlanAt || null,
        lastPreviewAt:state.assetRestore?.lastPreviewAt || null,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.assetRestore
      };
      state.quality = state.quality || {};
      state.quality.assetRestoreF21 = state.quality.assetRestoreF21 || { status:'not-run', score:null, systems:10, guidedRestore:true, preview:true, productionBlocked:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:19, assetRestoreF21:1, previewValidation:1, pwaCacheInvalidation:1, modules:[...new Set([...(state.architecture?.modules || []),'asset-restore-f21','guided-restore-plan','preview-health','case-sensitive-paths','pwa-cache-invalidation','github-vercel-check','manual-evidence','production-blocker'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 21; applied.push(21);
    }


    if(current < 22 && targetSchema >= 22){
      state.visualHotfix = state.visualHotfix || {};
      state.visualHotfix = {
        dataPack:'visual-hotfix-scroll-assets-2026-06-20',
        channel:'public-beta-visual-hotfix',
        productionBlocked:true,
        evidence:Array.isArray(state.visualHotfix?.evidence) ? state.visualHotfix.evidence : [],
        auditHistory:Array.isArray(state.visualHotfix?.auditHistory) ? state.visualHotfix.auditHistory : [],
        lastAuditAt:state.visualHotfix?.lastAuditAt || null,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.visualHotfix
      };
      state.quality = state.quality || {};
      state.quality.visualHotfixF22 = state.quality.visualHotfixF22 || { status:'not-run', score:null, scroll:true, assets:true, mobile:true, productionBlocked:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:20, visualHotfixF22:1, scrollAudit:1, assetPathVisibility:1, modules:[...new Set([...(state.architecture?.modules || []),'visual-hotfix-f22','scroll-audit','asset-path-visibility','background-restore','mobile-desktop-polish','beta-asset-validation'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 22; applied.push(22);
    }


    if(current < 23 && targetSchema >= 23){
      state.publicBetaAssets = state.publicBetaAssets || {};
      state.publicBetaAssets = {
        dataPack:'public-beta-assets-real-2026-06-20',
        channel:'public-beta-assets-real',
        productionBlocked:true,
        evidence:Array.isArray(state.publicBetaAssets?.evidence) ? state.publicBetaAssets.evidence : [],
        previewChecks:Array.isArray(state.publicBetaAssets?.previewChecks) ? state.publicBetaAssets.previewChecks : [],
        auditHistory:Array.isArray(state.publicBetaAssets?.auditHistory) ? state.publicBetaAssets.auditHistory : [],
        lastAuditAt:state.publicBetaAssets?.lastAuditAt || null,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.publicBetaAssets
      };
      state.quality = state.quality || {};
      state.quality.publicBetaAssetsF23 = state.quality.publicBetaAssetsF23 || { status:'not-run', score:null, github:true, vercel:true, pwaCache:true, evidence:true, productionBlocked:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:21, publicBetaAssetsF23:1, previewValidationF23:1, modules:[...new Set([...(state.architecture?.modules || []),'public-beta-assets-f23','github-vercel-preview','real-assets-validation','pwa-cache-clean','beta-evidence-gate'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 23; applied.push(23);
    }

    if(current < 24 && targetSchema >= 24){
      state.gameplayPolish = state.gameplayPolish || {};
      state.gameplayPolish = {
        dataPack:'gameplay-perfect-beta-2026-06-20',
        channel:'gameplay-perfect-beta',
        profile:state.gameplayPolish?.profile || 'realistic',
        productionBlocked:true,
        evidence:Array.isArray(state.gameplayPolish?.evidence) ? state.gameplayPolish.evidence : [],
        raceNotes:Array.isArray(state.gameplayPolish?.raceNotes) ? state.gameplayPolish.raceNotes : [],
        auditHistory:Array.isArray(state.gameplayPolish?.auditHistory) ? state.gameplayPolish.auditHistory : [],
        lastAuditAt:state.gameplayPolish?.lastAuditAt || null,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.gameplayPolish
      };
      state.quality = state.quality || {};
      state.quality.gameplayPolishF24 = state.quality.gameplayPolishF24 || { status:'not-run', score:null, pitWall:true, battles:true, fairness:true, telemetry:true, productionBlocked:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:22, gameplayPolishF24:1, pitWallF24:1, battleDirectorF24:1, modules:[...new Set([...(state.architecture?.modules || []),'gameplay-polish-f24','pit-wall-advice','battle-director','fairness-guard','race-telemetry-readable','player-agency'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 24; applied.push(24);
    }

    if(current < 25 && targetSchema >= 25){
      state.telemetry = state.telemetry || {};
      state.telemetry = {
        dataPack:'realistic-telemetry-simulator-2026-06-20',
        channel:'realistic-telemetry-simulator',
        enabled:true,
        productionBlocked:true,
        samples:Array.isArray(state.telemetry?.samples) ? state.telemetry.samples : [],
        sessions:Array.isArray(state.telemetry?.sessions) ? state.telemetry.sessions : [],
        diagnosisHistory:Array.isArray(state.telemetry?.diagnosisHistory) ? state.telemetry.diagnosisHistory : [],
        auditHistory:Array.isArray(state.telemetry?.auditHistory) ? state.telemetry.auditHistory : [],
        lastAuditAt:state.telemetry?.lastAuditAt || null,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.telemetry
      };
      state.quality = state.quality || {};
      state.quality.telemetryF25 = state.quality.telemetryF25 || { status:'not-run', score:null, sensors:true, tyres:true, brakes:true, fuel:true, ers:true, diagnosis:true, productionBlocked:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:23, telemetryF25:1, raceEngineeringF25:1, modules:[...new Set([...(state.architecture?.modules || []),'telemetry-f25','realistic-sensors','race-engineering-diagnosis','tyre-thermal-map','brake-window','ers-harvest-deploy','fuel-corrected-pace','dirty-air-telemetry','sector-delta-analysis','setup-engineering-f26','free-practice-programmes','setup-telemetry-correlation','aero-mechanical-balance','race-engineering-workbench'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 25; applied.push(25);
    }

    if(current < 26 && targetSchema >= 26){
      state.setupEngineering = state.setupEngineering || {};
      state.setupEngineering = {
        dataPack:'advanced-setup-engineering-2026-06-20',
        channel:'advanced-setup-engineering',
        productionBlocked:true,
        activeSetup:state.setupEngineering?.activeSetup || {},
        practiceRuns:Array.isArray(state.setupEngineering?.practiceRuns) ? state.setupEngineering.practiceRuns : [],
        correlationHistory:Array.isArray(state.setupEngineering?.correlationHistory) ? state.setupEngineering.correlationHistory : [],
        auditHistory:Array.isArray(state.setupEngineering?.auditHistory) ? state.setupEngineering.auditHistory : [],
        lastAuditAt:state.setupEngineering?.lastAuditAt || null,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.setupEngineering
      };
      state.quality = state.quality || {};
      state.quality.setupEngineeringF26 = state.quality.setupEngineeringF26 || { status:'not-run', score:null, setup:true, practice:true, telemetryCorrelation:true, noArcadeBoost:true, productionBlocked:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:24, setupEngineeringF26:1, freePracticeF26:1, telemetryCorrelationF26:1, modules:[...new Set([...(state.architecture?.modules || []),'setup-engineering-f26','free-practice-programmes','setup-telemetry-correlation','aero-mechanical-balance','tyre-pressure-model','differential-brake-bias','engine-map-strategy','race-engineering-workbench'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 26; applied.push(26);
    }

    if(current < 27 && targetSchema >= 27){
      state.tyreStint = state.tyreStint || {};
      state.tyreStint = {
        dataPack:'tyre-stint-degradation-2026-06-20',
        channel:'tyre-stint-degradation-simulator',
        productionBlocked:true,
        activePlans:Array.isArray(state.tyreStint?.activePlans) ? state.tyreStint.activePlans : [],
        analysisHistory:Array.isArray(state.tyreStint?.analysisHistory) ? state.tyreStint.analysisHistory : [],
        pitWallHistory:Array.isArray(state.tyreStint?.pitWallHistory) ? state.tyreStint.pitWallHistory : [],
        auditHistory:Array.isArray(state.tyreStint?.auditHistory) ? state.tyreStint.auditHistory : [],
        lastAuditAt:state.tyreStint?.lastAuditAt || null,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.tyreStint
      };
      state.quality = state.quality || {};
      state.quality.tyreStintF27 = state.quality.tyreStintF27 || { status:'not-run', score:null, compounds:true, thermalWindow:true, degradation:true, graining:true, blistering:true, flatSpot:true, undercutOvercut:true, productionBlocked:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:25, tyreStintF27:1, tyreDegradationF27:1, pitWallTyreF27:1, modules:[...new Set([...(state.architecture?.modules || []),'tyre-stint-f27','compound-window','degradation-curve','graining-blistering','flatspot-model','fuel-corrected-pace','undercut-overcut-tyre','pit-wall-tyre-plan','realistic-stint-engineering'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 27; applied.push(27);
    }

        state.saveSchema = Math.min(targetSchema, Math.max(current, Number(state.saveSchema || 0)));
    return { state, from:Number(input?.saveSchema || 0), to:state.saveSchema, applied };
  }

  function validateState(state, targetSchema = 0){
    const checks = [
      { id:'object', ok:Boolean(state) && typeof state === 'object', detail:'estado em memória' },
      { id:'schema', ok:Number(state?.saveSchema || 0) === Number(targetSchema), detail:`${state?.saveSchema || 0}/${targetSchema}` },
      { id:'series', ok:['F1','F2'].includes(state?.currentSeries || 'F2'), detail:String(state?.currentSeries || 'F2') },
      { id:'round', ok:Number.isInteger(Number(state?.roundIndex || 0)) && Number(state?.roundIndex || 0) >= 0, detail:String(state?.roundIndex || 0) },
      { id:'collections', ok:Array.isArray(state?.inbox) && Array.isArray(state?.lastRace) && Array.isArray(state?.offers), detail:'inbox/lastRace/offers' },
      { id:'architecture', ok:Number(state?.architecture?.version || 0) >= 1, detail:String(state?.architecture?.persistence || 'ausente') },
      { id:'asset-integrity', ok:Number(targetSchema) < 4 || Boolean(state?.assetIntegrity), detail:state?.assetIntegrity ? 'registro ativo' : 'ausente' },
      { id:'save-vault', ok:Number(targetSchema) < 5 || state?.saveVault?.format === 'F1M_SAVE_ENVELOPE_V2', detail:state?.saveVault?.format || 'ausente' },
      { id:'quality-gate', ok:Number(targetSchema) < 6 || Boolean(state?.quality?.ciGate) || Number(state?.architecture?.qualityGate || 0) >= 1, detail:Number(targetSchema) < 6 ? 'não exigido' : (state?.quality?.ciGate?.status || 'arquitetura registrada') },
      { id:'viewport-manager', ok:Number(targetSchema) < 7 || Boolean(state?.viewport?.safeAreaReady) || Number(state?.architecture?.viewportManager || 0) >= 1, detail:Number(targetSchema) < 7 ? 'não exigido' : (state?.viewport?.hudMode || 'auto') },
      { id:'i18n', ok:Number(targetSchema) < 8 || Boolean(state?.settings?.language) || Number(state?.architecture?.i18n || 0) >= 1, detail:Number(targetSchema) < 8 ? 'não exigido' : (state?.settings?.language || 'ausente') },
      { id:'sporting-db', ok:Number(targetSchema) < 9 || Boolean(state?.sporting?.activeCalendarBySeries) || Number(state?.architecture?.sportingDatabase || 0) >= 1, detail:Number(targetSchema) < 9 ? 'não exigido' : (state?.sporting?.dataPack || 'registrado') },
      { id:'regulation-engine', ok:Number(targetSchema) < 10 || Boolean(state?.regulations?.officialClassification) || Number(state?.architecture?.regulationEngine || 0) >= 1, detail:Number(targetSchema) < 10 ? 'não exigido' : (state?.regulations?.dataPack || 'registrado') },
      { id:'vehicle-physics', ok:Number(targetSchema) < 11 || Boolean(state?.vehiclePhysics?.tyreTemperature) || Number(state?.architecture?.vehiclePhysics || 0) >= 1, detail:Number(targetSchema) < 11 ? 'não exigido' : (state?.vehiclePhysics?.dataPack || 'registrado') },
      { id:'strategy-ai', ok:Number(targetSchema) < 12 || Boolean(state?.strategyAI?.undercutOvercut) || Number(state?.architecture?.strategyAI || 0) >= 1, detail:Number(targetSchema) < 12 ? 'não exigido' : (state?.strategyAI?.dataPack || 'registrado') },
      { id:'balance-simulator', ok:Number(targetSchema) < 13 || Boolean(state?.balance?.monteCarlo) || Number(state?.architecture?.balanceSimulator || 0) >= 1, detail:Number(targetSchema) < 13 ? 'não exigido' : (state?.balance?.dataPack || 'registrado') },
      { id:'visual3d', ok:Number(targetSchema) < 14 || Boolean(state?.visual3d?.realTrackWidth) || Number(state?.architecture?.visual3d || 0) >= 1, detail:Number(targetSchema) < 14 ? 'não exigido' : (state?.visual3d?.dataPack || 'registrado') },
      { id:'audio-ui', ok:Number(targetSchema) < 15 || Boolean(state?.audioUI?.proceduralAudio) || Number(state?.architecture?.audioUI || 0) >= 1, detail:Number(targetSchema) < 15 ? 'não exigido' : (state?.audioUI?.dataPack || 'registrado') },
      { id:'living-career', ok:Number(targetSchema) < 16 || Boolean(state?.livingCareer?.multiSeasonProjection) || Number(state?.architecture?.livingCareer || 0) >= 1, detail:Number(targetSchema) < 16 ? 'não exigido' : (state?.livingCareer?.dataPack || 'registrado') },
      { id:'backend-launch', ok:Number(targetSchema) < 17 || Boolean(state?.backendLaunch?.cloudSaveAdapterReady) || Number(state?.architecture?.backendLaunch || 0) >= 1, detail:Number(targetSchema) < 17 ? 'não exigido' : (state?.backendLaunch?.dataPack || 'registrado') },
      { id:'release-candidate', ok:Number(targetSchema) < 18 || Boolean(state?.releaseCandidate?.legalReviewRequired) || Number(state?.architecture?.releaseCandidate || 0) >= 1, detail:Number(targetSchema) < 18 ? 'não exigido' : (state?.releaseCandidate?.dataPack || 'registrado') },
      { id:'deployment-validation', ok:Number(targetSchema) < 19 || Boolean(state?.deployment?.productionBlocked) || Number(state?.architecture?.deploymentValidation || 0) >= 1, detail:Number(targetSchema) < 19 ? 'não exigido' : (state?.deployment?.dataPack || 'registrado') },
      { id:'beta-operations', ok:Number(targetSchema) < 20 || Boolean(state?.operations?.productionBlocked) || Number(state?.architecture?.betaOperations || 0) >= 1, detail:Number(targetSchema) < 20 ? 'não exigido' : (state?.operations?.dataPack || 'registrado') },
      { id:'asset-restore-f21', ok:Number(targetSchema) < 21 || Boolean(state?.assetRestore?.productionBlocked) || Number(state?.architecture?.assetRestoreF21 || 0) >= 1, detail:Number(targetSchema) < 21 ? 'não exigido' : (state?.assetRestore?.dataPack || 'registrado') },
      { id:'visual-hotfix-f22', ok:Number(targetSchema) < 22 || Boolean(state?.visualHotfix?.productionBlocked) || Number(state?.architecture?.visualHotfixF22 || 0) >= 1, detail:Number(targetSchema) < 22 ? 'não exigido' : (state?.visualHotfix?.dataPack || 'registrado') },
      { id:'public-beta-assets-f23', ok:Number(targetSchema) < 23 || Boolean(state?.publicBetaAssets?.productionBlocked) || Number(state?.architecture?.publicBetaAssetsF23 || 0) >= 1, detail:Number(targetSchema) < 23 ? 'não exigido' : (state?.publicBetaAssets?.dataPack || 'registrado') },
      { id:'gameplay-polish-f24', ok:Number(targetSchema) < 24 || Boolean(state?.gameplayPolish?.productionBlocked) || Number(state?.architecture?.gameplayPolishF24 || 0) >= 1, detail:Number(targetSchema) < 24 ? 'não exigido' : (state?.gameplayPolish?.dataPack || 'registrado') },
      { id:'telemetry-f25', ok:Number(targetSchema) < 25 || Boolean(state?.telemetry?.enabled) || Number(state?.architecture?.telemetryF25 || 0) >= 1, detail:Number(targetSchema) < 25 ? 'não exigido' : (state?.telemetry?.dataPack || 'registrado') },
      { id:'setup-engineering-f26', ok:Number(targetSchema) < 26 || Boolean(state?.setupEngineering?.productionBlocked) || Number(state?.architecture?.setupEngineeringF26 || 0) >= 1, detail:Number(targetSchema) < 26 ? 'não exigido' : (state?.setupEngineering?.dataPack || 'registrado') },
      { id:'tyre-stint-f27', ok:Number(targetSchema) < 27 || Boolean(state?.tyreStint?.productionBlocked) || Number(state?.architecture?.tyreStintF27 || 0) >= 1, detail:Number(targetSchema) < 27 ? 'não exigido' : (state?.tyreStint?.dataPack || 'registrado') }
    ];
    return { ok:checks.every(check => check.ok), checks };
  }

  core.career = Object.freeze({ createInitialState, migrateState, validateState });
})();
