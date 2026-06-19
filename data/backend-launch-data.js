(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 17,
    dataPack: 'backend-launch-foundation-2026-06-19',
    mode: 'adapter-ready-offline-first',
    accounts: {
      status: 'adapter-ready',
      authModes: ['guest-local', 'email-provider-adapter', 'platform-id-adapter'],
      rules: ['no-password-storage-in-client', 'token-only-session', 'guest-upgrade-path', 'parental-gate-ready'],
      userProfileFields: ['managerId', 'displayName', 'locale', 'createdAt', 'lastSeenAt']
    },
    cloudSave: {
      status: 'planned-adapter',
      enabledByDefault: false,
      envelope: 'F1M_PORTABLE_SAVE_V1',
      syncQueue: 'F1M_SYNC_QUEUE_V1',
      conflictPolicies: ['newest-valid', 'highest-season-progress', 'manual-choice', 'keep-both-copy'],
      checks: ['checksum', 'schema-migration', 'build-compatibility', 'backup-before-import']
    },
    telemetry: {
      status: 'consent-required',
      defaultEnabled: false,
      consentVersion: 'F1M_TELEMETRY_CONSENT_V1',
      events: ['app_start', 'screen_view', 'race_completed', 'crash_local', 'performance_budget', 'asset_placeholder_count'],
      privacy: ['no-sale-of-data', 'no-ads-targeting', 'anonymous-aggregate-first', 'exportable-local-report']
    },
    crashReporting: {
      status: 'local-buffer-ready',
      localKey: 'F1M_CRASH_BUFFER_V1',
      maxEntries: 30,
      redaction: ['email', 'token', 'raw-save-payload'],
      upload: 'disabled-until-consent-and-backend'
    },
    remoteConfig: {
      status: 'local-snapshot-ready',
      schema: 'F1M_REMOTE_CONFIG_V1',
      keys: ['maintenanceMode', 'minimumBuild', 'newsBanner', 'balancePatch', 'featureFlags', 'rollbackBuild'],
      fallback: 'config/local-release-config.json'
    },
    rollback: {
      status: 'manifest-ready',
      policies: ['disable-new-feature-flag', 'restore-previous-app-shell', 'safe-save-migration', 'preserve-user-save-before-downgrade'],
      protectedSchemas: [15, 16, 17]
    },
    security: {
      posture: 'client-hardening-foundation',
      threatModel: ['save-tampering', 'asset-path-traversal', 'xss-via-import', 'remote-config-injection', 'telemetry-leakage'],
      controls: ['checksum-save', 'path-normalization', 'html-escape-on-import', 'consent-gate', 'no-secrets-in-client', 'csp-ready'],
      legalMode: 'requires-professional-review-before-commercial-release'
    },
    releaseChannels: [
      { id:'alpha', label:'Alpha interna', gates:['npm-audit-zero-critical','core-flow-pass','save-migration-pass'] },
      { id:'beta', label:'Beta fechado', gates:['mobile-horizontal-pass','pwa-install-test','privacy-copy-ready'] },
      { id:'rc', label:'Release Candidate', gates:['store-assets-ready','classification-age-review','backend-adapter-ready'] },
      { id:'production', label:'Produção', gates:['legal-review-complete','platform-review-complete','support-sla-ready'] }
    ],
    platformTargets: [
      { id:'pwa', label:'PWA / Web', required:['manifest','service-worker','offline-shell','https'] },
      { id:'android', label:'Android', required:['signed-bundle','fullscreen-immersive','privacy-label','age-rating'] },
      { id:'ios', label:'iOS', required:['safe-area','app-store-privacy','icloud-or-cloud-save-policy','age-rating'] },
      { id:'windows', label:'Windows', required:['desktop-fullscreen','installer-plan','crash-log-export','privacy-policy'] }
    ],
    storeReadiness: {
      requiredDocs: ['privacy-policy', 'terms-of-use', 'support-contact', 'age-rating-questionnaire', 'license-review', 'open-source-notices'],
      requiredAssets: ['icon-512', 'splash', 'screenshots-phone', 'screenshots-tablet', 'feature-graphic'],
      monetization: 'not-enabled-in-build'
    },
    liveOps: {
      status: 'planned-control-plane',
      features: ['news', 'seasonal-balance-patch', 'server-message', 'remote-maintenance', 'rollback-switch', 'support-diagnostics'],
      cadence: 'manual-release-only-until-backend'
    },
    auditTargets: {
      minReleaseChannels: 4,
      minPlatformTargets: 4,
      minSecurityControls: 6,
      minTelemetryEvents: 5,
      minStoreDocs: 5,
      requiredSystems: ['accounts','cloud-save','conflict-resolution','telemetry-consent','crash-reporting','remote-config','rollback','security','alpha-beta-rc','platform-targets','privacy','age-rating','support','live-ops']
    }
  });
  globalThis.F1M_BACKEND_LAUNCH_DATA = data;
})();
