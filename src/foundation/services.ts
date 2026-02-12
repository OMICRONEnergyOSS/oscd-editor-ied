export interface TimeSyncProt {
  yes: string | null;
  sntp: string | null;
  iec61850_9_3: string | null;
  c37_238: string | null;
  other: string | null;
}

export interface Services {
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

function attr(el: Element | null, name: string): string | null {
  return el?.getAttribute(name) ?? null;
}

function hasChild(parent: Element, childSelector: string): 'true' | null {
  return parent.querySelector(childSelector) ? 'true' : null;
}

export function extractServicesData(element: Element): Services | null {
  const services = element.querySelector(':scope > Services');
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
  const gseSettingsMcSecurity =
    gseSettings?.querySelector('McSecurity') ?? null;
  const goose = services.querySelector('GOOSE');
  const supSubscription = services.querySelector('SupSubscription');
  const gsse = services.querySelector('GSSE');

  const fileHandling = services.querySelector('FileHandling');
  const timeSyncProt = services.querySelector('TimeSyncProt');
  const redProt = services.querySelector('RedProt');
  const commProt = services.querySelector('CommProt');

  const smvSettings = services.querySelector('SMVSettings');
  const smvMcSecurity = smvSettings?.querySelector('McSecurity') ?? null;
  const smvPublisher = services.querySelector('SMVsc');

  const dynAssociation = services.querySelector('DynAssociation');

  return {
    logSettings: {
      cbName: attr(logSettings, 'cbName'),
      datSet: attr(logSettings, 'datSet'),
      logEna: attr(logSettings, 'logEna'),
      trgOps: attr(logSettings, 'trgOps'),
      intgPd: attr(logSettings, 'intgPd'),
    },
    confLogControl: {
      max: attr(confLogControl, 'max'),
    },
    clientServices: {
      goose: attr(clientServices, 'goose'),
      gsse: attr(clientServices, 'gsse'),
      bufReport: attr(clientServices, 'bufReport'),
      unbufReport: attr(clientServices, 'unbufReport'),
      readLog: attr(clientServices, 'readLog'),
      sv: attr(clientServices, 'sv'),
      supportsLdName: attr(clientServices, 'supportsLdName'),
      rGOOSE: attr(clientServices, 'rGOOSE'),
      rSV: attr(clientServices, 'rSV'),
      noIctBinding: attr(clientServices, 'noIctBinding'),
      maxAttributes: attr(clientServices, 'maxAttributes'),
      maxReports: attr(clientServices, 'maxReports'),
      maxGOOSE: attr(clientServices, 'maxGOOSE'),
      maxSMV: attr(clientServices, 'maxSMV'),
      timeSyncProt: csTimeSyncProt
        ? {
            yes: attr(csTimeSyncProt, 'yes'),
            sntp: attr(csTimeSyncProt, 'sntp'),
            iec61850_9_3: attr(csTimeSyncProt, 'iec61850_9_3'),
            c37_238: attr(csTimeSyncProt, 'c37_238'),
            other: attr(csTimeSyncProt, 'other'),
          }
        : null,

      mcSecurity: csMcSecurity
        ? {
            signature: attr(csMcSecurity, 'signature'),
            encryption: attr(csMcSecurity, 'encryption'),
          }
        : null,
    },

    dataSet: {
      max:
        attr(services.querySelector('ConfDataSet'), 'max') ??
        String(services.parentElement?.querySelectorAll('DataSet').length ?? 0),
      maxAttributes: attr(
        services.querySelector('ConfDataSet'),
        'maxAttributes',
      ),
      modify: attr(services.querySelector('ConfDataSet'), 'modify') ?? 'true',
    },
    settingGroups: {
      sgEdit: attr(services.querySelector('SettingGroups > SGEdit'), 'resvTms'),
      confSG: attr(services.querySelector('SettingGroups > ConfSG'), 'resvTms'),
    },

    reportSettings: {
      cbName: attr(reportSettings, 'cbName'),
      datSet: attr(reportSettings, 'datSet'),
      rptID: attr(reportSettings, 'rptID'),
      optFields: attr(reportSettings, 'optFields'),
      bufTime: attr(reportSettings, 'bufTime'),
      trgOps: attr(reportSettings, 'trgOps'),
      intgPd: attr(reportSettings, 'intgPd'),
      resvTms: attr(reportSettings, 'resvTms'),
      owner: attr(reportSettings, 'owner'),
    },

    confReportControl: {
      max: attr(confReportControl, 'max'),
      bufMode: attr(confReportControl, 'bufMode'),
      maxBuf: attr(confReportControl, 'maxBuf'),
      bufConf: attr(confReportControl, 'bufConf'),
    },

    dynDataSet: {
      max: attr(dynDataSet, 'max'),
      maxAttributes: attr(dynDataSet, 'maxAttributes'),
    },

    gseSettings: {
      cbName: attr(gseSettings, 'cbName'),
      datSet: attr(gseSettings, 'datSet'),
      appID: attr(gseSettings, 'appID'),
      dataLabel: attr(gseSettings, 'dataLabel'),
      kdaParticipant: attr(gseSettings, 'kdaParticipant'),
      signature: attr(gseSettingsMcSecurity, 'signature'),
      encryption: attr(gseSettingsMcSecurity, 'encryption'),
    },

    goose: {
      max: attr(goose, 'max'),
      fixedOffs: attr(goose, 'fixedOffs'),
      goose: attr(goose, 'goose'),
      rGOOSE: attr(goose, 'rGOOSE'),
    },

    supSubscription: {
      maxGo: attr(supSubscription, 'maxGo'),
      maxSv: attr(supSubscription, 'maxSv'),
    },

    gsse: {
      max: attr(gsse, 'max'),
    },

    fileHandling: {
      mms: attr(fileHandling, 'mms'),
      ftp: attr(fileHandling, 'ftp'),
      ftps: attr(fileHandling, 'ftps'),
    },

    timeSyncProt: timeSyncProt
      ? {
          yes: attr(timeSyncProt, 'yes'),
          sntp: attr(timeSyncProt, 'sntp'),
          iec61850_9_3: attr(timeSyncProt, 'iec61850_9_3'),
          c37_238: attr(timeSyncProt, 'c37_238'),
          other: attr(timeSyncProt, 'other'),
        }
      : null,

    redProt: {
      hsr: attr(redProt, 'hsr'),
      prp: attr(redProt, 'prp'),
      rstp: attr(redProt, 'rstp'),
    },

    commProt: {
      ipv6: attr(commProt, 'ipv6'),
    },

    smvSettings: {
      cbName: attr(smvSettings, 'cbName'),
      datSet: attr(smvSettings, 'datSet'),
      svID: attr(smvSettings, 'svID'),
      optFields: attr(smvSettings, 'optFields'),
      smpRate: attr(smvSettings, 'smpRate'),
      nofASDU: attr(smvSettings, 'nofASDU'),
      samplesPerSec: attr(smvSettings, 'samplesPerSec'),
      synchSrcId: attr(smvSettings, 'synchSrcId'),
      pdcTimeStamp: attr(smvSettings, 'pdcTimeStamp'),
      kdaParticipant: attr(smvSettings, 'kdaParticipant'),

      mcSecurity: smvMcSecurity
        ? {
            signature: attr(smvMcSecurity, 'signature'),
            encryption: attr(smvMcSecurity, 'encryption'),
          }
        : null,

      smpRateVal: smvSettings?.querySelector('SmpRate')?.textContent ?? null,
      samplesPerSecVal:
        smvSettings?.querySelector('SamplesPerSec')?.textContent ?? null,
      secPerSamplesVal:
        smvSettings?.querySelector('SecPerSamples')?.textContent ?? null,
    },

    smvPublisher: {
      max: attr(smvPublisher, 'max'),
      delivery: attr(smvPublisher, 'delivery'),
      deliveryConf: attr(smvPublisher, 'deliveryConf'),
      sv: attr(smvPublisher, 'sv'),
      rSV: attr(smvPublisher, 'rSV'),
    },

    dynamicAssociations: {
      max: attr(dynAssociation, 'max'),
    },

    discoverCapabilities: {
      getDirectory: hasChild(services, 'GetDirectory'),
      getDataObjectDefinition: hasChild(services, 'GetDataObjectDefinition'),
      dataObjectDirectory: hasChild(services, 'DataObjectDirectory'),
      getDataSetValue: hasChild(services, 'GetDataSetValue'),
      setDataSetValue: hasChild(services, 'SetDataSetValue'),
      setDataSetDirectory: hasChild(services, 'DataSetDirectory'),
      readWrite: hasChild(services, 'ReadWrite'),
    },

    functionalNaming: {
      confLdName: hasChild(services, 'ConfLdName'),
      supportsLdName: attr(clientServices, 'supportsLdName'),
    },

    clientCapabilities: {
      maxAttributes: attr(clientServices, 'maxAttributes'),
      timerActivatedControl: hasChild(services, 'TimerActivatedControl'),
      getCBValues: hasChild(services, 'GetCBValues'),
      GSEDir: hasChild(services, 'GSEDir'),
    },

    valKindManipulationConfig: {
      setToRO: attr(services.querySelector('ValueHandling'), 'setToRO'),
    },

    signalReferenceConfig: {
      max: attr(services.querySelector('ConfSigRef'), 'max'),
    },
  };
}
