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
export declare function extractServicesData(ied: Element): IEDServices | null;
