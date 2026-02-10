export interface TimeSyncProt {
  yes: string | null;
  sntp: string | null;
  iec61850_9_3: string | null;
  c37_238: string | null;
  other: string | null;
}

export interface IEDServices {
  logSettings: {
    cbName: string | null;
    datSet: string | null;
    logEna: string | null;
    trgOps: string | null;
    intgPd: string | null;
  };

  confLogControl: {
    max: string | null;
  };

  clientServices: {
    goose: string | null;
    gsse: string | null;
    bufReport: string | null;
    unbufReport: string | null;
    readLog: string | null;
    sv: string | null;
    supportsLdName: string | null;
    rGOOSE: string | null;
    rSV: string | null;
    noIctBinding: string | null;

    maxAttributes: string | null;
    maxReports: string | null;
    maxGOOSE: string | null;
    maxSMV: string | null;

    timeSyncProt: TimeSyncProt | null;

    mcSecurity: {
      signature: string | null;
      encryption: string | null;
    } | null;
  };

  dataSet: {
    max: string | null;
    maxAttributes: string | null;
    modify: string | null;
  };

  settingGroups: {
    sgEdit: string | null;
    confSG: string | null;
  };

  reportSettings: {
    cbName: string | null;
    datSet: string | null;
    rptID: string | null;
    optFields: string | null;
    bufTime: string | null;
    trgOps: string | null;
    intgPd: string | null;
    resvTms: string | null;
    owner: string | null;
  };

  confReportControl: {
    max: string | null;
    bufMode: string | null;
    maxBuf: string | null;
    bufConf: string | null;
  };

  dynDataSet: {
    max: string | null;
    maxAttributes: string | null;
  };

  gseSettings: {
    cbName: string | null;
    datSet: string | null;
    appID: string | null;
    dataLabel: string | null;
    kdaParticipant: string | null;
    signature: string | null;
    encryption: string | null;
  };

  goose: {
    max: string | null;
    fixedOffs: string | null;
    goose: string | null;
    rGOOSE: string | null;
  };

  supSubscription: {
    maxGo: string | null;
    maxSv: string | null;
  };

  gsse: {
    max: string | null;
  };

  fileHandling: {
    mms: string | null;
    ftp: string | null;
    ftps: string | null;
  };

  timeSyncProt: TimeSyncProt | null;

  redProt: {
    hsr: string | null;
    prp: string | null;
    rstp: string | null;
  };

  commProt: {
    ipv6: string | null;
  };

  smvSettings: {
    cbName: string | null;
    datSet: string | null;
    svID: string | null;
    optFields: string | null;
    smpRate: string | null;
    nofASDU: string | null;
    samplesPerSec: string | null;
    synchSrcId: string | null;
    pdcTimeStamp: string | null;
    kdaParticipant: string | null;

    mcSecurity: {
      signature: string | null;
      encryption: string | null;
    } | null;

    smpRateVal: string | null;
    samplesPerSecVal: string | null;
    secPerSamplesVal: string | null;
  };

  smvPublisher: {
    max: string | null;
    delivery: string | null;
    deliveryConf: string | null;
    sv: string | null;
    rSV: string | null;
  };

  dynamicAssociations: {
    max: string | null;
  };

  discoverCapabilities: {
    getDirectory: string | null;
    getDataObjectDefinition: string | null;
    dataObjectDirectory: string | null;
    getDataSetValue: string | null;
    setDataSetValue: string | null;
    setDataSetDirectory: string | null;
    readWrite: string | null;
  };

  functionalNaming: {
    confLdName: string | null;
    supportsLdName: string | null;
  };

  clientCapabilities: {
    maxAttributes: string | null;
    timerActivatedControl: string | null;
    getCBValues: string | null;
    GSEDir: string | null;
  };

  valKindManipulationConfig: {
    setToRO: string | null;
  };

  signalReferenceConfig: {
    max: string | null;
  };
}

export function extractServicesData(ied: Element): IEDServices | null {
  const services = ied.querySelector('Services');
  if (!services) {
    return null;
  }

  const logSettings = services.querySelector('LogSettings');
  const confLogControl = services.querySelector('ConfLogControl');
  const reportSettings = services.querySelector('ReportSettings');
  const confReportControl = services.querySelector('ConfReportControl');
  const clientServices = services.querySelector('ClientServices');
  const csTimeSyncProt = clientServices?.querySelector('TimeSyncProt');
  const csMcSecurity = clientServices?.querySelector('McSecurity');
  const dynDataSet = services.querySelector('DynDataSet');

  const gseSettings = services.querySelector('GSESettings');
  const gseSettingsMcSecurity = gseSettings?.querySelector('McSecurity');
  const goose = services.querySelector('GOOSE');
  const supSubscription = services.querySelector('SupSubscription');
  const gsse = services.querySelector('GSSE');

  const fileHandling = services.querySelector('FileHandling');
  const timeSyncProt = services.querySelector('TimeSyncProt');
  const redProt = services.querySelector('RedProt');
  const commProt = services.querySelector('CommProt');

  const smvSettings = services.querySelector('SMVSettings');
  const smvMcSecurity = smvSettings?.querySelector('McSecurity');
  const smvPublisher = services.querySelector('SMVsc');

  const dynAssociation = services.querySelector('DynAssociation');

  return {
    logSettings: {
      cbName: logSettings?.getAttribute('cbName') ?? null,
      datSet: logSettings?.getAttribute('datSet') ?? null,
      logEna: logSettings?.getAttribute('logEna') ?? null,
      trgOps: logSettings?.getAttribute('trgOps') ?? null,
      intgPd: logSettings?.getAttribute('intgPd') ?? null,
    },
    confLogControl: {
      max: confLogControl?.getAttribute('max') ?? null,
    },
    clientServices: {
      goose: clientServices?.getAttribute('goose') ?? null,
      gsse: clientServices?.getAttribute('gsse') ?? null,
      bufReport: clientServices?.getAttribute('bufReport') ?? null,
      unbufReport: clientServices?.getAttribute('unbufReport') ?? null,
      readLog: clientServices?.getAttribute('readLog') ?? null,
      sv: clientServices?.getAttribute('sv') ?? null,
      supportsLdName: clientServices?.getAttribute('supportsLdName') ?? null,
      rGOOSE: clientServices?.getAttribute('rGOOSE') ?? null,
      rSV: clientServices?.getAttribute('rSV') ?? null,
      noIctBinding: clientServices?.getAttribute('noIctBinding') ?? null,

      maxAttributes: clientServices?.getAttribute('maxAttributes') ?? null,
      maxReports: clientServices?.getAttribute('maxReports') ?? null,
      maxGOOSE: clientServices?.getAttribute('maxGOOSE') ?? null,
      maxSMV: clientServices?.getAttribute('maxSMV') ?? null,

      timeSyncProt: csTimeSyncProt
        ? {
            yes: csTimeSyncProt.getAttribute('yes') ?? null,
            sntp: csTimeSyncProt.getAttribute('sntp') ?? null,
            iec61850_9_3: csTimeSyncProt.getAttribute('iec61850_9_3') ?? null,
            c37_238: csTimeSyncProt.getAttribute('c37_238') ?? null,
            other: csTimeSyncProt.getAttribute('other') ?? null,
          }
        : null,

      mcSecurity: csMcSecurity
        ? {
            signature: csMcSecurity.getAttribute('signature') ?? null,
            encryption: csMcSecurity.getAttribute('encryption') ?? null,
          }
        : null,
    },

    dataSet: {
      max:
        services.querySelector('ConfDataSet')?.getAttribute('max') ??
        String(services.parentElement?.querySelectorAll('DataSet').length ?? 0),
      maxAttributes:
        services.querySelector('ConfDataSet')?.getAttribute('maxAttributes') ??
        null,
      modify:
        services.querySelector('ConfDataSet')?.getAttribute('modify') ?? 'true',
    },
    settingGroups: {
      sgEdit:
        services
          .querySelector('SettingGroups > SGEdit')
          ?.getAttribute('resvTms') ?? null,
      confSG:
        services
          .querySelector('SettingGroups > ConfSG')
          ?.getAttribute('resvTms') ?? null,
    },

    reportSettings: {
      cbName: reportSettings?.getAttribute('cbName') ?? null,
      datSet: reportSettings?.getAttribute('datSet') ?? null,
      rptID: reportSettings?.getAttribute('rptID') ?? null,
      optFields: reportSettings?.getAttribute('optFields') ?? null,
      bufTime: reportSettings?.getAttribute('bufTime') ?? null,
      trgOps: reportSettings?.getAttribute('trgOps') ?? null,
      intgPd: reportSettings?.getAttribute('intgPd') ?? null,
      resvTms: reportSettings?.getAttribute('resvTms') ?? null,
      owner: reportSettings?.getAttribute('owner') ?? null,
    },

    confReportControl: {
      max: confReportControl?.getAttribute('max') ?? null,
      bufMode: confReportControl?.getAttribute('bufMode') ?? null,
      maxBuf: confReportControl?.getAttribute('maxBuf') ?? null,
      bufConf: confReportControl?.getAttribute('bufConf') ?? null,
    },

    dynDataSet: {
      max: dynDataSet?.getAttribute('max') ?? null,
      maxAttributes: dynDataSet?.getAttribute('maxAttributes') ?? null,
    },

    gseSettings: {
      cbName: gseSettings?.getAttribute('cbName') ?? null,
      datSet: gseSettings?.getAttribute('datSet') ?? null,
      appID: gseSettings?.getAttribute('appID') ?? null,
      dataLabel: gseSettings?.getAttribute('dataLabel') ?? null,
      kdaParticipant: gseSettings?.getAttribute('kdaParticipant') ?? null,
      signature: gseSettingsMcSecurity?.getAttribute('signature') ?? null,
      encryption: gseSettingsMcSecurity?.getAttribute('encryption') ?? null,
    },

    goose: {
      max: goose?.getAttribute('max') ?? null,
      fixedOffs: goose?.getAttribute('fixedOffs') ?? null,
      goose: goose?.getAttribute('goose') ?? null,
      rGOOSE: goose?.getAttribute('rGOOSE') ?? null,
    },

    supSubscription: {
      maxGo: supSubscription?.getAttribute('maxGo') ?? null,
      maxSv: supSubscription?.getAttribute('maxSv') ?? null,
    },

    gsse: {
      max: gsse?.getAttribute('max') ?? null,
    },

    fileHandling: {
      mms: fileHandling?.getAttribute('mms') ?? null,
      ftp: fileHandling?.getAttribute('ftp') ?? null,
      ftps: fileHandling?.getAttribute('ftps') ?? null,
    },

    timeSyncProt: timeSyncProt
      ? {
          yes: timeSyncProt.getAttribute('yes') ?? null,
          sntp: timeSyncProt.getAttribute('sntp') ?? null,
          iec61850_9_3: timeSyncProt.getAttribute('iec61850_9_3') ?? null,
          c37_238: timeSyncProt.getAttribute('c37_238') ?? null,
          other: timeSyncProt.getAttribute('other') ?? null,
        }
      : null,

    redProt: {
      hsr: redProt?.getAttribute('hsr') ?? null,
      prp: redProt?.getAttribute('prp') ?? null,
      rstp: redProt?.getAttribute('rstp') ?? null,
    },

    commProt: {
      ipv6: commProt?.getAttribute('ipv6') ?? null,
    },

    smvSettings: {
      cbName: smvSettings?.getAttribute('cbName') ?? null,
      datSet: smvSettings?.getAttribute('datSet') ?? null,
      svID: smvSettings?.getAttribute('svID') ?? null,
      optFields: smvSettings?.getAttribute('optFields') ?? null,
      smpRate: smvSettings?.getAttribute('smpRate') ?? null,
      nofASDU: smvSettings?.getAttribute('nofASDU') ?? null,
      samplesPerSec: smvSettings?.getAttribute('samplesPerSec') ?? null,
      synchSrcId: smvSettings?.getAttribute('synchSrcId') ?? null,
      pdcTimeStamp: smvSettings?.getAttribute('pdcTimeStamp') ?? null,
      kdaParticipant: smvSettings?.getAttribute('kdaParticipant') ?? null,

      mcSecurity: smvMcSecurity
        ? {
            signature: smvMcSecurity.getAttribute('signature') ?? null,
            encryption: smvMcSecurity.getAttribute('encryption') ?? null,
          }
        : null,

      smpRateVal: smvSettings?.querySelector('SmpRate')?.textContent ?? null,
      samplesPerSecVal:
        smvSettings?.querySelector('SamplesPerSec')?.textContent ?? null,
      secPerSamplesVal:
        smvSettings?.querySelector('SecPerSamples')?.textContent ?? null,
    },

    smvPublisher: {
      max: smvPublisher?.getAttribute('max') ?? null,
      delivery: smvPublisher?.getAttribute('delivery') ?? null,
      deliveryConf: smvPublisher?.getAttribute('deliveryConf') ?? null,
      sv: smvPublisher?.getAttribute('sv') ?? null,
      rSV: smvPublisher?.getAttribute('rSV') ?? null,
    },

    dynamicAssociations: {
      max: dynAssociation?.getAttribute('max') ?? null,
    },

    discoverCapabilities: {
      getDirectory: services.querySelector('GetDirectory') ? 'true' : null,
      getDataObjectDefinition: services.querySelector('GetDataObjectDefinition')
        ? 'true'
        : null,
      dataObjectDirectory: services.querySelector('DataObjectDirectory')
        ? 'true'
        : null,
      getDataSetValue: services.querySelector('GetDataSetValue')
        ? 'true'
        : null,
      setDataSetValue: services.querySelector('SetDataSetValue')
        ? 'true'
        : null,
      setDataSetDirectory: services.querySelector('DataSetDirectory')
        ? 'true'
        : null,
      readWrite: services.querySelector('ReadWrite') ? 'true' : null,
    },

    functionalNaming: {
      confLdName: services.querySelector('ConfLdName') ? 'true' : null,
      supportsLdName: clientServices?.getAttribute('supportsLdName') ?? null,
    },

    clientCapabilities: {
      maxAttributes: clientServices?.getAttribute('maxAttributes') ?? null,
      timerActivatedControl: services.querySelector('TimerActivatedControl')
        ? 'true'
        : null,
      getCBValues: services.querySelector('GetCBValues') ? 'true' : null,
      GSEDir: services.querySelector('GSEDir') ? 'true' : null,
    },

    valKindManipulationConfig: {
      setToRO:
        services.querySelector('ValueHandling')?.getAttribute('setToRO') ??
        null,
    },

    signalReferenceConfig: {
      max: services.querySelector('ConfSigRef')?.getAttribute('max') ?? null,
    },
  };
}
