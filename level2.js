import { CreateService } from './common.js';

window.addEventListener('load', () => {
    const params = (new URL(document.location)).searchParams;
    const cfg = +params.get('cfg') || 0;
    const doc = params.get('doc') || '0-000';
    const options = { cfg };
    const comm = CreateService(options, response => {
        console.log('Response:', response);
    });
    const key = `cfg_${cfg}_doc_${doc}`;
    comm.postToOpener({ cmd: 'ask-user', payload: { key } });
    document.title = key;

});