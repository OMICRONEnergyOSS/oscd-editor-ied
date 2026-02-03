<?xml version="1.0" encoding="UTF-8"?>
<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B">
    <Header id="development sample"/>
    <Substation name="S1">
        <VoltageLevel name="V1" >
            <Bay name="B2" />
            <Bay name="B1" />
        </VoltageLevel>
    </Substation>
    <IED name="IED1" manufacturer="OpenSCD">
        <AccessPoint name="AP1">
            <Server>
                <Authentication/>
                <LDevice inst="LD1">
                    <LN0 lnClass="LLN0" inst="" lnType="PlaceholderLLN0">
                        <SettingControl numOfSGs="2"/>
                        <DOI name="Beh">
                            <DAI name="stVal">
                                <Val>on</Val>
                            </DAI>
                            <DAI name="t">
                                <Val>2026-12-24T12:14:16.000</Val>
                            </DAI>
                        </DOI>
                    </LN0>
                </LDevice>
                <LDevice inst="LD2">
                    <LN0 lnClass="LLN0" lnType="PlaceholderLLN0" />
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <IED name="IED2" manufacturer="OpenSCD">
        <AccessPoint name="AP2">
            <Server>
                <Authentication/>
                <LDevice inst="LD2">
                    <LN0 lnClass="LLN0" inst="" lnType="PlaceholderLLN0"/>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <DataTypeTemplates>
        <LNodeType lnClass="LLN0" id="PlaceholderLLN0">
            <DO name="Beh" type="Beh_Test"/>
        </LNodeType>
        <DOType cdc="ENS" id="Beh_Test">
            <DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal$oscd$_48ba16345b8e7f5b">
                <Val>blocked</Val>
            </DA>
            <DA name="q" fc="ST" qchg="true" bType="Quality"/>
            <DA name="t" fc="ST" bType="Timestamp"/>
        </DOType>
        <EnumType id="stVal$oscd$_48ba16345b8e7f5b">
            <EnumVal ord="1">on</EnumVal>
            <EnumVal ord="2">blocked</EnumVal>
            <EnumVal ord="3">test</EnumVal>
            <EnumVal ord="4">test/blocked</EnumVal>
            <EnumVal ord="5">off</EnumVal>
        </EnumType>
    </DataTypeTemplates>
</SCL>
