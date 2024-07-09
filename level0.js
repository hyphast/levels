import { CreateService } from './common.js';

window.addEventListener('load', () => {
    const options = { cfg: -1 };
    const comm = CreateService(options, response => {
        console.log('Response:', response);
    });
    // login as someone
    comm.showLogin('someone', 'manager');

    btnOpen.addEventListener('click', event => {
        const radio = document.querySelector('input[name="config"]:checked');
        //console.log(radio.name, radio.value);
        const cfg = +radio.value;
        const key = `cfg_${cfg}`;
        window.open(`./level1.html?cfg=${cfg}`, key);
        event.preventDefault();
    });

    btnCount.addEventListener('click', event => {
        const checkboxes = document.querySelectorAll('input[name="descend"]:checked');
        const cfg_mask = Array.from(checkboxes).reduce((mask, checkbox) =>  mask | 1 << +checkbox.value, 0);
        comm.countDescendants({ cfg_mask });
        event.preventDefault();
    });

    btnClose.addEventListener('click', event => {
        const checkboxes = document.querySelectorAll('input[name="descend"]:checked');
        const cfg_mask = Array.from(checkboxes).reduce((mask, checkbox) =>  mask | 1 << +checkbox.value, 0);
        comm.closeDescendants({ cfg_mask });
        event.preventDefault();
    });

});