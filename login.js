window.addEventListener('load', () => {

    const ms_in_minute = 60000;

    window.addEventListener('message', event => {
        const { cmd, payload: { name, role } } = event.data;
        switch (cmd) {
            case 'def-user':
                document.querySelector('input[name="user-name"]').value = name;
                document.querySelector('input[name="user-role"]').value = role;
                break;
        }
    });

    btnSend.addEventListener('click', event => {
        const user_name = document.querySelector('input[name="user-name"]').value;
        const user_role = document.querySelector('input[name="user-role"]').value;
        console.log(user_name, user_role);
        if (window.opener && !window.opener.closed) {
            const payload = { name: user_name, role: user_role, expired: Date.now() + 20 * ms_in_minute };
            setTimeout(win => win.postMessage({ cmd: 'logged-in', payload }),
                0,
                window.opener
            );
        }
        setTimeout(window.close, 0);
        event.preventDefault();
    });
});