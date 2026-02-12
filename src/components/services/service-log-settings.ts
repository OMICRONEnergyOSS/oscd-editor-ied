import { html, TemplateResult } from 'lit';
import { msg } from '@lit/localize';

export function renderLogSettingsServices(): TemplateResult {
  return html`
    <oscd-form-divider
      label=${msg('Log Control Configuration')}
    ></oscd-form-divider>

    <oscd-form-group>
      <oscd-form-field
        name="logSettings.cbName"
        type="select"
        .enumValues=${['Conf', 'Fix']}
        label=${msg('cbName')}
        helper=${msg(
          'Whether log control block name is configurable offline (Conf) or fixed (Fix)',
        )}
        readonly
      ></oscd-form-field>

      <oscd-form-field
        name="logSettings.datSet"
        type="select"
        .enumValues=${['Dyn', 'Conf', 'Fix']}
        label=${msg('datSet')}
        helper=${msg(
          'Whether log control blocks data set is configurable offline (Conf), online (Dyn) or fixed (Fix)',
        )}
        readonly
      ></oscd-form-field>

      <oscd-form-field
        name="logSettings.logEna"
        type="select"
        .enumValues=${['Dyn', 'Conf', 'Fix']}
        label=${msg('logEna')}
        helper=${msg(
          'Whether log control blocks attribute logEna is configurable offline (Conf), online (Dyn) or fixed (Fix)',
        )}
        readonly
      ></oscd-form-field>

      <oscd-form-field
        name="logSettings.trgOps"
        type="select"
        .enumValues=${['Dyn', 'Conf', 'Fix']}
        label=${msg('trgOps')}
        helper=${msg(
          'Whether log control blocks trigger options are configurable offline (Conf), online (Dyn) or fixed (Fix)',
        )}
        readonly
      ></oscd-form-field>

      <oscd-form-field
        name="logSettings.intgPd"
        type="select"
        .enumValues=${['Dyn', 'Conf', 'Fix']}
        label=${msg('intgPd')}
        helper=${msg(
          'Whether log control blocks integrity period is configurable offline (Conf), online (Dyn) or fixed (Fix)',
        )}
        readonly
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-divider label=${msg('Log Capabilities')}></oscd-form-divider>

    <oscd-form-group>
      <oscd-form-field
        name="confLogControl.max"
        label=${msg('Max')}
        helper=${msg(
          'The maximum number of log control blocks instantiable by system configuration tool',
        )}
        readonly
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-divider label=${msg('Client Capabilities')}></oscd-form-divider>

    <oscd-form-group>
      <oscd-form-field
        name="clientServices.readLog"
        type="checkbox"
        label=${msg('Read Log')}
        helper=${msg(
          'Whether IED supports services to handle logs as a client',
        )}
        readonly
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-divider
      label=${msg('DataSet Configuration')}
    ></oscd-form-divider>

    <oscd-form-group>
      <oscd-form-field
        name="dataSet.max"
        label=${msg('Max')}
        helper=${msg('The maximum allowed DataSets in this IED')}
        readonly
      ></oscd-form-field>

      <oscd-form-field
        name="dataSet.maxAttributes"
        label=${msg('Max attributes')}
        helper=${msg('The maximum number of FCDA elements per DataSet')}
        readonly
      ></oscd-form-field>

      <oscd-form-field
        name="dataSet.modify"
        type="checkbox"
        label=${msg('Modify')}
        helper=${msg('Whether DataSet can be modified by SCT')}
        readonly
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-divider label=${msg('Setting Group')}></oscd-form-divider>

    <oscd-form-group>
      <oscd-form-field
        name="settingGroups.sgEdit"
        type="checkbox"
        label=${msg('SGEdit')}
        helper=${msg(
          'Whether IED allows manipulating editable setting groups online',
        )}
        readonly
      ></oscd-form-field>

      <oscd-form-field
        name="settingGroups.confSG"
        type="checkbox"
        label=${msg('ConfSG')}
        helper=${msg(
          'Whether IED accepts the system configuration tool to configure the number of setting groups',
        )}
        readonly
      ></oscd-form-field>
    </oscd-form-group>
  `;
}
