let projectId = 17125;
let email;
let userId;
let main_content = document.getElementById('main_content');
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
    writeConsole("It's chat-like log of requests to our API and Webhooks to your analytics", true);
    // next regThanksController
}

async function regFixEmailController() {
    renderTemplate('reg', false);
    document.getElementById('emailError').style.display = 'block';
}

async function regThanksController() {
    let typeId = 1;
    renderTemplate('regThanks', false);
    registerEventClick('okRegThanks', function () {
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
        }).then(function (){
            request('user/project/' + projectId + '/email/' + email).then(function (data){
                userId = data.user.id;
                writeConsole('Sendios user ID is ' + userId, true);
            })
        });
        confirmController();
    })
}

async function confirmController() {
    renderTemplate('confirm', false);
}

async function loginController(emailBase) {
    email = atob(emailBase);
    renderTemplate('login');
    let data = await request('user/project/' + projectId + '/email/' + email)
    userId = data.user.id;
    writeConsole('Sendios user ID is ' + userId, true);
    request('users/' + userId + '/online', 'PUT', {
        "timestamp": "2010-01-01T08:15:30-01:00",
        'user_id': userId,
    }, 'https://api-proxy.sendios.co/v3/');

}

async function paymentController() {
    renderTemplate('payment');
    registerEventClick('payment', function () {
        request('lastpayment', 'POST', {
            'user_id': userId,
            "start_date": "1509617696",
            "expire_date": "1609617696",
            "total_count": "14",
        })
        finishController();
    });
}

async function finishController() {
    renderTemplate('finish');
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
    let code = document.getElementById(name + '_template').innerHTML;
    if (code) {
        main_content.innerHTML = code;
    }
    currentTemplate = name;
}

registerEvent('submit', 'fruit_form', function (event) {
    let fruit = event.target.elements.fruit.value;
    request('userfields/project/' + projectId + '/email/' + email, 'PUT', {
        'fruit': fruit,
    })
    paymentController();
    return false;
});

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
                writeConsole('Email status: ' + emailStatus, true);

                if (data.valid) {
                    regThanksController();
                } else {
                    regFixEmailController();
                }
            });
        return false;
    }
);


async function request(method = '', httpMethod = 'GET', data = {}, host = '') {
    let body;
    if (httpMethod === 'POST' || httpMethod === 'PUT') {
        body = JSON.stringify(data)
    }
    let consoleText = '️&nbsp;' + method;
    if (body) {
        consoleText += '&nbsp;' + body;
    }
    writeConsole(consoleText);

    // switch (method) {
    //     case "email/check":
    //         return {'email': 'ander@gmail.com'};
    //     case "user/project/17125/email/ander@gmail.com":
    //         return {'user': {'id': 123}};
    //     case "push/system":
    //         return {};
    //     case "users/123/online":
    //         return {};
    //     case "userfields/project/17125/email/ander@gmail.com":
    //         return {};
    //     case "lastpayment":
    //         return {};
    // }

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
        writeConsole('API request or Network error', true);
    });

    if (response) {
        return await response.json().then(function (data) {
            return data.data;
        })
    }
}

function writeConsole(message, isReply = false) {
    let console = document.getElementById("console");
    let messageType;

    if (isReply) {
        messageType = 'reply';
    } else {
        messageType = 'send';
    }
    console.innerHTML += '<div class="' + messageType + 'Message">' + message + '</div>';
    console.scrollTop = console.scrollHeight;
}

setInterval(function () {
    fetch('https://webhook-store.sendios.co/pop/17125/' + btoa(email))
        .then(function (response) {
            response.json().then(events => events.forEach(function (event) {
                let message = '📊&nbsp;' + event.event;
                if (event.mail_id !== undefined) {
                    message += ' email #' + event.mail_id;
                }
                writeConsole(message, true);
            }));
        })
        .catch(response => console.log(response.status));
}, 3000)












