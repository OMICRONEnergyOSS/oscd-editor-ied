export const testDocs = {
  empty: `<?xml version="1.0" encoding="UTF-8"?><SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B">
	<Header id="development sample"/>
	<Substation name="S1">
		<VoltageLevel name="V1" >
			<Bay name="B2" />
			<Bay name="B1" />
		</VoltageLevel>
	</Substation>
</SCL>`,
  withIED: `<?xml version="1.0" encoding="UTF-8"?><SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B">
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
</SCL>`,
  withIED_instanciated: `<?xml version="1.0" encoding="UTF-8"?>
<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B" release="5">
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
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0_Test">
                        <SettingControl numOfSGs="5"/>
                    </LN0>
                    <LN lnClass="TCTR" inst="1" lnType="TCTR_Test">
                    	<DOI name="Beh">
							<DAI name="stVal">
								<Val>blocked</Val>
							</DAI>
						</DOI>
                        <DOI name="ARtg">
                            <DAI name="setVal">
                                <Val sGroup="1">10</Val>
                                <Val sGroup="2">12</Val>
                                <Val sGroup="3">13</Val>
                                <Val sGroup="4">14</Val>
                                <Val sGroup="5">15</Val>
                            </DAI>
                            <DAI name="setMag">
                                <Val sGroup="1">100</Val>
                                <Val sGroup="5">120</Val>
                            </DAI>
                        </DOI>
                    </LN>
                </LDevice>
                <LDevice inst="LD2">
                    <LN0 lnClass="LLN0" inst="" lnType="LLN0_Test"/>
                    <LN lnClass="TCTR" inst="2" lnType="TCTR_Test"/>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <DataTypeTemplates>
        <LNodeType lnClass="LLN0" id="LLN0_Test">
            <DO name="Beh" type="Beh_Test"/>
        </LNodeType>
        <LNodeType lnClass="TCTR" id="TCTR_Test">
            <DO name="Beh" type="Beh_Test"/>
            <DO name="HzRtg" type="HzRtg_Test"/>
            <DO name="ARtg" type="ARtg_Test"/>
        </LNodeType>
        <DOType cdc="ENS" id="Beh_Test">
            <DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal_enums"/>
            <DA name="q" fc="ST" qchg="true" bType="Quality"/>
            <DA name="t" fc="ST" bType="Timestamp"/>
        </DOType>
        <DOType cdc="ASG" id="ARtg_Test">
            <DA name="setVal" desc="fc=SG" fc="SG" bType="INT32"/>
            <DA name="setMag" desc="fc=SE" fc="SE" bType="INT32">
                <Val>555</Val>
            </DA>
        </DOType>
        <DOType cdc="ASG" id="HzRtg_Test">
            <DA name="setMag" fc="SE" bType="Struct" type="AnalogueValueCtl"/>
            <DA name="units" fc="CF" bType="Struct" type="Unit"/>
            <DA name="sVC" fc="CF" bType="Struct" type="ScaledValueConfig"/>
            <DA name="minVal" fc="CF" bType="Struct" type="AnalogueValue"/>
            <DA name="maxVal" fc="CF" bType="Struct" type="AnalogueValue"/>
            <DA name="stepSize" fc="CF" bType="Struct" type="AnalogueValue"/>
        </DOType>
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
        <EnumType id="SIUnitKind">
            <EnumVal ord="1">Hz</EnumVal>
        </EnumType>
        <EnumType id="MultiplierKind">
            <EnumVal ord="0">none</EnumVal>
        </EnumType>
        <EnumType id="stVal_enums">
            <EnumVal ord="1">on</EnumVal>
            <EnumVal ord="2">blocked</EnumVal>
            <EnumVal ord="3">test</EnumVal>
            <EnumVal ord="4">test/blocked</EnumVal>
            <EnumVal ord="5">off</EnumVal>
        </EnumType>
    </DataTypeTemplates>
</SCL>
`,
};

export function parseDoc(xml: string): XMLDocument {
  return new DOMParser().parseFromString(xml, 'application/xml');
}
