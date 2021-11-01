let projectId = 17125;
let typeId = 1;
let email;
let userId;
let main_content = el('main_content');
let currentTemplate;
let events = {'submit': [], 'click': []};

let path = location.pathname.split('/');
switch (path[1]) {
    case 'login':
        loginController(path[2]);
        break;
    default:
        regController();
}

//-------------------- Controllers --------------------------

async function regController() {
    renderTemplate('reg');
    // next regThanksController
}

async function regFixEmailController() {
    renderTemplate('reg', false);
    el('emailError').style.display = 'block';
}

async function regThanksController() {
    renderTemplate('regThanks', false);
    registerEventClick('okRegThanks', function (){
        request('push/system', 'POST', {
            'type_id': typeId,
            'project_id': projectId,
            'category': 1,
            'client_id': 134933,
            'data': {
                'user': {
                    'email': email,
                }
            }
        }).then(function () {
            confirmController();
        })
    })
    location = '/login/YW5kZXJAZ21haWwuY29t';
}

async function confirmController() {
    // registration();
    renderTemplate('confirm', false);
}

async function loginController(emailBase) {
    email = atob(emailBase);
    renderTemplate('login');
    let data = await request('user/project/' + projectId + '/email/' + email)
    userId = data.user.id;
    writeConsoleReply('Sendios user ID is ' + userId);
    request('users/' + userId + '/online', 'PUT', {
        "timestamp": "2010-01-01T08:15:30-01:00",
        'user_id': userId,
    }, 'https://api-proxy.sendios.co/v3/');

}


async function paymentController() {
    renderTemplate('payment');
}

//------------------------ Helpers -------------------------

function el(selector) {
    return document.getElementById(selector);
}

//--------------------- EVENTS ---------------

main_content.onsubmit = function (event) {
    if (typeof (events[event.type][event.target.id]) === 'function') {
        return events[event.type][event.target.id](event);
    }
};

main_content.onclick = function (event) {
    if (typeof (events[event.type][event.target.id]) === 'function') {
        return events[event.type][event.target.id](event);
    }
};

function registerEventClick(objectId, callback) {
    return registerEvent('click', objectId, callback);
}

function registerEvent(eventType, objectId, callback) {
    events[eventType][objectId] = callback;
}

//-----------------------------------------------


function renderTemplate(name, rerender = false) {
    if (name === currentTemplate && !rerender) {
        return;
    }
    let code = el(name + '_template').innerHTML;
    if (code) {
        main_content.innerHTML = code;
    }
    currentTemplate = name;
}


registerEvent('submit', 'email_form', function (event) {
        email = event.target.elements.email.value;
        // validate and fix email
        request('email/check', 'POST', {"email": email})
            .then(function (data) {
                email = data.email;
                let emailStatus;
                if (data.valid) {
                    emailStatus = 'valid';
                } else {
                    emailStatus = 'invalid';
                }
                if (data.trusted) {
                    emailStatus += ' and trusted';
                } else {
                    emailStatus += ' and not trusted';
                }
                writeConsoleReply('Email status: ' + emailStatus);

                regThanksController();
                // if (data.valid) {
                // } else {
                //     route('confirm');
                //    route('regFixEmail');
                // }
            });
        return false;
    }
);


async function registration() {
}


registerEventClick('payment', function () {
    request('lastpayment', 'POST', {
        'user_id': userId,
        "start_date": "1509617696",
        "expire_date": "1609617696",
        "total_count": "14",
    })
});
//
// el('field').onclick = function () {
//     request('userfields/project/' + projectId + '/email/' + email, 'PUT', {
//         'fruit': 'banana',
//     }).then(function (){
//         request('userfields/project/' + projectId + '/email/' + email, 'GET')
//             .then(function (data) {console.log(data)});
//     });
// }
//
el('online').onclick = function () {
}


async function request(method = '', httpMethod = 'GET', data = {}, host = '') {
    let body;
    if (httpMethod === 'POST' || httpMethod === 'PUT') {
        body = JSON.stringify(data)
    }
    let consoleText = '️&nbsp;' + method;
    if (body) {
        consoleText += '&nbsp;' + body;
    }
    writeConsoleSend(consoleText);

    switch (method) {
        case "email/check":
            return {'email': 'ander@gmail.com'};
        case "user/project/17125/email/ander@gmail.com":
            return {'user': {'id': 123}};
        case "push/system":
            return {};
    }

    if (!host) {
        host = 'https://api-proxy.sendios.co/v1/';
    }
    let response = await fetch(host + method, {
        method: httpMethod,
        headers: {
            'Content-Type': 'application/json',
            'X-Proxy-Token': 'vweihmlauhwveiuamhuiven',
        },
        body
    }).catch(function (data) {
        writeConsoleReply('API request or Network error');
    });

    if (response) {
        return await response.json().then(function (data) {
            return data.data;
        })
    }
}

function writeConsoleReply(message) {
    let console = el("console");
    console.innerHTML += '<div class="replyMessage">' + message + '</div>';
    console.scrollTop = console.scrollHeight;
}

function writeConsoleSend(message) {
    let console = el("console");
    console.innerHTML += '<div class="sendMessage">' + message + '</div>';
    console.scrollTop = console.scrollHeight;
}

// setInterval(function () {
//     fetch('https://webhook-store.sendios.co/pop/17125/' + btoa(email))
//         .then(function (response) {
//             response.json().then(events => events.forEach(function (event) {
//                 let message = '📊&nbsp;' + event.event;
//                 if (event.mail_id !== undefined) {
//                     message += ' email #' + event.mail_id;
//                 }
//                 writeConsole(message)
//             }));
//         })
//         .catch(response => console.log(response.status));
// }, 3000)
















