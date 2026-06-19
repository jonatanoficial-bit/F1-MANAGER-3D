globalThis.F1M_VISUAL_DATA = Object.freeze({
  schema: 1,
  phase: 14,
  rendererName: 'F14 Professional Track Presentation',
  trackModel: {
    widthMeters: 12.5,
    shoulderMeters: 1.2,
    pitLaneWidthMeters: 5.0,
    elevationAmplitudeMeters: 9.5,
    bankingDegrees: 5.0,
    sectorCount: 3,
    drsZones: 2,
    racingLines: ['ideal', 'inside', 'outside', 'defensive']
  },
  scale: {
    metersPerWorldUnit: 6.5,
    minWorldWidth: 4.6,
    maxWorldWidth: 6.4
  },
  qualityProfiles: {
    low: { maxCarsHighDetail: 10, trackSamples: 160, environmentObjects: 28, particles: 18, shadows: false },
    medium: { maxCarsHighDetail: 18, trackSamples: 240, environmentObjects: 58, particles: 42, shadows: false },
    high: { maxCarsHighDetail: 26, trackSamples: 320, environmentObjects: 90, particles: 80, shadows: true }
  },
  cameraPresets: {
    tv: { label: 'TV dinâmica', height: 18, distance: 16, stiffness: 0.025 },
    follow: { label: 'Follow cam', height: 8, distance: 10, stiffness: 0.055 },
    overhead: { label: 'Helicóptero', height: 43, distance: 2, stiffness: 0.035 },
    onboard: { label: 'Onboard', height: 1.15, distance: 1.6, stiffness: 0.18 },
    pitwall: { label: 'Pit wall', height: 7, distance: 22, stiffness: 0.04 },
    replay: { label: 'Replay', height: 13, distance: 18, stiffness: 0.06 }
  },
  replay: {
    enabled: true,
    maxFrames: 420,
    captureEveryTicks: 0.38,
    markers: ['overtake', 'pit', 'incident', 'safety-car', 'restart', 'finish']
  },
  visualSystems: {
    realTrackWidth: true,
    elevationMesh: true,
    pitLaneAndBoxes: true,
    sectorBoards: true,
    drsZoneMarkers: true,
    racingLineOverlay: true,
    carLod: true,
    damageVisuals: true,
    rainAndSpray: true,
    tvCameras: true,
    onboardCamera: true,
    pitWallCamera: true,
    replayBuffer: true,
    rendererDisposal: true,
    noBinaryAssetsRequired: true
  },
  legal: {
    mode: 'procedural-original',
    note: 'Elementos visuais 3D gerados por código, sem marcas, logos, modelos proprietários ou assets binários pesados no ZIP.'
  }
});
