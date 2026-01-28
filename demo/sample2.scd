<?xml version="1.0" encoding="UTF-8"?>
<SCL xmlns="http://www.iec.ch/61850/2003/SCL" xmlns:esld="https://transpower.co.nz/SCL/SSD/SLD/v0" version="2007" revision="B">
    <Header id="development sample"/>
    <Substation name="S1" esld:w="50" esld:h="25">
        <VoltageLevel name="V1" esld:x="1" esld:y="1" esld:lx="1" esld:ly="1" esld:w="48" esld:h="22">
            <Bay name="B2" esld:x="14" esld:y="2" esld:lx="14" esld:ly="2" esld:w="12" esld:h="20"/>
            <Bay name="B1" esld:x="2" esld:y="2" esld:lx="2" esld:ly="2" esld:w="11" esld:h="20"/>
        </VoltageLevel>
    </Substation>
    <IED name="test" manufacturer="OpenSCD">
        <Services>
            <ConfLdName/>
        </Services>
        <AccessPoint name="AP1">
            <Server>
                <Authentication/>
                <LDevice inst="LD1">
                    <LN0 lnClass="LLN0" inst="" lnType="PlaceholderLLN0"/>
                    <LN lnType="URPC74x_CTR-P" lnClass="TCTR" prefix="I01A" inst="1">
                        <DOI name="AmpSv">
                            <SDI name="sVC">
                                <DAI name="offset">
                                    <Val>1.1</Val>
                                </DAI>
                                <DAI name="scaleFactor">
                                    <Val>3.2</Val>
                                </DAI>
                            </SDI>
                            <SDI name="instMag">
                                <DAI name="i">
                                    <Val>3000</Val>
                                </DAI>
                            </SDI>
                            <SDI name="SubBeh">
                                <DAI name="stVal">
                                    <Val>on</Val>
                                </DAI>
                            </SDI>
                        </DOI>
                    </LN>
                </LDevice>
            </Server>
        </AccessPoint>
        <AccessPoint name="AP1_LN">
            <LN lnType="GGIO_Test" lnClass="GGIO" inst="1"/>
        </AccessPoint>
    </IED>
    <IED name="test2" manufacturer="OpenSCD">
        <Services>
            <ConfLdName/>
        </Services>
        <AccessPoint name="AP2">
            <Server>
                <Authentication/>
                <LDevice inst="LD2">
                    <LN0 lnClass="LLN0" inst="" lnType="PlaceholderLLN0"/>
                    <LN lnType="URPC74x_CTR-P" lnClass="TCTR" prefix="I01A" inst="1">
                        <DOI name="AmpSv">
                            <SDI name="sVC">
                                <DAI name="offset">
                                    <Val>1.1</Val>
                                </DAI>
                                <DAI name="scaleFactor">
                                    <Val>3.2</Val>
                                </DAI>
                            </SDI>
                            <SDI name="instMag">
                                <DAI name="i">
                                    <Val>3000</Val>
                                </DAI>
                            </SDI>
                            <SDI name="SubBeh">
                                <DAI name="stVal">
                                    <Val>on</Val>
                                </DAI>
                            </SDI>
                        </DOI>
                    </LN>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <IED name="test3" manufacturer="OpenSCD">
        <Services>
            <ConfLdName/>
        </Services>
        <AccessPoint name="AP3">
            <Server>
                <Authentication/>
                <LDevice inst="LD3">
                    <LN0 lnClass="LLN0" inst="" lnType="PlaceholderLLN0"/>
                    <LN lnType="URPC74x_CTR-P" lnClass="TCTR" prefix="I01A" inst="1">
                        <DOI name="AmpSv">
                            <SDI name="sVC">
                                <DAI name="offset">
                                    <Val>1.1</Val>
                                </DAI>
                                <DAI name="scaleFactor">
                                    <Val>3.2</Val>
                                </DAI>
                            </SDI>
                            <SDI name="instMag">
                                <DAI name="i">
                                    <Val>3000</Val>
                                </DAI>
                            </SDI>
                            <SDI name="SubBeh">
                                <DAI name="stVal">
                                    <Val>on</Val>
                                </DAI>
                            </SDI>
                        </DOI>
                    </LN>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <DataTypeTemplates>
        <LNodeType id="URPC74x_CTR-P" lnClass="TCTR">
            <DO name="AmpSv" type="URPC74x_AmpSv"/>
            <DO name="ARtg" type="URPC74x_ARtg"/>
        </LNodeType>
        <LNodeType lnClass="LLN0" id="PlaceholderLLN0">
            <DO name="Beh" type="Beh$oscd$_c6ed035c8137b35a"/>
        </LNodeType>
        <LNodeType lnClass="LLN0" id="AnotherPlaceholderLLN0">
            <DO name="Beh" type="Beh$oscd$_c6ed035c8137b35a"/>
        </LNodeType>
        <LNodeType lnClass="GGIO" id="GGIO_Test">
            <DO name="Beh" type="Beh$oscd$_GGIO_Test"/>
        </LNodeType>
        <LNodeType lnClass="XCBR" id="XCBR_Test">
            <DO name="Beh" type="Beh$oscd$_XCBR_Test"/>
        </LNodeType>
        <DOType id="URPC74x_AmpSv" cdc="SAV">
            <DA name="instMag" fc="MX" bType="Struct" valKind="Spec" type="URPC74x_AnalogueValue"/>
            <DA name="q" fc="MX" bType="Quality" valKind="Spec"/>
            <DA name="sVC" fc="CF" bType="Struct" type="URPC74x_AmpScaledValueCfg"/>
            <SDO name="SubBeh" type="Beh$oscd$_c6ed035c8137b35a"/>
        </DOType>
        <DOType id="URPC74x_ARtg" cdc="ASG">
            <DA name="setMag" fc="SE" bType="Struct" type="AnalogueValueCtl"/>
            <DA name="units" fc="CF" bType="Struct" type="Unit" dchg="true"/>
            <DA name="sVC" fc="CF" bType="Struct" type="ScaledValueConfig" dchg="true"/>
            <DA name="minVal" fc="CF" bType="Struct" type="AnalogueValue" dchg="true"/>
            <DA name="d" fc="DC" bType="VisString255"/>
            <DA name="dU" fc="DC" bType="Unicode255"/>
            <DA name="dataNs" fc="EX" bType="VisString255"/>
        </DOType>
        <DOType cdc="ENS" id="Beh$oscd$_c6ed035c8137b35a">
            <DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal$oscd$_48ba16345b8e7f5b"/>
            <DA name="q" fc="ST" qchg="true" bType="Quality"/>
            <DA name="t" fc="ST" bType="Timestamp"/>
        </DOType>
        <DOType cdc="ENS" id="Beh$oscd$_GGIO_Test">
            <DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal$oscd$_GGIO_Test"/>
            <DA name="q" fc="ST" qchg="true" bType="Quality"/>
            <DA name="t" fc="ST" bType="Timestamp"/>
        </DOType>
        <DOType cdc="ENS" id="Beh$oscd$_XCBR_Test">
            <DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal$oscd$_XCBR_Test"/>
            <DA name="q" fc="ST" qchg="true" bType="Quality"/>
            <DA name="t" fc="ST" bType="Timestamp"/>
        </DOType>
        <DAType id="URPC74x_AnalogueValue">
            <BDA name="i" bType="INT32"/>
        </DAType>
        <DAType id="URPC74x_AmpScaledValueCfg">
            <BDA name="scaleFactor" bType="FLOAT32" valKind="RO">
                <Val>0.001</Val>
            </BDA>
            <BDA name="offset" bType="FLOAT32" valKind="RO">
                <Val>0.0</Val>
            </BDA>
        </DAType>
        <DAType id="AnalogueValueCtl">
            <BDA name="i" bType="INT32"/>
        </DAType>
        <DAType id="AnalogueValue">
            <BDA name="i" bType="INT32"/>
        </DAType>
        <DAType id="ScaledValueConfig">
            <BDA name="scaleFactor" bType="FLOAT32" valKind="RO">
                <Val>0.001</Val>
            </BDA>
            <BDA name="offset" bType="FLOAT32" valKind="RO">
                <Val>0.0</Val>
            </BDA>
        </DAType>
        <DAType id="Unit">
            <BDA name="SIUnit" bType="Enum" type="SIUnitKind"/>
            <BDA name="multiplier" bType="Enum" type="MultiplierKind"/>
        </DAType>
        <EnumType id="stVal$oscd$_48ba16345b8e7f5b">
            <EnumVal ord="1">on</EnumVal>
            <EnumVal ord="2">blocked</EnumVal>
            <EnumVal ord="3">test</EnumVal>
            <EnumVal ord="4">test/blocked</EnumVal>
            <EnumVal ord="5">off</EnumVal>
        </EnumType>
        <EnumType id="stVal$oscd$_GGIO_Test">
            <EnumVal ord="1">on</EnumVal>
            <EnumVal ord="2">blocked</EnumVal>
            <EnumVal ord="3">test</EnumVal>
            <EnumVal ord="4">test/blocked</EnumVal>
            <EnumVal ord="5">off</EnumVal>
        </EnumType>
        <EnumType id="stVal$oscd$_XCBR_Test">
            <EnumVal ord="1">on</EnumVal>
            <EnumVal ord="2">blocked</EnumVal>
            <EnumVal ord="3">test</EnumVal>
            <EnumVal ord="4">test/blocked</EnumVal>
            <EnumVal ord="5">off</EnumVal>
        </EnumType>
        <EnumType id="SIUnitKind">
            <EnumVal ord="1">A</EnumVal>
        </EnumType>
        <EnumType id="MultiplierKind">
            <EnumVal ord="0">none</EnumVal>
        </EnumType>
    </DataTypeTemplates>
</SCL>
