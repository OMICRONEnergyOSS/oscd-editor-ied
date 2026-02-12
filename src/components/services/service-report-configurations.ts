import { TemplateResult, html } from 'lit';
import { msg } from '@lit/localize';

export function renderReportConfigurationsServices(): TemplateResult {
  return html`
    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Control Block Configuration')}
      </oscd-form-divider>

      <oscd-form-field
        name="reportSettings.cbName"
        type="select"
        .options=${['Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        ?readonly=${true}
        label=${msg('cbName')}
        helper=${msg(
          'Whether report control block name is configurable offline (Conf) or fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="reportSettings.datSet"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        ?readonly=${true}
        label=${msg('datSet')}
        helper=${msg(
          'Whether report control blocks data set and its structure is configurable offline (Conf), online (Dyn) or is fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="reportSettings.rptID"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        ?readonly=${true}
        label=${msg('rptID')}
        helper=${msg(
          'Whether report control blocks ID is configurable offline (Conf), online (Dyn) or is fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="reportSettings.optFields"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        ?readonly=${true}
        label=${msg('optFields')}
        helper=${msg(
          'Whether report control blocks optional fields are configurable offline (Conf), online (Dyn) or are fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="reportSettings.bufTime"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        ?readonly=${true}
        label=${msg('bufTime')}
        helper=${msg(
          'Whether report control blocks bufTime attribute is configurable offline (Conf), online (Dyn) or is fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="reportSettings.trgOps"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        ?readonly=${true}
        label=${msg('trgOps')}
        helper=${msg(
          'Whether report control blocks trigger options are configurable offline (Conf), online (Dyn) or are fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="reportSettings.intgPd"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        ?readonly=${true}
        label=${msg('intgPd')}
        helper=${msg(
          'Whether report control blocks integrity period is configurable offline (Conf), online (Dyn) or is fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="reportSettings.resvTms"
        type="checkbox"
        nullable
        ?readonly=${true}
        label=${msg('resvTms')}
        helper=${msg(
          'Whether reserve time exists in all buffered report control blocks',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="reportSettings.owner"
        type="checkbox"
        nullable
        ?readonly=${true}
        label=${msg('owner')}
        helper=${msg(
          'Whether owner attribute exists on all buffered report control blocks',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider> ${msg('Publisher Capabilities')} </oscd-form-divider>

      <oscd-form-field
        name="confReportControl.max"
        type="textfield"
        required
        ?readonly=${true}
        label=${msg('max')}
        helper=${msg(
          'The maximum number of report control blocks instantiable by system configuration tool',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="confReportControl.bufMode"
        type="select"
        .options=${['unbuffered', 'buffered', 'both']}
        .defaultValue=${'both'}
        nullable
        ?readonly=${true}
        label=${msg('bufMode')}
        helper=${msg(
          'Whether buffered, unbuffered or both type of report control block can be created by system configuration tool',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="confReportControl.maxBuf"
        type="textfield"
        ?readonly=${true}
        label=${msg('maxBuf')}
        helper=${msg(
          'The maximum number of BUFFERED report control blocks instantiable by system configuration tool',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="confReportControl.bufConf"
        type="checkbox"
        nullable
        ?readonly=${true}
        label=${msg('bufConf')}
        helper=${msg(
          'Whether buffered attribute can be configured by system configuration tool',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider> ${msg('Client Capabilities')} </oscd-form-divider>

      <oscd-form-field
        name="clientServices.maxReports"
        type="textfield"
        required
        ?readonly=${true}
        label=${msg('maxReports')}
        helper=${msg(
          'The maximal number of report control blocks the client can work with',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.bufReport"
        type="checkbox"
        nullable
        ?readonly=${true}
        label=${msg('bufReport')}
        helper=${msg(
          'Whether the IED can use buffered report control blocks as a client',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.unbufReport"
        type="checkbox"
        nullable
        ?readonly=${true}
        label=${msg('unbufReport')}
        helper=${msg(
          'Whether the IED can use un-buffered report control blocks as a client',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Dynamic Reporting/DataSets')}
      </oscd-form-divider>

      <oscd-form-field
        name="dynDataSet.max"
        type="textfield"
        required
        ?readonly=${true}
        label=${msg('max')}
        helper=${msg(
          'The maximum number data sets (including preconfigured ones)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="dynDataSet.maxAttributes"
        type="textfield"
        ?readonly=${true}
        label=${msg('maxAttributes')}
        helper=${msg(
          'The maximum number of data entries (FCDA) allowed within a dynamic data set',
        )}
      ></oscd-form-field>
    </oscd-form-group>
  `;
}
