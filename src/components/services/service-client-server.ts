import { TemplateResult, html } from 'lit';
import { msg } from '@lit/localize';

export function renderClientServerServices(): TemplateResult {
  return html`
    <oscd-form-group>
      <oscd-form-divider>${msg('Dynamic Associations')}</oscd-form-divider>

      <oscd-form-field
        name="dynamicAssociations.max"
        type="textfield"
        readonly
        label=${msg('max')}
        helper=${msg(
          'The maximum number of guaranteed parallel association with the IED. If missing, no association is possible',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>${msg('Discover Capabilities')}</oscd-form-divider>

      <oscd-form-field
        name="discoverCapabilities.getDirectory"
        type="checkbox"
        readonly
        label=${msg('GetDirectory')}
        helper=${msg(
          'Whether IED supports GetServerDirectory, GetLogicalDeviceDirectory, GetLogicalNodeDirectory',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="discoverCapabilities.getDataObjectDefinition"
        type="checkbox"
        readonly
        label=${msg('GetDataObjectDefinition')}
        helper=${msg('Whether IED supports the service GetDataDefinition')}
      ></oscd-form-field>

      <oscd-form-field
        name="discoverCapabilities.dataObjectDirectory"
        type="checkbox"
        readonly
        label=${msg('DataObjectDirectory')}
        helper=${msg('Whether IED supports the service GetDataDirectory')}
      ></oscd-form-field>

      <oscd-form-field
        name="discoverCapabilities.getDataSetValue"
        type="checkbox"
        readonly
        label=${msg('GetDataSetValue')}
        helper=${msg('Whether IED supports the service GetDataSetValues')}
      ></oscd-form-field>

      <oscd-form-field
        name="discoverCapabilities.setDataSetValue"
        type="checkbox"
        readonly
        label=${msg('SetDataSetValue')}
        helper=${msg('Whether IED supports the service SetDataSetValue')}
      ></oscd-form-field>

      <oscd-form-field
        name="discoverCapabilities.setDataSetDirectory"
        type="checkbox"
        readonly
        label=${msg('SetDataSetDirectory')}
        helper=${msg('Whether IED supports the service SetDataSetDirectory')}
      ></oscd-form-field>

      <oscd-form-field
        name="discoverCapabilities.readWrite"
        type="checkbox"
        readonly
        label=${msg('ReadWrite')}
        helper=${msg(
          'Whether IED supports the service GetData, SetData, and Operate',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>${msg('Functional Naming')}</oscd-form-divider>

      <oscd-form-field
        name="functionalNaming.confLdName"
        type="checkbox"
        readonly
        label=${msg('ConfLdName')}
        helper=${msg(
          'Whether the IED allows defining the attribute ldName in logical devices',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="functionalNaming.supportsLdName"
        type="checkbox"
        readonly
        label=${msg('supportsLdName')}
        helper=${msg(
          'Whether the IED understands the logical device name as a client',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>${msg('Client Capabilities')}</oscd-form-divider>

      <oscd-form-field
        name="clientCapabilities.maxAttributes"
        type="textfield"
        readonly
        label=${msg('maxAttributes')}
        helper=${msg(
          'The maximum receivable data attributes across all data sets',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientCapabilities.timerActivatedControl"
        type="checkbox"
        readonly
        label=${msg('TimerActivatedControl')}
        helper=${msg('Whether IED supports time activated control')}
      ></oscd-form-field>

      <oscd-form-field
        name="clientCapabilities.getCBValues"
        type="checkbox"
        readonly
        label=${msg('GetCBValues')}
        helper=${msg('Whether IED can read control blocks online')}
      ></oscd-form-field>

      <oscd-form-field
        name="clientCapabilities.GSEDir"
        type="checkbox"
        readonly
        label=${msg('GSEDir')}
        helper=${msg(
          'Whether IED supports GSE directory services acc. to IEC 61850-7-2',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>
        ${msg('ValKind Manipulation Configuration')}
      </oscd-form-divider>

      <oscd-form-field
        name="valKindManipulationConfig.setToRO"
        type="checkbox"
        readonly
        label=${msg('setToRO')}
        helper=${msg('Whether valKind attributes can be modified to RO')}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Signal Reference Configuration')}
      </oscd-form-divider>

      <oscd-form-field
        name="signalReferenceConfig.max"
        type="textfield"
        readonly
        label=${msg('max')}
        helper=${msg('The maximum object references the IED can create')}
      ></oscd-form-field>
    </oscd-form-group>
  `;
}
