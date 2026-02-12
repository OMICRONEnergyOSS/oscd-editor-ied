import { TemplateResult, html } from 'lit';
import { msg } from '@lit/localize';

export function renderNetworkingServices(): TemplateResult {
  return html`
    <oscd-form-group>
      <oscd-form-divider>${msg('File Handling')}</oscd-form-divider>

      <oscd-form-field
        name="fileHandling.mms"
        type="checkbox"
        readonly
        label=${msg('mms')}
        helper=${msg(
          'Whether the IED supports file transfer as defined by the manufacturer messaging service (MMS)',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="fileHandling.ftp"
        type="checkbox"
        readonly
        label=${msg('ftp')}
        helper=${msg('Whether the IED supports file transfer service (FTP)')}
      ></oscd-form-field>

      <oscd-form-field
        name="fileHandling.ftps"
        type="checkbox"
        readonly
        label=${msg('ftps')}
        helper=${msg(
          'Whether the IED supports encrypted file transfer service (FTPS)',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Time Server Capabilities')}
      </oscd-form-divider>

      <oscd-form-field
        name="timeSyncProt.sntp"
        type="checkbox"
        readonly
        label=${msg('sntp')}
        helper=${msg(
          'Whether the IED supports simple network time protocol as time-server',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="timeSyncProt.iec61850_9_3"
        type="checkbox"
        readonly
        label=${msg('iec61850_9_3')}
        helper=${msg(
          'Whether the IED supports precision time protocol (PTP) acc. to IEC 61850-9-3 as time-server',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="timeSyncProt.c37_238"
        type="checkbox"
        readonly
        label=${msg('c37_238')}
        helper=${msg(
          'Whether the IED supports precision time protocol (PTP) acc. to C37.238 as time-server',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="timeSyncProt.other"
        type="checkbox"
        readonly
        label=${msg('other')}
        helper=${msg(
          'Whether IED supports other type of synchronization as time-server (e.g. PPS)',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Time Client Capabilities')}
      </oscd-form-divider>

      <oscd-form-field
        name="clientServices.timeSyncProt.sntp"
        type="checkbox"
        readonly
        label=${msg('sntp')}
        helper=${msg(
          'Whether the IED supports simple network time protocol as time-client',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.timeSyncProt.iec61850_9_3"
        type="checkbox"
        readonly
        label=${msg('iec61850_9_3')}
        helper=${msg(
          'Whether the IED supports precision time protocol (PTP) acc. to IEC 61850-9-3 as time-client',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.timeSyncProt.c37_238"
        type="checkbox"
        readonly
        label=${msg('c37_238')}
        helper=${msg(
          'Whether the IED supports precision time protocol (PTP) acc. to C37.238 as time-client',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.timeSyncProt.other"
        type="checkbox"
        readonly
        label=${msg('other')}
        helper=${msg(
          'Whether IED supports other type of synchronization as time-client (e.g. PPS)',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>
        ${msg('Multicast Security on Server')}
      </oscd-form-divider>

      <oscd-form-field
        name="clientServices.mcSecurity.signature"
        type="checkbox"
        readonly
        label=${msg('signature')}
        helper=${msg(
          'Whether calculation of a signature is supported for SMV/GOOSE on this IED/access point',
        )}
      ></oscd-form-field>

      <oscd-form-field
        name="clientServices.mcSecurity.encryption"
        type="checkbox"
        readonly
        label=${msg('encryption')}
        helper=${msg(
          'Whether message encryption is supported for SMV/GOOSE on this IED/access point',
        )}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider> ${msg('Redundancy Protocols')} </oscd-form-divider>

      <oscd-form-field
        name="redProt.hsr"
        type="checkbox"
        readonly
        label=${msg('hsr')}
        helper=${msg('Whether the IED supports redundancy protocol HSR')}
      ></oscd-form-field>

      <oscd-form-field
        name="redProt.prp"
        type="checkbox"
        readonly
        label=${msg('prp')}
        helper=${msg('Whether the IED supports redundancy protocol PRP')}
      ></oscd-form-field>

      <oscd-form-field
        name="redProt.rstp"
        type="checkbox"
        readonly
        label=${msg('rstp')}
        helper=${msg('Whether the IED supports redundancy protocol RSTP')}
      ></oscd-form-field>
    </oscd-form-group>

    <oscd-form-group>
      <oscd-form-divider>${msg('Others')}</oscd-form-divider>

      <oscd-form-field
        name="commProt.ipv6"
        type="checkbox"
        readonly
        label=${msg('ipv6')}
        helper=${msg('Whether the IED supports IP version 6')}
      ></oscd-form-field>
    </oscd-form-group>
  `;
}
