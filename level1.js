import { CreateService } from './common.js';

window.addEventListener('load', () => {
    const params = (new URL(document.location)).searchParams;
    const cfg = +params.get('cfg') || 0;
    const options = { cfg };
    const comm = CreateService(options, response => {
        console.log('Response:', response);
    });

    const key = `cfg_${cfg}`;
    comm.postToOpener({ cmd: 'ask-user', payload: { key } });
    document.title = key;

    btnOpen.addEventListener('click', (event) => {
        const radio = document.querySelector('input[name="doc"]:checked');
        //console.log(radio.name, radio.value);
        const doc = radio.value;
        const key = `cfg_${cfg}_doc_${doc}`;
        window.open(`./level2.html?cfg=${cfg}&doc=${doc}`, key);
        event.preventDefault();
    });

});