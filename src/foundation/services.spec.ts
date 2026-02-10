import { expect } from '@open-wc/testing';
import { extractServicesData } from './services.js';

function createIEDWithServices(innerServices: string): Element {
  const doc = new DOMParser().parseFromString(
    `<SCL>
       <IED name="IED1">
         <Services>
           ${innerServices}
         </Services>
       </IED>
     </SCL>`,
    'application/xml',
  );

  return doc.querySelector('IED')!;
}

describe('services.extractServicesData()', () => {
  it('returns null if Services missing', () => {
    const doc = new DOMParser().parseFromString(
      `<SCL><IED name="IED1"/></SCL>`,
      'application/xml',
    );
    const ied = doc.querySelector('IED')!;
    expect(extractServicesData(ied)).to.be.null;
  });

  it('extracts LogSettings attributes', () => {
    const ied = createIEDWithServices(`
    <LogSettings 
        cbName="Conf"
        datSet="Fix" logEna="Dyn"
        trgOps="Conf"
        intgPd="Fix"
    />
  `);

    const result = extractServicesData(ied)!;

    expect(result.logSettings).to.deep.equal({
      cbName: 'Conf',
      datSet: 'Fix',
      logEna: 'Dyn',
      trgOps: 'Conf',
      intgPd: 'Fix',
    });
  });

  it('falls back to DataSet count if ConfDataSet missing', () => {
    const doc = new DOMParser().parseFromString(
      `<SCL>
       <IED name="IED1">
         <DataSet/>
         <DataSet/>
         <Services></Services>
       </IED>
     </SCL>`,
      'application/xml',
    );

    const ied = doc.querySelector('IED')!;
    const result = extractServicesData(ied)!;

    expect(result.dataSet.max).to.equal('2');
  });

  it('extracts SMVSettings text nodes', () => {
    const ied = createIEDWithServices(`
    <SMVSettings>
      <SmpRate>4000</SmpRate>
    </SMVSettings>
  `);

    const result = extractServicesData(ied)!;

    expect(result.smvSettings.smpRateVal).to.equal('4000');
  });
});
