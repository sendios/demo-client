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
    writeConsole("It's chat-like log of <br>&#9881; requests to our API <br>&#128202;Webhooks to your analytics", true);
    // next confirmController
}

async function regFixEmailController() {
    document.getElementById('emailError').style.display = 'block';
    // next confirmController
}

async function confirmController() {
    renderTemplate('confirm', {'email': email});

    let typeId = 4000; // confirm letter
    request('push/system', 'POST', {
        'type_id': typeId,
        'project_id': projectId,
        'category': 1,
        'client_id': 134933,
        'data': {
            'user': {
                'email': email,
            },
            'link': 'https://demo-client.sendios.co/login/' + btoa(email),
        }
    }).then(function () {
        request('user/project/' + projectId + '/email/' + email).then(function (data) {
            userId = data.user.id;
            writeConsole('Sendios user ID is ' + userId, true);
        })
    });
    // next loginController
}

async function loginController(emailBase) {
    email = atob(emailBase);
    renderTemplate('login', {'email': email});

    let data = await request('user/project/' + projectId + '/email/' + email)
    userId = data.user.id;
    writeConsole('Sendios user ID is ' + userId, true);
    request('users/' + userId + '/online', 'PUT', {
        "timestamp": new Date().toLocaleString(),
        'user_id': userId,
    }, 'https://api-proxy.sendios.co/v3/');
    // next paymentController
}

async function paymentController() {
    renderTemplate('payment');
    registerEventClick('payment', function () {
        request('lastpayment', 'POST', {
            'user_id': userId,
            "start_date": Math.floor(Date.now() / 1000), // @TODO
            "expire_date": Math.floor(Date.now() / 1000) + 60*5
        })
        let typeId = 4001; // payment letter
        request('push/system', 'POST', {
            'type_id': typeId,
            'project_id': projectId,
            'category': 1,
            'client_id': 134933,
            'data': {
                'user': {
                    'email': email,
                },
                'link': 'https://demo-client.sendios.co/login/' + btoa(email),
            }
        })
        finishController();
    });
    // next finishController
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


function renderTemplate(name, variables = false) {
    if (name === currentTemplate && !rerender) {
        return;
    }
    let code = document.getElementById(name + '_template').innerHTML;

    if (variables !== false) {
        Object.keys(variables).forEach(function (key) {
            code = code.replace('{{ ' + key + ' }}', variables[key]);
        });
    }

    if (code) {
        main_content.innerHTML = code;
    }
    currentTemplate = name;
}

registerEvent('submit', 'fruit_form', function (event) {
    let fruit = event.target.elements.fruit.value;
    request('userfields/project/' + projectId + '/email/' + email, 'PUT', {
        'fav_fruit': fruit,
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
                    confirmController();
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
    let consoleText = '&#9881;&nbsp;' + method;

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
    let consoleMessages = document.getElementById("consoleMessages");
    let console = document.getElementById("console");
    let messageType;

    if (isReply) {
        messageType = 'reply';
    } else {
        messageType = 'send';
    }
    consoleMessages.innerHTML += '<div class="' + messageType + 'Message">' + message + '</div>';
    console.scrollTop = console.scrollHeight;
}

setInterval(function () {
    fetch('https://webhook-store.sendios.co/pop/' + projectId + '/' + btoa(email))
        .then(function (response) {
            response.json().then(events => events.forEach(function (event) {
                let message = '&#128202;&nbsp;' + event.event;
                if (event.mail_id !== undefined) {
                    message += ' email #' + event.mail_id;
                }
                writeConsole(message, true);
            }));
        })
        .catch(response => console.log(response.status));
}, 3000)












