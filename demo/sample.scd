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
		<Services><ConfLdName /></Services>
		<AccessPoint name="AP1">
			<Server>
				<Authentication/>
				<LDevice inst="LD1">
					<LN0 lnClass="LLN0" inst="" lnType="PlaceholderLLN0"/>
				</LDevice>
			</Server>
		</AccessPoint>
	</IED>
	<DataTypeTemplates>
		<LNodeType lnClass="LLN0" id="PlaceholderLLN0">
			<DO name="Beh" type="Beh$oscd$_c6ed035c8137b35a"/>
		</LNodeType>
		<LNodeType lnClass="LLN0" id="AnotherPlaceholderLLN0">
			<DO name="Beh" type="Beh$oscd$_c6ed035c8137b35a"/>
		</LNodeType>
		<DOType cdc="ENS" id="Beh$oscd$_c6ed035c8137b35a">
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
		<LNodeType lnClass="GGIO" id="GGIO_Test">
			<DO name="Beh" type="Beh$oscd$_GGIO_Test"/>
		</LNodeType>
		<LNodeType lnClass="XCBR" id="XCBR_Test">
			<DO name="Beh" type="Beh$oscd$_XCBR_Test"/>
		</LNodeType>
		<DOType cdc="ENS" id="Beh$oscd$_GGIO_Test">
			<DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal$oscd$_GGIO_Test"/>
			<DA name="q" fc="ST" qchg="true" bType="Quality"/>
			<DA name="t" fc="ST" bType="Timestamp"/>
		</DOType>
		<EnumType id="stVal$oscd$_GGIO_Test">
			<EnumVal ord="1">on</EnumVal>
			<EnumVal ord="2">blocked</EnumVal>
			<EnumVal ord="3">test</EnumVal>
			<EnumVal ord="4">test/blocked</EnumVal>
			<EnumVal ord="5">off</EnumVal>
		</EnumType>
		<DOType cdc="ENS" id="Beh$oscd$_XCBR_Test">
			<DA name="stVal" fc="ST" dchg="true" dupd="true" bType="Enum" type="stVal$oscd$_XCBR_Test"/>
			<DA name="q" fc="ST" qchg="true" bType="Quality"/>
			<DA name="t" fc="ST" bType="Timestamp"/>
		</DOType>
		<EnumType id="stVal$oscd$_XCBR_Test">
			<EnumVal ord="1">on</EnumVal>
			<EnumVal ord="2">blocked</EnumVal>
			<EnumVal ord="3">test</EnumVal>
			<EnumVal ord="4">test/blocked</EnumVal>
			<EnumVal ord="5">off</EnumVal>
		</EnumType>
	</DataTypeTemplates>
</SCL>
