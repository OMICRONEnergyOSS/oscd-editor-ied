import { TemplateResult, html } from 'lit';
import { msg } from '@lit/localize';

export function renderSampledValuesServices(): TemplateResult {
  return html`
    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Control Block Configuration')}
      </oscd-form-divider>

      <oscd-form-field
        name="smvSettings.cbName"
        type="select"
        .options=${['Conf', 'Fix']}
        .defaultValue=${'Fix'}
        readonly
        label=${msg('cbName')}
        helper=${msg(
          'Whether SMV control block name is configurable offline (Conf) or fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.datSet"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        readonly
        label=${msg('datSet')}
        helper=${msg(
          'Whether SMV control blocks data set and its structure is configurable offline (Conf), online (Dyn) or is fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.svID"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        readonly
        label=${msg('svID')}
        helper=${msg(
          'Whether SMV control blocks ID is configurable offline (Conf), online (Dyn) or is fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.optFields"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        readonly
        label=${msg('optFields')}
        helper=${msg(
          'Whether SMV control blocks optional fields are configurable offline (Conf), online (Dyn) or are fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.smpRate"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        readonly
        label=${msg('smpRate')}
        helper=${msg(
          'Whether SMV control blocks attribute smpRate is configurable offline (Conf), online (Dyn) or is fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.nofASDU"
        type="select"
        .options=${['Conf', 'Fix']}
        .defaultValue=${'Fix'}
        readonly
        label=${msg('nofASDU')}
        helper=${msg(
          'Whether SMV control blocks attribute noASDU is configurable offline (Conf) or fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.samplesPerSec"
        type="checkbox"
        readonly
        label=${msg('samplesPerSec')}
        helper=${msg(
          'Whether SMV supports sample rate definition as SamplesPerSec or SecPerSamples',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.synchSrcId"
        type="checkbox"
        readonly
        label=${msg('synchSrcId')}
        helper=${msg('Whether grandmaster clock ID can be included in the SMV')}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.pdcTimeStamp"
        type="checkbox"
        readonly
        label=${msg('pdcTimeStamp')}
        helper=${msg('Whether the PDC timestamp can be included into SMV')}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.kdaParticipant"
        type="checkbox"
        readonly
        label=${msg('kdaParticipant')}
        helper=${msg('Whether server supports key delivery assurance (KDA)')}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.mcSecurity.signature"
        type="checkbox"
        readonly
        label=${msg('signature')}
        helper=${msg('Whether calculation of a signature is supported for SMV')}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.mcSecurity.encryption"
        type="checkbox"
        readonly
        label=${msg('encryption')}
        helper=${msg('Whether message encryption is supported for SMV')}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.smpRateVal"
        type="textfield"
        readonly
        label=${msg('SmpRate')}
        helper=${msg('Defines the implemented SmpRate in the IED')}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.samplesPerSecVal"
        type="textfield"
        readonly
        label=${msg('SamplesPerSec')}
        helper=${msg('Defines the implemented SamplesPerSec in the IED')}
      ></oscd-form-field>

      <oscd-form-field
        name="smvSettings.secPerSamplesVal"
        type="textfield"
        readonly
        label=${msg('SecPerSamples')}
        helper=${msg('Defines the implemented SecPerSamples in the IED')}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider> ${msg('Publisher Capabilities')} </oscd-form-divider>

      <oscd-form-field
        name="smvPublisher.max"
        type="textfield"
        readonly
        label=${msg('max')}
        helper=${msg(
          'The maximum number of SMV control blocks the IED can publish',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvPublisher.delivery"
        type="select"
        .options=${['unicast', 'multicast', 'both']}
        .defaultValue=${'multicast'}
        readonly
        label=${msg('delivery')}
        helper=${msg(
          'Whether the IED supports publishing of multicast, unicast or both types of SMV streams',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvPublisher.deliveryConf"
        type="checkbox"
        readonly
        label=${msg('deliveryConf')}
        helper=${msg(
          'Whether the system configurator is allowed to configure SMV control blocks',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="smvPublisher.sv"
        type="checkbox"
        readonly
        label=${msg('sv')}
        helper=${msg('Whether IED supports layer 2 sampled value streams')}
      ></oscd-form-field>

      <oscd-form-field
        name="smvPublisher.rSV"
        type="checkbox"
        readonly
        label=${msg('rSV')}
        helper=${msg('Whether the IED supports layer 3 sampled value streams')}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider> ${msg('Client Capabilities')} </oscd-form-divider>

      <oscd-form-field
        name="clientServices.sv"
        type="checkbox"
        readonly
        label=${msg('sv')}
        helper=${msg(
          'Whether the IED supports client side SMV related services',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.maxSMV"
        type="textfield"
        readonly
        label=${msg('maxSMV')}
        helper=${msg(
          'The maximal number of layer 2 sampled value streams the client can subscribe to',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.rSV"
        type="checkbox"
        readonly
        label=${msg('rSV')}
        helper=${msg(
          'The maximal number of layer 3 sampled value streams the client can subscribe to',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Dynamic Reporting/DataSets')}
      </oscd-form-divider>

      <oscd-form-field
        name="supSubscription.maxSv"
        type="textfield"
        readonly
        label=${msg('maxSv')}
        helper=${msg(
          'The maximum number of SMV supervision supported by this IED (LSVS)',
        )}
      ></oscd-form-field>
    </oscd-form-group>
  `;
}
