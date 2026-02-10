import { TemplateResult, html } from 'lit';
import { msg } from '@lit/localize';

export function renderGseControlServices(): TemplateResult {
  return html`
    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Control Block Configuration')}
      </oscd-form-divider>

      <oscd-form-field
        name="gseSettings.cbName"
        type="select"
        .options=${['Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        readonly
        label=${msg('cbName')}
        helper=${msg(
          'Whether GSE control block (GOOSE) name is configurable offline (Conf) or fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="gseSettings.datSet"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        readonly
        label=${msg('datSet')}
        helper=${msg(
          'Whether GSE control blocks (GOOSE) data set and its structure is configurable offline (Conf), online (Dyn) or is fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="gseSettings.appID"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        readonly
        label=${msg('appID')}
        helper=${msg(
          'Whether GSE control blocks (GOOSE) ID is configurable offline (Conf), online (Dyn) or is fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="gseSettings.dataLabel"
        type="select"
        .options=${['Dyn', 'Conf', 'Fix']}
        .defaultValue=${'Fix'}
        nullable
        readonly
        label=${msg('dataLabel')}
        helper=${msg(
          'Deprecated: Whether GSSE object reference is configurable offline (Conf), online (Dyn) or fixed (Fix)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="gseSettings.kdaParticipant"
        type="checkbox"
        nullable
        readonly
        label=${msg('kdaParticipant')}
        helper=${msg(
          'Whether key delivery assurance (KDA) is supported by the server',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="gseSettings.signature"
        type="checkbox"
        nullable
        readonly
        label=${msg('signature')}
        helper=${msg(
          'Whether calculation of a signature is supported for each GOOSE',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="gseSettings.encryption"
        type="checkbox"
        nullable
        readonly
        label=${msg('encryption')}
        helper=${msg('Whether message encryption is supported for each GOOSE')}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider> ${msg('Publisher Capabilities')} </oscd-form-divider>

      <oscd-form-field
        name="goose.max"
        type="textfield"
        required
        readonly
        label=${msg('max')}
        helper=${msg(
          'The maximum number of configurable GOOSE control blocks. 0 means no GOOSE publishing supported',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="goose.fixedOffs"
        type="checkbox"
        nullable
        readonly
        label=${msg('fixedOffs')}
        helper=${msg(
          'Whether encoding with fixed offsets is configurable for each GSE control block (GOOSE). See also IEC 61850-8-1',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="goose.goose"
        type="checkbox"
        nullable
        readonly
        label=${msg('goose')}
        helper=${msg('Whether GOOSE publishing is supported')}
      ></oscd-form-field>

      <oscd-form-field
        name="goose.rGOOSE"
        type="checkbox"
        nullable
        readonly
        label=${msg('rGOOSE')}
        helper=${msg('Whether GOOSE with network layer 3 (IP) is supported')}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Subscription Capabilities')}
      </oscd-form-divider>

      <oscd-form-field
        name="clientServices.goose"
        type="checkbox"
        nullable
        readonly
        label=${msg('goose')}
        helper=${msg(
          'Whether the IED supports client side GOOSE related services',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.maxGOOSE"
        type="textfield"
        required
        readonly
        label=${msg('maxGOOSE')}
        helper=${msg(
          'The maximal number of GOOSEs the client can subscribe to',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.rGOOSE"
        type="checkbox"
        nullable
        readonly
        label=${msg('rGOOSE')}
        helper=${msg(
          'The maximal number of GOOSEs with network layer 3 the client can subscribe to',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.gsse"
        type="checkbox"
        nullable
        readonly
        label=${msg('gsse')}
        helper=${msg(
          'Whether the IED supports client side GSSE related services',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Supervision Capabilities')}
      </oscd-form-divider>

      <oscd-form-field
        name="supSubscription.maxGo"
        type="textfield"
        readonly
        label=${msg('maxGo')}
        helper=${msg(
          'The maximum number of GOOSE supervision supported by this IED (LGOS)',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider> ${msg('GSSE Capabilities')} </oscd-form-divider>

      <oscd-form-field
        name="gsse.max"
        type="textfield"
        required
        readonly
        label=${msg('max')}
        helper=${msg(
          'The maximum number of GSSE supported as publisher. 0 means IED can only subscribe on GSSE messages',
        )}
      ></oscd-form-field>
    </oscd-form-group>
  `;
}
