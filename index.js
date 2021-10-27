let projectId = 17125;
let typeId = 1;
let email;
let userId;


document.getElementById('email_form').onsubmit = function (event) {
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
            writeConsole('Email status: ' + emailStatus);

            request('user/project/' + projectId + '/email/' + email)
                .then(function (data) {
                    userId = data.user.id;
                    writeConsole('Sendios user ID is ' + userId)
                });
        });
    return false;
};


document.getElementById('payment').onclick = function () {
    request('lastpayment', 'POST', {
        'user_id': userId,
        "start_date": "1509617696",
        "expire_date": "1609617696",
        "total_count": "14",
    })
}

document.getElementById('send').onclick = function () {
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
        request('user/project/' + projectId + '/email/' + email)
            .then(function (data) {
                userId = data.user.id;
                writeConsole('Sendios user ID is ' + userId)
            });
    });
}

document.getElementById('field').onclick = function () {
    request('userfields/project/' + projectId + '/email/' + email, 'PUT', {
        'fruit': 'banana',
    }).then(function (){
        request('userfields/project/' + projectId + '/email/' + email, 'GET')
            .then(function (data) {console.log(data)});
    });
}

document.getElementById('online').onclick = function () {
    request('users/' + userId + '/online', 'PUT', {
        "timestamp": "2010-01-01T08:15:30-01:00",
        'user_id': userId,
    }, 'https://api-proxy.sendios.co/v3/');
}


async function request(method = '', httpMethod = 'GET', data = {}, host = '') {
    let body;
    if (httpMethod === 'POST' || httpMethod === 'PUT') {
        body = JSON.stringify(data)
    }
    let consoleText = '➡️&nbsp;' + method;
    if (body) {
        consoleText += '&nbsp;' + body;
    }

    writeConsole(consoleText);

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
    });


    return await response.json().then(function (data) {
        return data.data;
    });
}

function writeConsole(message) {
    let console = document.getElementById("console");
    console.innerHTML += message + '<br>';
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
                writeConsole(message)
            }));
        })
        .catch(response => console.log(response.status));
}, 3000)
















