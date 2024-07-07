export function CreateService(options, callback) {

    const userHeader = document.querySelector('#user_header');

    const state = { user: null, childs: new Map() };

    function loggedIn(payload) {
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ cmd: 'logged-in', payload });
            return;
        }
        const { name, role, expired } = payload;
        const user = { name, role, exp_dt: new Date(expired) };
        console.log('logged-in:', user);
        // user changed
        if (state.user && state.user.name !== user.name) {            
            setTimeout(mustClose, 0, user);
        } else {
            setTimeout(userAuthed, 0, user);
        }
        state.user = user;
    }

    function mustClose(user) {
        // close all descendants
        for (const child of state.childs.values()) {
            if (!child.closed) child.postMessage({ cmd: 'must-close' });
        }
        // do not close top window
        if (!window.opener || window.opener.closed) {
            setTimeout(userAuthed, 100, user);
        } else {
            setTimeout(window.close, 100);
        }
    }

    function userAuthed(user) {
        userHeader.textContent = `Пользователь: ${user.name}, роль: ${user.role}, авторизован до ${user.exp_dt.toLocaleString()}`;
        // notify childs
        for (const child of state.childs.values()) {
            if (!child.closed) child.postMessage({ cmd: 'user-auth', payload: { ...user } });
        }
    }
    // child post 'ask-user'
    function userAsk(child, key, user) {
        state.childs.set(key, child);
        // send answer to child
        console.log(`answered to ${key} with user: ${user.name}`);
        child.postMessage({ cmd: 'asked-user', payload: { ...user } });
    }
    // parent post 'asked-user' with answer
    function userAsked(user) {
        userHeader.textContent = `Пользователь: ${user.name}, роль: ${user.role}, авторизован до ${user.exp_dt.toLocaleString()}`;
        state.user = user;
    }
    // parent post 'count-childs'
    function countChilds(payload) {
        const { cfg_mask } = payload;
        const { cfg } = options;
        // TODO: count cfg descendants only

        const accepted = true;
        if (!accepted) { 
             if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ cmd: 'counted-child', payload: { count: 0 } });
            }
            return;
        }
        state.counter = 0;
        state.copened = 0;
        for (const child of state.childs.values()) {
            if (!child.closed) {
                child.postMessage({ cmd: 'count-childs', payload });
                state.copened += 1;
            }
        }
        if (state.copened === 0) {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ cmd: 'counted-child', payload: { count: 1 } });
            }
        }
    }
    // child post 'counted-child'
    function countedChild(payload) {
        const { count } = payload;
        state.counter += count;
        state.copened -= 1;
        if (state.copened === 0) {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ cmd: 'counted-child', payload: { count: 1 + state.counter } });            
            }
            callback({ type: 'descendants-count', value: state.counter });
        }
    }
    // windows communication messages
    window.addEventListener('message', event => {
        const { cmd, payload } = event.data;
        switch (cmd) {
            // posted by login
            case 'logged-in':
                loggedIn(payload);
                break;
            // posted to childs when authorized
            case 'user-auth':
                userAuthed(payload);
                break;
            // posted to parent when loaded
            case 'ask-user':
                const { user } = state;
                userAsk(event.source, payload.key, user);
                break;
            // posted to child when answered
            case 'asked-user':
                userAsked(payload);
                break;
            // posted to parent from askAuthLogin
            case 'ask-login':
                setTimeout(openLogin, 0, 'Введите e-mail и пароль');
                break;
            // posted to child from mustClose
            case 'must-close':
                mustClose();
                break;
             // posted by parent
            case 'count-childs':
                countChilds(payload);
                break;
            // posted by child
            case 'counted-child':
                countedChild(payload);
                break;
            // end of cmd switch
        }
    });

    userHeader.addEventListener('click', _ev => {
        const login = window.open('./login.html', 'login');
        const { name, role } = state.user;
        setTimeout(() => login.postMessage({ cmd: 'def-user', payload: { name, role } }), 200);
    });

    return {
        showLogin(defname='some', defrole='user') {
            const login = window.open('./login.html', 'login');
            setTimeout(() => login.postMessage({ cmd: 'def-user', payload: { name: defname, role: defrole } }), 200);        
        },
        postToOpener(message) {
            if (window.opener && !window.opener.closed) {
                setTimeout(win => win.postMessage(message), 0, window.opener);
            }
        },
        postToChilds(message) {
            for (const child of state.childs.values()) {
                if (!child.closed) child.postMessage(message);
            }
        },
        countDescendants(payload) {
            countChilds(payload);
        }
    }
};