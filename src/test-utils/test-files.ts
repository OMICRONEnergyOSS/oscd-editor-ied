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
					</LN0>
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
			<DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal$oscd$_48ba16345b8e7f5b"/>
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
  withIED_instanciated: `<?xml version="1.0" encoding="UTF-8"?><SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B">
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
					<LN0 lnClass="LLN0" inst="" lnType="PlaceholderLLN0" prefix="L">
						<SettingControl numOfSGs="2"/>
						<DOI name="Beh" desc="Behavior">
							<SDI name="Sub1" desc="SubDesc"/>
							<DAI name="stVal" desc="ValueDesc">
								<Val>on</Val>
							</DAI>
							<DAI name="stValSG">
								<Val sGroup="1">v1</Val>
								<Val sGroup="2">v2</Val>
							</DAI>
						</DOI>
					</LN0>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<DataTypeTemplates>
		<LNodeType lnClass="LLN0" id="PlaceholderLLN0">
			<DO name="Beh" desc="DoDesc" type="Beh_Test"/>
		</LNodeType>
		<DOType cdc="ENS" id="Beh_Test">
			<DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal$oscd$_48ba16345b8e7f5b"/>
			<DA name="stValSG" fc="SG" bType="Enum" type="stVal$oscd$_48ba16345b8e7f5b"/>
			<DA name="q" fc="ST" qchg="true" bType="Quality"/>
			<DA name="t" fc="ST" bType="Timestamp"/>
			<SDO name="Sub1" type="SubType"/>
			<DA name="Sub2" bType="Struct" type="SubDaType"/>
		</DOType>
		<DOType id="SubType" cdc="ENS">
			<DA name="subDa" fc="ST" bType="Enum"/>
		</DOType>
		<DAType id="SubDaType">
			<BDA name="subBda" bType="Enum" type="stVal$oscd$_48ba16345b8e7f5b"/>
		</DAType>
		<EnumType id="stVal$oscd$_48ba16345b8e7f5b">
			<EnumVal ord="1">on</EnumVal>
			<EnumVal ord="2">blocked</EnumVal>
			<EnumVal ord="3">test</EnumVal>
			<EnumVal ord="4">test/blocked</EnumVal>
			<EnumVal ord="5">off</EnumVal>
		</EnumType>
	</DataTypeTemplates>
</SCL>`,
};

export function parseDoc(xml: string): XMLDocument {
  return new DOMParser().parseFromString(xml, 'application/xml');
}
